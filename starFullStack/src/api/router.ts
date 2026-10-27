import type { IncomingMessage, ServerResponse } from "http";
import { HttpError } from "../errors";

/** O que o handler recebe já extraído da URL. */
export type RouteContext = {
    /** Grupos nomeados do pattern, ex.: /api/(?<resource>[a-z]+) -> { resource: "people" } */
    params: Record<string, string>;
    /** Query string da requisição, ex.: ?page=2&search=luke */
    query: URLSearchParams;
};

export type Handler = (
    ctx: RouteContext,
    res: ServerResponse
) => Promise<void> | void;

export type Route = {
    /** Método HTTP aceito. */
    method: string;
    /** Regex sobre o pathname, sem a flag `g` (exec com `g` é stateful). */
    pattern: RegExp;
    handler: Handler;
};

/** Responde JSON com status e content-length corretos. */
export function json(res: ServerResponse, status: number, body: unknown): void {
    const payload = JSON.stringify(body);
    res.writeHead(status, {
        "content-type": "application/json; charset=utf-8",
        "content-length": Buffer.byteLength(payload),
    });
    res.end(payload);
}

function toParams(groups: Record<string, string | undefined> | undefined): Record<string, string> {
    const params: Record<string, string> = {};
    for (const [key, value] of Object.entries(groups ?? {})) {
        if (value !== undefined) params[key] = value;
    }
    return params;
}

/**
 * Resolve a requisição contra a tabela de rotas.
 *
 * - rota + método batem            -> executa o handler
 * - rota existe, método não        -> 405 + header Allow
 * - nenhuma rota bate              -> 404
 * - handler lança erro             -> 500 (uma vez só, no roteador)
 */
export async function dispatch(
    routes: Route[],
    req: IncomingMessage,
    res: ServerResponse
): Promise<void> {
    const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
    const path = url.pathname.replace(/\/+$/, "") || "/";
    const method = (req.method ?? "GET").toUpperCase();

    const matched: Array<{ route: Route; params: Record<string, string> }> = [];

    for (const route of routes) {
        const match = route.pattern.exec(path);
        if (match) {
            matched.push({ route, params: toParams(match.groups) });
        }
    }

    if (matched.length === 0) {
        json(res, 404, { erro: "Rota não encontrada", path });
        return;
    }

    const allowed = matched.filter(({ route }) => route.method === method);

    if (allowed.length === 0) {
        res.setHeader("allow", matched.map(({ route }) => route.method).join(", "));
        json(res, 405, { erro: "Método não permitido", metodo: method });
        return;
    }

    const [{ route, params }] = allowed;

    try {
        await route.handler({ params, query: url.searchParams }, res);
    } catch (error) {
        console.error(error);

        if (res.headersSent) return;

        if (error instanceof HttpError) {
            json(res, error.status, { erro: error.message, detalhe: error.detail });
            return;
        }

        json(res, 500, { erro: "Falha ao buscar dados" });
    }
}
