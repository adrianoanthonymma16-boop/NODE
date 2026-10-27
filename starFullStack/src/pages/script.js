/**
 * App do explorador.
 *
 * O backend entrega tudo pronto: título, rótulos, valores formatados, paginação
 * e referências já com nome. Aqui só montamos o DOM — nenhum dado da SWAPI é
 * interpretado, formatado ou buscado no cliente.
 */
(() => {
    "use strict";

    /* ---------- Elementos ---------- */

    const campo = document.querySelector(".search__input");
    const formularioBusca = document.querySelector(".search");
    const botaoLupa = document.querySelector(".search__toggle");

    const logo = document.getElementById("logoTitulo");
    const inicio = document.getElementById("inicio");
    const resultados = document.getElementById("resultados");
    const resultadoTitulo = document.getElementById("resultado-titulo");
    const resultadoMeta = document.getElementById("resultado-meta");
    const limparBuscaBotao = document.getElementById("limpar-busca");
    const limparBuscaTermo = document.getElementById("limpar-busca-termo");
    const status = document.getElementById("status");
    const grade = document.getElementById("grade");
    const aviso = document.getElementById("aviso");
    const avisoTitulo = document.getElementById("aviso-titulo");
    const avisoTexto = document.getElementById("aviso-texto");
    const avisoAcao = document.getElementById("aviso-acao");
    const paginacao = document.getElementById("paginacao");
    const anterior = document.getElementById("anterior");
    const proxima = document.getElementById("proxima");
    const paginaAtual = document.getElementById("pagina-atual");

    const ficha = document.getElementById("ficha");
    const fichaTipo = document.getElementById("ficha-tipo");
    const fichaTitulo = document.getElementById("ficha-titulo");
    const fichaAviso = document.getElementById("ficha-aviso");
    const fichaCampos = document.getElementById("ficha-campos");
    const fichaFechar = document.getElementById("ficha-fechar");
    const fichaVoltar = document.getElementById("ficha-voltar");

    /* ---------- Estado ---------- */

    const estado = { recurso: null, termo: "", pagina: 1 };
    const pilha = []; // fichas abertas, para o botão Voltar
    let requisicao = 0; // descarta resposta antiga da listagem
    let requisicaoFicha = 0; // idem para a ficha
    let fichaComErro = false;

    /* ---------- Helpers de DOM ---------- */

    function el(tag, props = {}, ...filhos) {
        const no = document.createElement(tag);

        for (const [chave, valor] of Object.entries(props)) {
            if (valor === undefined || valor === null) continue;
            if (chave === "class") no.className = valor;
            else if (chave === "texto") no.textContent = String(valor);
            else no.setAttribute(chave, String(valor));
        }

        if (filhos.length) no.append(...filhos);
        return no;
    }

    function icone(id) {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("class", "icone");
        svg.setAttribute("aria-hidden", "true");
        svg.setAttribute("focusable", "false");

        if (id) {
            const uso = document.createElementNS("http://www.w3.org/2000/svg", "use");
            uso.setAttribute("href", `#i-${id}`);
            svg.append(uso);
        }

        return svg;
    }

    /* ---------- Busca (abrir/fechar) ---------- */

    const estaAberta = () => formularioBusca.classList.contains("is-open");

    function abrirBusca() {
        formularioBusca.classList.add("is-open");
        botaoLupa.setAttribute("aria-expanded", "true");
        botaoLupa.setAttribute("aria-label", "Fechar pesquisa");
        campo.focus();
    }

    function fecharBusca({ devolverFoco = false } = {}) {
        formularioBusca.classList.remove("is-open");
        botaoLupa.setAttribute("aria-expanded", "false");
        botaoLupa.setAttribute("aria-label", "Abrir pesquisa");
        campo.value = "";

        if (devolverFoco) botaoLupa.focus();
    }

    /* ---------- Navegação ---------- */

    /**
     * O hash é a categoria (`#people`, `#films`...). Âncoras da própria página
     * (ex.: `#conteudo` do skip link) não são rota.
     */
    function recursoDoHash() {
        let bruto = "";

        try {
            bruto = decodeURIComponent(location.hash.replace(/^#\/?/, "")).trim();
        } catch {
            return null;
        }

        if (!bruto || document.getElementById(bruto)) return null;
        return bruto;
    }

    function navegar(recurso, { termo = "", rolar = false, historico = true } = {}) {
        estado.recurso = recurso;
        estado.termo = termo;
        estado.pagina = 1;
        campo.value = termo;

        if (historico) {
            const alvo = recurso ? `#${recurso}` : `${location.pathname}${location.search}`;
            const atual = `${location.pathname}${location.search}${location.hash}`;

            if (alvo !== atual) {
                try {
                    history.pushState({ recurso }, "", alvo);
                } catch {
                    if (recurso) location.hash = recurso;
                }
            }
        }

        if (!recurso) {
            mostrarInicio();
            return;
        }

        mostrarResultados();
        carregar({ rolar });
    }

    function marcarAtivo(recurso) {
        document.querySelectorAll("[data-rota]").forEach((elemento) => {
            if (elemento.dataset.rota === recurso) {
                elemento.setAttribute("aria-current", "page");
            } else {
                elemento.removeAttribute("aria-current");
            }
        });
    }

    function mostrarInicio() {
        inicio.hidden = false;
        resultados.hidden = true;
        document.title = "Star Wars · Explorador da galáxia";
        marcarAtivo(null);
    }

    function mostrarResultados() {
        inicio.hidden = true;
        resultados.hidden = false;
        marcarAtivo(estado.recurso);
    }

    /* ---------- Listagem ---------- */

    async function carregar({ rolar = false } = {}) {
        if (!estado.recurso) return;

        const token = ++requisicao;

        esconderAviso();
        grade.replaceChildren(...esqueletos(8));
        grade.setAttribute("aria-busy", "true");
        status.textContent = "Carregando…";
        resultadoTitulo.textContent = "Resultados";
        resultadoMeta.textContent = "";
        document.title = "Carregando… · Star Wars";
        paginacao.hidden = true;
        atualizarChipBusca();

        try {
            const dados = await Api.listar(estado.recurso, {
                pagina: estado.pagina,
                busca: estado.termo,
            });

            if (token !== requisicao) return; // resposta antiga, descarta

            renderizarLista(dados);
            if (rolar) rolarParaResultados();
        } catch (erro) {
            if (token !== requisicao || erro.name === "AbortError") return;
            renderizarErro(erro);
        }
    }

    function atualizarChipBusca() {
        limparBuscaBotao.hidden = !estado.termo;

        if (estado.termo) {
            limparBuscaTermo.textContent = `“${estado.termo}”`;
            limparBuscaBotao.setAttribute("aria-label", `Limpar busca por ${estado.termo}`);
        }
    }

    function renderizarLista(dados) {
        const { recurso, itens } = dados;

        grade.replaceChildren();
        grade.setAttribute("aria-busy", "false");

        resultadoTitulo.textContent = recurso.plural;
        document.title = `${recurso.plural} · Star Wars`;
        resultadoMeta.textContent = `${dados.total} ${
            dados.total === 1 ? "registro" : "registros"
        }${dados.busca ? ` para “${dados.busca}”` : ""}`;
        status.textContent = `${dados.total} ${
            dados.total === 1 ? "registro exibido" : "registros exibidos"
        }.`;

        atualizarPaginacao(dados);

        if (!itens.length) {
            mostrarAviso({
                titulo: dados.busca ? "Nada encontrado" : "Sem registros",
                texto: dados.busca
                    ? `Nenhum resultado para “${dados.busca}”. Tente outro termo ou limpe a busca.`
                    : "A API não devolveu registros para esta categoria.",
                acao: dados.busca ? "Limpar busca" : "Tentar de novo",
                aoClicar: dados.busca ? limparBusca : () => carregar({ rolar: true }),
            });
            return;
        }

        const fragmento = document.createDocumentFragment();
        itens.forEach((item, indice) => fragmento.append(criarCard(item, indice, recurso)));
        grade.append(fragmento);
    }

    function criarCard(item, indice, recurso) {
        const card = el("li", { class: "card" });
        card.style.setProperty("--atraso", `${Math.min(indice * 35, 210)}ms`);

        const corpo = el("article", { class: "card__corpo" });
        const tipo = el(
            "p",
            { class: "card__tipo" },
            icone(recurso.slug),
            el("span", { texto: recurso.singular })
        );
        const cabeca = el("h3", { class: "card__titulo", texto: item.titulo });

        const stats = el("dl", { class: "card__stats" });
        for (const destaque of item.destaques) {
            const linha = el("div", { class: "stat" });
            linha.append(
                el("dt", { texto: destaque.rotulo }),
                el("dd", { texto: destaque.valor })
            );
            stats.append(linha);
        }

        const acao = el("button", {
            type: "button",
            class: "botao card__acao",
            texto: "Ver todos os dados",
            "aria-label": `Ver todos os dados de ${item.titulo}`,
        });
        acao.addEventListener("click", () => abrirFicha(recurso.slug, item.id));

        corpo.append(tipo, cabeca, stats, acao);
        card.append(corpo);
        return card;
    }

    function esqueletos(quantidade) {
        const lista = [];

        for (let i = 0; i < quantidade; i += 1) {
            const item = el("li", { class: "card card--esqueleto" });
            item.setAttribute("aria-hidden", "true");
            item.append(
                el("span", { class: "esqueleto esqueleto--tipo" }),
                el("span", { class: "esqueleto esqueleto--titulo" }),
                el("span", { class: "esqueleto esqueleto--linha" }),
                el("span", { class: "esqueleto esqueleto--linha" })
            );
            lista.push(item);
        }

        return lista;
    }

    function atualizarPaginacao(dados) {
        paginaAtual.textContent = `Página ${dados.pagina} de ${dados.totalPaginas}`;
        anterior.disabled = !dados.temAnterior;
        proxima.disabled = !dados.temProximo;
        paginacao.hidden = dados.totalPaginas <= 1;
    }

    function renderizarErro(erro) {
        grade.replaceChildren();
        grade.setAttribute("aria-busy", "false");
        resultadoTitulo.textContent = "Resultados";
        resultadoMeta.textContent = "";
        status.textContent = "Erro ao carregar os dados.";
        paginacao.hidden = true;

        mostrarAviso({
            titulo: "Não foi possível carregar",
            texto: erro.message,
            acao: "Tentar de novo",
            aoClicar: () => carregar({ rolar: true }),
        });
    }

    function mostrarAviso({ titulo, texto, acao, aoClicar }) {
        aviso.hidden = false;
        avisoTitulo.textContent = titulo;
        avisoTexto.textContent = texto;

        if (acao) {
            avisoAcao.hidden = false;
            avisoAcao.textContent = acao;
            avisoAcao.onclick = aoClicar;
        } else {
            avisoAcao.hidden = true;
            avisoAcao.onclick = null;
        }
    }

    function esconderAviso() {
        aviso.hidden = true;
    }

    function rolarParaResultados() {
        const reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        resultados.scrollIntoView({ behavior: reduzido ? "auto" : "smooth", block: "start" });
    }

    function aplicarBusca(termo) {
        // Sem categoria escolhida, busca em personagens
        if (!estado.recurso) {
            navegar("people", { termo, rolar: true });
            return;
        }

        estado.termo = termo;
        estado.pagina = 1;
        carregar({ rolar: true });
    }

    function limparBusca() {
        estado.termo = "";
        estado.pagina = 1;
        campo.value = "";
        carregar({ rolar: true });
    }

    /* ---------- Ficha ---------- */

    async function abrirFicha(recurso, id) {
        if (!ficha.open) ficha.showModal();

        const token = ++requisicaoFicha;
        fichaComErro = false;
        mostrarFichaCarregando();

        try {
            const dados = await Api.carregar(recurso, id);
            if (token !== requisicaoFicha) return;

            pilha.push(dados);
            desenharFicha(dados);
        } catch (erro) {
            if (token !== requisicaoFicha) return;
            fichaComErro = true;
            mostrarFichaErro(erro);
        } finally {
            if (token === requisicaoFicha) atualizarVoltar();
        }
    }

    function atualizarVoltar() {
        // Com erro, "Voltar" devolve a ficha anterior (que continua na pilha).
        fichaVoltar.hidden = fichaComErro ? pilha.length === 0 : pilha.length <= 1;
    }

    function voltarFicha() {
        if (fichaComErro) {
            fichaComErro = false;
            const topo = pilha[pilha.length - 1];

            if (topo) {
                desenharFicha(topo);
                atualizarVoltar();
            } else {
                ficha.close();
            }
            return;
        }

        if (pilha.length <= 1) {
            ficha.close();
            return;
        }

        pilha.pop();
        desenharFicha(pilha[pilha.length - 1]);
        atualizarVoltar();
    }

    function mostrarFichaCarregando() {
        ficha.setAttribute("aria-busy", "true");
        fichaTipo.textContent = "";
        fichaTitulo.textContent = "Carregando…";
        fichaAviso.hidden = true;
        fichaCampos.replaceChildren(...esqueletosFicha());
        ficha.scrollTop = 0;
    }

    function esqueletosFicha() {
        const lista = [];

        for (let i = 0; i < 6; i += 1) {
            const linha = el("div", { class: "ficha__campo" });
            linha.setAttribute("aria-hidden", "true");
            linha.append(
                el("span", { class: "esqueleto esqueleto--rotulo" }),
                el("span", { class: "esqueleto esqueleto--linha" })
            );
            lista.push(linha);
        }

        return lista;
    }

    function mostrarFichaErro(erro) {
        ficha.removeAttribute("aria-busy");
        fichaTipo.textContent = "";
        fichaTitulo.textContent = "Não foi possível abrir a ficha";
        fichaCampos.replaceChildren();
        fichaAviso.textContent = erro.message;
        fichaAviso.hidden = false;
        ficha.scrollTop = 0;
    }

    /** Renderiza o que o backend mandou: nada é reinterpretado aqui. */
    function desenharFicha(dados) {
        ficha.removeAttribute("aria-busy");
        fichaAviso.hidden = true;
        fichaTipo.textContent = dados.recurso.singular;
        fichaTitulo.textContent = dados.titulo;
        fichaCampos.replaceChildren();
        ficha.scrollTop = 0;

        for (const campoFicha of dados.campos) {
            const linha = el("div", { class: "ficha__campo" });
            const dd = el("dd");
            dd.dataset.tipo = campoFicha.tipo;

            if (campoFicha.tipo === "referencias") {
                if (campoFicha.referencias.length) {
                    dd.append(criarChips(campoFicha.referencias));
                } else {
                    dd.append(el("span", { class: "vazio-valor", texto: "—" }));
                }
            } else if (campoFicha.tipo === "paragrafos") {
                dd.classList.add("ficha__abertura");
                for (const paragrafo of campoFicha.valor) {
                    dd.append(el("p", { texto: paragrafo }));
                }
            } else if (campoFicha.tipo === "link") {
                dd.append(
                    el("a", {
                        href: campoFicha.valor,
                        target: "_blank",
                        rel: "noopener noreferrer",
                        texto: "Abrir JSON ↗",
                    })
                );
            } else {
                dd.textContent = campoFicha.valor;
                if (campoFicha.vazio) dd.classList.add("vazio-valor");
            }

            linha.append(el("dt", { texto: campoFicha.rotulo }), dd);
            fichaCampos.append(linha);
        }
    }

    /** Referências chegam com o nome pronto: o chip já nasce completo. */
    function criarChips(referencias) {
        const caixa = el("div", { class: "chips" });

        for (const referencia of referencias) {
            const chip = el("button", {
                type: "button",
                class: "chip",
                texto: referencia.nome,
                "aria-label": `${referencia.nome} (${referencia.recurso} ${referencia.id})`,
            });
            chip.addEventListener("click", () => abrirFicha(referencia.recurso, referencia.id));
            caixa.append(chip);
        }

        return caixa;
    }

    /* ---------- Eventos ---------- */

    botaoLupa.addEventListener("click", () => {
        if (estaAberta()) fecharBusca({ devolverFoco: true });
        else abrirBusca();
    });

    /* Enter: no desktop não existe botão, então o próprio campo dispara o envio.
       requestSubmit() funciona mesmo com o botão "Buscar" oculto (display: none). */
    campo.addEventListener("keydown", (evento) => {
        if (evento.key !== "Enter") return;
        evento.preventDefault();
        formularioBusca.requestSubmit();
    });

    formularioBusca.addEventListener("submit", (evento) => {
        evento.preventDefault();

        const termo = campo.value.trim();
        if (!termo) {
            campo.focus();
            return;
        }

        document.dispatchEvent(new CustomEvent("search:submit", { detail: { termo } }));
    });

    document.addEventListener("search:submit", (evento) => {
        aplicarBusca(String(evento.detail?.termo ?? "").trim());
    });

    document.addEventListener("keydown", (evento) => {
        if (evento.key === "Escape" && estaAberta()) fecharBusca({ devolverFoco: true });
    });

    document.addEventListener("click", (evento) => {
        if (!estaAberta()) return;
        if (formularioBusca.contains(evento.target)) return;
        fecharBusca();
    });

    // Categorias: nav e atalhos da tela inicial
    document.addEventListener("click", (evento) => {
        const rota = evento.target.closest("[data-rota]");
        if (!rota) return;

        evento.preventDefault();
        navegar(rota.dataset.rota);
    });

    logo.addEventListener("click", (evento) => {
        evento.preventDefault();
        navegar(null);
    });

    limparBuscaBotao.addEventListener("click", limparBusca);

    anterior.addEventListener("click", () => {
        if (estado.pagina <= 1) return;
        estado.pagina -= 1;
        carregar({ rolar: true });
    });

    proxima.addEventListener("click", () => {
        if (proxima.disabled) return;
        estado.pagina += 1;
        carregar({ rolar: true });
    });

    fichaFechar.addEventListener("click", () => ficha.close());
    fichaVoltar.addEventListener("click", voltarFicha);

    // Clique no backdrop (fora do conteúdo) fecha a ficha
    ficha.addEventListener("click", (evento) => {
        if (evento.target === ficha) ficha.close();
    });

    ficha.addEventListener("close", () => {
        pilha.length = 0;
        fichaComErro = false;
        requisicaoFicha += 1; // descarta ficha que ainda estiver vindo
    });

    window.addEventListener("popstate", () => {
        navegar(recursoDoHash(), { historico: false });
    });

    /* ---------- Início ---------- */

    const inicial = recursoDoHash();
    if (inicial) navegar(inicial, { historico: false });
    else mostrarInicio();
})();
