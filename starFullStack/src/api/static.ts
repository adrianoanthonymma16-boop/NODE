import { createReadStream, existsSync } from "node:fs";
import { stat } from "node:fs/promises";
import { extname, join, resolve, sep } from "node:path";
import { pipeline } from "node:stream/promises";
import type { IncomingMessage, ServerResponse } from "http";

/**
 * Pasta das páginas. Funciona rodando com tsx (src/api -> src/pages) e a partir
 * de um build em dist/ (cai para o diretório atual do projeto).
 */
const PAGINAS = [
    resolve(__dirname, "..", "pages"),
    resolve(process.cwd(), "src", "pages"),
].find((caminho) => existsSync(caminho));

const TIPOS: Record<string, string> = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".ico": "image/x-icon",
    ".woff2": "font/woff2",
};

/**
 * Serve um arquivo de src/pages.
 * Devolve true quando respondeu algo e false quando a rota não é um arquivo
 * (aí o chamador decide o 404).
 */
export async function serveStatic(
    req: IncomingMessage,
    res: ServerResponse
): Promise<boolean> {
    if (!PAGINAS) return false;
    if (req.method !== "GET" && req.method !== "HEAD") return false;

    let caminho: string;
    try {
        caminho = decodeURIComponent((req.url ?? "/").split("?")[0]);
    } catch {
        return false; // % inválido na URL
    }

    const relativo = caminho === "/" ? "index.html" : caminho.replace(/^\/+/, "");
    const arquivo = resolve(join(PAGINAS, relativo));

    // Impede sair da pasta de páginas (../, ..%2f, etc.)
    if (arquivo !== PAGINAS && !arquivo.startsWith(PAGINAS + sep)) return false;

    let info;
    try {
        info = await stat(arquivo);
    } catch {
        return false; // não existe
    }

    if (!info.isFile()) return false;

    res.writeHead(200, {
        "content-type": TIPOS[extname(arquivo).toLowerCase()] ?? "application/octet-stream",
        "content-length": info.size,
        "cache-control": "no-cache",
    });

    if (req.method === "HEAD") {
        res.end();
        return true;
    }

    try {
        await pipeline(createReadStream(arquivo), res);
    } catch (error) {
        // Cabeçalho já foi enviado: não dá para virar 404, só encerrar.
        console.error(error);
        res.destroy();
    }

    return true;
}
