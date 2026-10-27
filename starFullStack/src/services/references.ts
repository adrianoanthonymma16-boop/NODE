import { getRecord } from "./service-starWars";
import { RECURSOS, ehRecurso, type Slug } from "../presentation/schema";

/** Um registro citado por outro, já com o nome resolvido. */
export type Referencia = {
    /** Coleção do registro referenciado (people, films...). */
    recurso: Slug;
    /** Id dentro da coleção. */
    id: string;
    /** Nome pronto para exibição — o cliente não busca nada para montar o chip. */
    nome: string;
};

/** ".../api/people/1/" -> { recurso: "people", id: "1" } */
export function partesDaUrl(url: unknown): { recurso: Slug; id: string } | null {
    if (typeof url !== "string") return null;

    const achado = /\/api\/([a-z]+)\/(\d+)\/?$/.exec(url);
    if (!achado) return null;

    const [, recurso, id] = achado;
    return ehRecurso(recurso) ? { recurso, id } : null;
}

/**
 * Cache de nomes resolvidos. O conjunto da SWAPI é pequeno e estável:
 * um registro por chave, sem expiração.
 */
const cache = new Map<string, Promise<Referencia>>();

/** Quantas requisições simultâneas disparamos para a origem. */
const LIMITE = 8;

let ativas = 0;
const fila: Array<() => void> = [];

function comLimite<T>(tarefa: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolver, rejeitar) => {
        const executar = () => {
            ativas += 1;
            tarefa()
                .then(resolver, rejeitar)
                .finally(() => {
                    ativas -= 1;
                    fila.shift()?.();
                });
        };

        if (ativas < LIMITE) executar();
        else fila.push(executar);
    });
}

function nomeDe(recurso: Slug, id: string, item: unknown): string {
    const { titulo, singular } = RECURSOS[recurso];
    const bruto = (item as Record<string, unknown> | null)?.[titulo];
    const nome = typeof bruto === "string" ? bruto.trim() : "";

    return nome || `${singular} #${id}`;
}

/** Busca (ou reaproveita do cache) o nome de um registro referenciado. */
function buscar(recurso: Slug, id: string): Promise<Referencia> {
    const chave = `${recurso}/${id}`;

    const existente = cache.get(chave);
    if (existente) return existente;

    const pedido = comLimite(async () => {
        const item = await getRecord(recurso, id);
        return { recurso, id, nome: nomeDe(recurso, id, item) };
    }).catch((erro: unknown) => {
        // Referência quebrada não derruba a ficha inteira: cai no rótulo genérico.
        console.warn(`Referência ${chave} indisponível:`, (erro as Error)?.message);
        cache.delete(chave); // permite tentar de novo na próxima requisição
        return { recurso, id, nome: `${RECURSOS[recurso].singular} #${id}` };
    });

    cache.set(chave, pedido);
    return pedido;
}

/** Resolve uma lista de URLs em referências nomeadas, na ordem recebida. */
export function resolverReferencias(urls: readonly unknown[]): Promise<Referencia[]> {
    const alvos = urls
        .map((url) => partesDaUrl(url))
        .filter((alvo): alvo is { recurso: Slug; id: string } => alvo !== null);

    return Promise.all(alvos.map(({ recurso, id }) => buscar(recurso, id)));
}
