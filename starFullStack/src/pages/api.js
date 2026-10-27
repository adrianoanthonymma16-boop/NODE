/**
 * Única porta de saída do frontend: a API do próprio backend, na mesma origem.
 *
 * O cliente não conhece a SWAPI, não resolve referências e não formata nada:
 * `listar()` e `carregar()` devolvem o que o backend já tratou.
 */
const Api = (() => {
    const BASE = "/api";

    let controlador = null;

    async function requisitar(url, sinal) {
        let resposta;

        try {
            resposta = await fetch(url, {
                signal: sinal,
                headers: { accept: "application/json" },
            });
        } catch (erro) {
            if (erro.name === "AbortError") throw erro;

            throw new Error(
                "Não foi possível falar com a API (/api). Verifique se o servidor está rodando (npm run start:watch)."
            );
        }

        const corpo = await resposta.json().catch(() => null);

        if (!resposta.ok) {
            const erro = new Error(corpo?.erro ?? `A API respondeu ${resposta.status}.`);
            erro.status = resposta.status;
            throw erro;
        }

        return corpo;
    }

    /**
     * Lista um recurso. Cancela a consulta anterior: paginar rápido não
     * deixa resposta antiga sobrescrever a nova.
     */
    async function listar(recurso, { pagina = 1, busca = "" } = {}) {
        if (controlador) controlador.abort();
        controlador = new AbortController();

        const parametros = new URLSearchParams();
        if (pagina > 1) parametros.set("page", String(pagina));
        if (busca) parametros.set("search", busca);

        const consulta = parametros.toString();
        const url = `${BASE}/${recurso}${consulta ? `?${consulta}` : ""}`;

        return requisitar(url, controlador.signal);
    }

    /** Ficha completa de um registro, já formatada pelo backend. */
    function carregar(recurso, id) {
        return requisitar(`${BASE}/${recurso}/${id}`);
    }

    return { BASE, listar, carregar };
})();
