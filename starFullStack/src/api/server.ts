import * as http from "http";
import type { IncomingMessage, ServerResponse } from "http";
import { handle } from "./controllers/api-controller";
import { serveStatic } from "./static";

const server = http.createServer(
    async (req: IncomingMessage, res: ServerResponse) => {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");

        const { pathname } = new URL(
            req.url ?? "/",
            `http://${req.headers.host ?? "localhost"}`
        );

        // /api vai para o controller; o resto é página estática em src/pages
        const ehApi = pathname === "/api" || pathname.startsWith("/api/");

        try {
            if (ehApi) {
                await handle(req, res);
                return;
            }

            const serviu = await serveStatic(req, res);

            if (!serviu && !res.headersSent) {
                res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
                res.end("Not Found");
            }
        } catch (error) {
            console.error(error);

            if (!res.headersSent) {
                res.writeHead(500, { "content-type": "application/json; charset=utf-8" });
                res.end(JSON.stringify({ erro: "Erro interno" }));
            }
        }
    }
);

const PORTSERVER = process.env.PORT || 3333;

server.listen(PORTSERVER, () => {
    console.log(`Servidor iniciado em http://localhost:${PORTSERVER}`);
});
