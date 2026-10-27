/**
 * Transforma os registros crus da SWAPI no formato que o frontend consome.
 *
 * Toda a decisão de apresentação mora aqui: título, rótulos, formatação de
 * valores, ordem dos campos e resolução das referências (nomes dos chips).
 * O cliente recebe texto pronto e só monta o DOM.
 */

import { RECURSOS, VAZIO, formatar, rotulo, type Slug } from "./schema";
import {
    partesDaUrl,
    resolverReferencias,
    type Referencia,
} from "../services/references";

/** Tamanho de página da SWAPI — o cliente não precisa saber disso. */
export const ITENS_POR_PAGINA = 10;

type Bruto = Record<string, unknown>;

/** Campo destacado no card. */
export type Destaque = {
    rotulo: string;
    valor: string;
};

export type Card = {
    id: string;
    titulo: string;
    destaques: Destaque[];
};

/** Campo da ficha. O `tipo` diz ao cliente como renderizar. */
export type Campo =
    | { chave: string; rotulo: string; tipo: "texto"; valor: string; vazio: boolean }
    | { chave: string; rotulo: string; tipo: "paragrafos"; valor: string[] }
    | { chave: string; rotulo: string; tipo: "link"; valor: string }
    | { chave: string; rotulo: string; tipo: "referencias"; referencias: Referencia[] };

export type Ficha = {
    recurso: { slug: Slug; singular: string; plural: string };
    id: string;
    titulo: string;
    campos: Campo[];
};

export type Lista = {
    recurso: { slug: Slug; singular: string; plural: string };
    /** Termo de busca aplicado, ou null. */
    busca: string | null;
    pagina: number;
    totalPaginas: number;
    total: number;
    temAnterior: boolean;
    temProximo: boolean;
    itens: Card[];
};

function idDe(item: Bruto): string {
    const url = typeof item.url === "string" ? item.url : "";
    const achado = /\/(\d+)\/?$/.exec(url);
    return achado ? achado[1] : "";
}

function tituloDe(recurso: Slug, item: Bruto): string {
    const bruto = item[RECURSOS[recurso].titulo];
    const texto = typeof bruto === "string" ? bruto.trim() : "";

    return texto || `Registro ${idDe(item)}`.trim();
}

/** Card da listagem: título + os destaques do recurso. */
export function paraCard(recurso: Slug, item: Bruto): Card {
    return {
        id: idDe(item),
        titulo: tituloDe(recurso, item),
        destaques: RECURSOS[recurso].destaques.map((chave) => ({
            rotulo: rotulo(chave),
            valor: formatar(chave, item[chave]),
        })),
    };
}

/**
 * A SWAPI quebra o texto de abertura em ~40 colunas. Junta as linhas de cada
 * parágrafo e devolve um parágrafo por item.
 */
function paragrafos(texto: string): string[] {
    return texto
        .replace(/\r\n/g, "\n")
        .split(/\n{2,}/)
        .map((paragrafo) => paragrafo.replace(/\s+/g, " ").trim())
        .filter(Boolean);
}

/**
 * Ficha completa: todas as chaves que o registro devolve, na ordem original,
 * com a URL do registro no fim.
 */
export async function paraFicha(recurso: Slug, item: Bruto): Promise<Ficha> {
    const cfg = RECURSOS[recurso];
    const id = idDe(item);

    // Slots aceitam campo pronto ou promise: as referências resolvem em paralelo
    // e o Promise.all preserva a ordem original dos campos.
    const campos: Array<Campo | Promise<Campo>> = [];

    for (const chave of Object.keys(item)) {
        if (chave === cfg.titulo || chave === "url") continue;

        const valor = item[chave];
        const rot = rotulo(chave);

        if (Array.isArray(valor)) {
            campos.push(
                resolverReferencias(valor).then((referencias) => ({
                    chave,
                    rotulo: rot,
                    tipo: "referencias" as const,
                    referencias,
                }))
            );
            continue;
        }

        // Campo único que aponta para outro registro (ex.: planeta natal)
        if (partesDaUrl(valor)) {
            campos.push(
                resolverReferencias([valor]).then((referencias) => ({
                    chave,
                    rotulo: rot,
                    tipo: "referencias" as const,
                    referencias,
                }))
            );
            continue;
        }

        if (chave === "opening_crawl") {
            campos.push({
                chave,
                rotulo: rot,
                tipo: "paragrafos",
                valor: paragrafos(String(valor)),
            });
            continue;
        }

        const texto = formatar(chave, valor);

        campos.push({
            chave,
            rotulo: rot,
            tipo: "texto",
            valor: texto,
            vazio: texto === VAZIO,
        });
    }

    return {
        recurso: { slug: recurso, singular: cfg.singular, plural: cfg.plural },
        id,
        titulo: tituloDe(recurso, item),
        campos: [
            ...(await Promise.all(campos)),
            {
                chave: "json",
                rotulo: rotulo("json"),
                tipo: "link",
                valor: `/api/${recurso}/${id}`,
            },
        ],
    };
}

/** Resposta da listagem: paginação calculada + cards prontos. */
export function paraLista(
    recurso: Slug,
    dados: unknown,
    { pagina, busca }: { pagina: number; busca: string }
): Lista {
    const bruto = (dados ?? {}) as {
        count?: number;
        previous?: unknown;
        next?: unknown;
        results?: unknown;
    };

    const itens = Array.isArray(bruto.results) ? (bruto.results as Bruto[]) : [];
    const total = Number(bruto.count ?? itens.length);
    const cfg = RECURSOS[recurso];

    return {
        recurso: { slug: recurso, singular: cfg.singular, plural: cfg.plural },
        busca: busca || null,
        pagina,
        totalPaginas: Math.max(1, Math.ceil(total / ITENS_POR_PAGINA)),
        total,
        temAnterior: Boolean(bruto.previous),
        temProximo: Boolean(bruto.next),
        itens: itens.map((item) => paraCard(recurso, item)),
    };
}
