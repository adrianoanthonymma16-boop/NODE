import { HttpError } from "../errors";

type ApiRoot = Record<string, string>;

function getApiUrl(): string {
    const url = process.env.API;
    if (!url) {
        throw new Error("Environment variable API is not defined");
    }
    return url;
}

/**
 * Busca JSON na origem.
 * A mensagem de erro é escrita para o cliente final: não vaza a URL da SWAPI
 * nem a topologia interna, só o que aconteceu.
 */
async function fetchJson(url: string, alvo: string): Promise<unknown> {
    const response = await fetch(url, { method: "GET" });

    if (!response.ok) {
        throw new HttpError(
            response.status,
            response.status === 404 ? `${alvo} não encontrado` : "Falha ao consultar a origem",
            `A origem respondeu ${response.status}`
        );
    }

    return response.json();
}

/**
 * O root da API é sempre o mesmo: busca uma vez e reaproveita a promise.
 * Se a primeira tentativa falhar, o cache é limpo para a próxima poder tentar de novo.
 */
let rootCache: Promise<ApiRoot> | undefined;

function getRoot(): Promise<ApiRoot> {
    if (!rootCache) {
        rootCache = fetchJson(getApiUrl(), "A API de origem") as Promise<ApiRoot>;
        rootCache.catch(() => {
            rootCache = undefined;
        });
    }
    return rootCache;
}

/** Resolve o endpoint de uma coleção a partir do root (ex.: "people" -> ".../people/"). */
async function endpointFor(uri: string): Promise<URL> {
    const root = await getRoot();
    const endpoint = root[uri];

    if (!endpoint) {
        throw new HttpError(404, `Recurso "${uri}" não encontrado`, "Não existe no root da API");
    }

    return new URL(endpoint);
}

async function fetchResource(target: URL, alvo: string, query?: URLSearchParams) {
    // Repassa page/search/... da requisição para a SWAPI.
    if (query) {
        for (const [key, value] of query) {
            target.searchParams.set(key, value);
        }
    }

    return fetchJson(target.toString(), alvo);
}

/** Coleção completa (com paginação/busca). */
export async function getRepository(uri: string, query?: URLSearchParams) {
    return fetchResource(await endpointFor(uri), `O recurso "${uri}"`, query);
}

/** Um registro específico da coleção (ex.: people/1). */
export async function getRecord(uri: string, id: string, query?: URLSearchParams) {
    const target = await endpointFor(uri);
    target.pathname = `${target.pathname.replace(/\/+$/, "")}/${encodeURIComponent(id)}/`;

    return fetchResource(target, `O registro ${uri}/${id}`, query);
}
