import type { IncomingMessage, ServerResponse } from "http";
import { dispatch, json, type Route } from "../router";
import { getRecord, getRepository } from "../../services/service-starWars";
import { paraFicha, paraLista } from "../../presentation/serialize";
import { ehRecurso, type Slug } from "../../presentation/schema";

/** Valida o recurso da rota; responde 404 e devolve null quando não existe. */
function resolverRecurso(valor: string, res: ServerResponse): Slug | null {
    if (ehRecurso(valor)) return valor;

    json(res, 404, { erro: `Recurso "${valor}" não encontrado` });
    return null;
}

/** `?page=` saneado: inteiro positivo, 1 quando ausente ou inválido. */
function lerPagina(query: URLSearchParams): number {
    const numero = Number(query.get("page"));

    return Number.isInteger(numero) && numero > 0 ? numero : 1;
}

/**
 * Tabela de rotas: adicionar um endpoint = adicionar uma entrada aqui.
 * Nenhum `if` por rota.
 */
const routes: Route[] = [
    {
        method: "GET",
        // /api/people, /api/films, /api/planets... -> params.resource
        pattern: /^\/api\/(?<resource>[a-z]+)$/,
        handler: async ({ params, query }, res) => {
            const recurso = resolverRecurso(params.resource, res);
            if (!recurso) return;

            const pagina = lerPagina(query);
            const busca = (query.get("search") ?? "").trim();

            // Só page e search seguem para a origem: o cliente não escolhe a URL.
            const repasse = new URLSearchParams();
            if (pagina > 1) repasse.set("page", String(pagina));
            if (busca) repasse.set("search", busca);

            const dados = await getRepository(recurso, repasse);

            json(res, 200, paraLista(recurso, dados, { pagina, busca }));
        },
    },
    {
        method: "GET",
        // /api/people/1 -> params.resource = people, params.id = 1
        pattern: /^\/api\/(?<resource>[a-z]+)\/(?<id>\d+)$/,
        handler: async ({ params }, res) => {
            const recurso = resolverRecurso(params.resource, res);
            if (!recurso) return;

            const item = await getRecord(recurso, params.id);

            json(res, 200, await paraFicha(recurso, item as Record<string, unknown>));
        },
    },
];

export async function handle(
    req: IncomingMessage,
    res: ServerResponse
): Promise<void> {
    await dispatch(routes, req, res);
}
