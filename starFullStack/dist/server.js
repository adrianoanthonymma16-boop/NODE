"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/api/server.ts
var http = __toESM(require("http"));

// src/errors.ts
var HttpError = class extends Error {
  constructor(status, message, detail) {
    super(message);
    this.status = status;
    this.detail = detail;
    this.name = "HttpError";
  }
  status;
  detail;
};

// src/api/router.ts
function json(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(payload)
  });
  res.end(payload);
}
function toParams(groups) {
  const params = {};
  for (const [key, value] of Object.entries(groups ?? {})) {
    if (value !== void 0) params[key] = value;
  }
  return params;
}
async function dispatch(routes2, req, res) {
  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
  const path = url.pathname.replace(/\/+$/, "") || "/";
  const method = (req.method ?? "GET").toUpperCase();
  const matched = [];
  for (const route2 of routes2) {
    const match = route2.pattern.exec(path);
    if (match) {
      matched.push({ route: route2, params: toParams(match.groups) });
    }
  }
  if (matched.length === 0) {
    json(res, 404, { erro: "Rota n\xE3o encontrada", path });
    return;
  }
  const allowed = matched.filter(({ route: route2 }) => route2.method === method);
  if (allowed.length === 0) {
    res.setHeader("allow", matched.map(({ route: route2 }) => route2.method).join(", "));
    json(res, 405, { erro: "M\xE9todo n\xE3o permitido", metodo: method });
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

// src/services/service-starWars.ts
function getApiUrl() {
  const url = process.env.API;
  if (!url) {
    throw new Error("Environment variable API is not defined");
  }
  return url;
}
async function fetchJson(url, alvo) {
  const response = await fetch(url, { method: "GET" });
  if (!response.ok) {
    throw new HttpError(
      response.status,
      response.status === 404 ? `${alvo} n\xE3o encontrado` : "Falha ao consultar a origem",
      `A origem respondeu ${response.status}`
    );
  }
  return response.json();
}
var rootCache;
function getRoot() {
  if (!rootCache) {
    rootCache = fetchJson(getApiUrl(), "A API de origem");
    rootCache.catch(() => {
      rootCache = void 0;
    });
  }
  return rootCache;
}
async function endpointFor(uri) {
  const root = await getRoot();
  const endpoint = root[uri];
  if (!endpoint) {
    throw new HttpError(404, `Recurso "${uri}" n\xE3o encontrado`, "N\xE3o existe no root da API");
  }
  return new URL(endpoint);
}
async function fetchResource(target, alvo, query) {
  if (query) {
    for (const [key, value] of query) {
      target.searchParams.set(key, value);
    }
  }
  return fetchJson(target.toString(), alvo);
}
async function getRepository(uri, query) {
  return fetchResource(await endpointFor(uri), `O recurso "${uri}"`, query);
}
async function getRecord(uri, id, query) {
  const target = await endpointFor(uri);
  target.pathname = `${target.pathname.replace(/\/+$/, "")}/${encodeURIComponent(id)}/`;
  return fetchResource(target, `O registro ${uri}/${id}`, query);
}

// src/presentation/schema.ts
var RECURSOS = {
  films: {
    singular: "Filme",
    plural: "Filmes",
    titulo: "title",
    destaques: ["episode_id", "release_date", "director"]
  },
  species: {
    singular: "Esp\xE9cie",
    plural: "Esp\xE9cies",
    titulo: "name",
    destaques: ["classification", "language", "average_lifespan"]
  },
  people: {
    singular: "Personagem",
    plural: "Personagens",
    titulo: "name",
    destaques: ["birth_year", "gender", "height"]
  },
  planets: {
    singular: "Planeta",
    plural: "Planetas",
    titulo: "name",
    destaques: ["climate", "terrain", "population"]
  },
  starships: {
    singular: "Nave",
    plural: "Naves",
    titulo: "name",
    destaques: ["model", "starship_class", "cost_in_credits"]
  },
  vehicles: {
    singular: "Ve\xEDculo",
    plural: "Ve\xEDculos",
    titulo: "name",
    destaques: ["model", "vehicle_class", "cost_in_credits"]
  }
};
function ehRecurso(valor) {
  return Object.prototype.hasOwnProperty.call(RECURSOS, valor);
}
var VAZIO = "\u2014";
var ROMANOS = {
  1: "I",
  2: "II",
  3: "III",
  4: "IV",
  5: "V",
  6: "VI",
  7: "VII",
  8: "VIII",
  9: "IX"
};
var UNIDADES = {
  height: "cm",
  mass: "kg",
  length: "m",
  diameter: "km",
  orbital_period: "h",
  rotation_period: "h",
  surface_water: "%",
  population: "hab.",
  average_height: "cm",
  average_lifespan: "anos",
  cost_in_credits: "cr\xE9ditos",
  cargo_capacity: "kg",
  max_atmosphering_speed: "km/h",
  MGLT: "MGLT"
};
var ROTULOS = {
  name: "Nome",
  title: "T\xEDtulo",
  height: "Altura",
  mass: "Massa",
  hair_color: "Cor do cabelo",
  skin_color: "Cor da pele",
  eye_color: "Cor dos olhos",
  birth_year: "Ano de nascimento",
  gender: "G\xEAnero",
  homeworld: "Planeta natal",
  films: "Filmes",
  species: "Esp\xE9cies",
  vehicles: "Ve\xEDculos",
  starships: "Naves",
  created: "Criado em",
  edited: "Editado em",
  url: "Registro original",
  episode_id: "Epis\xF3dio",
  opening_crawl: "Texto de abertura",
  director: "Dire\xE7\xE3o",
  producer: "Produ\xE7\xE3o",
  release_date: "Lan\xE7amento",
  characters: "Personagens",
  rotation_period: "Per\xEDodo de rota\xE7\xE3o",
  orbital_period: "Per\xEDodo orbital",
  diameter: "Di\xE2metro",
  climate: "Clima",
  gravity: "Gravidade",
  terrain: "Terreno",
  surface_water: "\xC1gua na superf\xEDcie",
  population: "Popula\xE7\xE3o",
  residents: "Residentes",
  classification: "Classifica\xE7\xE3o",
  designation: "Designa\xE7\xE3o",
  average_height: "Altura m\xE9dia",
  skin_colors: "Cores da pele",
  hair_colors: "Cores do cabelo",
  eye_colors: "Cores dos olhos",
  average_lifespan: "Expectativa de vida",
  language: "Idioma",
  people: "Personagens",
  model: "Modelo",
  manufacturer: "Fabricante",
  cost_in_credits: "Custo (cr\xE9ditos)",
  length: "Comprimento",
  max_atmosphering_speed: "Velocidade atmosf\xE9rica m\xE1x.",
  crew: "Tripula\xE7\xE3o",
  passengers: "Passageiros",
  cargo_capacity: "Capacidade de carga",
  consumables: "Consum\xEDveis",
  hyperdrive_rating: "Classe do hiperpropulsor",
  MGLT: "MGLT",
  starship_class: "Classe da nave",
  vehicle_class: "Classe do ve\xEDculo",
  pilots: "Pilotos",
  json: "JSON do registro"
};
function rotulo(chave) {
  const conhecido = ROTULOS[chave];
  if (conhecido) return conhecido;
  const texto = String(chave).replace(/_/g, " ");
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}
function comUnidade(chave, valor) {
  const unidade = UNIDADES[chave];
  if (!unidade) return valor;
  return unidade === "%" ? `${valor}%` : `${valor} ${unidade}`;
}
var SO_DATA = /^(\d{4})-(\d{2})-(\d{2})$/;
function formatarData(texto) {
  const soData = SO_DATA.exec(texto);
  if (soData) return `${soData[3]}/${soData[2]}/${soData[1]}`;
  const data = new Date(texto);
  if (Number.isNaN(data.getTime())) return texto;
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeZone: "UTC"
  }).format(data);
}
function formatar(chave, valor) {
  if (valor === null || valor === void 0) return VAZIO;
  const texto = String(valor).trim();
  if (!texto) return VAZIO;
  const minusculo = texto.toLowerCase();
  if (minusculo === "unknown" || minusculo === "n/a" || minusculo === "none" || minusculo === "null") {
    return VAZIO;
  }
  if (minusculo === "indefinite") return "Indefinido";
  if (chave === "created" || chave === "edited" || chave === "release_date") {
    return formatarData(texto);
  }
  if (chave === "episode_id") {
    return ROMANOS[Number(texto)] ?? texto;
  }
  if (/^\d{1,3}(,\d{3})+$/.test(texto)) {
    return comUnidade(chave, Number(texto.replace(/,/g, "")).toLocaleString("pt-BR"));
  }
  if (/^-?\d+(\.\d+)?$/.test(texto)) {
    const numero = Number(texto);
    const formatado = Number.isInteger(numero) && Math.abs(numero) >= 1e3 ? numero.toLocaleString("pt-BR") : texto.replace(".", ",");
    return comUnidade(chave, formatado);
  }
  return texto;
}

// src/services/references.ts
function partesDaUrl(url) {
  if (typeof url !== "string") return null;
  const achado = /\/api\/([a-z]+)\/(\d+)\/?$/.exec(url);
  if (!achado) return null;
  const [, recurso, id] = achado;
  return ehRecurso(recurso) ? { recurso, id } : null;
}
var cache = /* @__PURE__ */ new Map();
var LIMITE = 8;
var ativas = 0;
var fila = [];
function comLimite(tarefa) {
  return new Promise((resolver, rejeitar) => {
    const executar = () => {
      ativas += 1;
      tarefa().then(resolver, rejeitar).finally(() => {
        ativas -= 1;
        fila.shift()?.();
      });
    };
    if (ativas < LIMITE) executar();
    else fila.push(executar);
  });
}
function nomeDe(recurso, id, item) {
  const { titulo, singular } = RECURSOS[recurso];
  const bruto = item?.[titulo];
  const nome = typeof bruto === "string" ? bruto.trim() : "";
  return nome || `${singular} #${id}`;
}
function buscar(recurso, id) {
  const chave = `${recurso}/${id}`;
  const existente = cache.get(chave);
  if (existente) return existente;
  const pedido = comLimite(async () => {
    const item = await getRecord(recurso, id);
    return { recurso, id, nome: nomeDe(recurso, id, item) };
  }).catch((erro) => {
    console.warn(`Refer\xEAncia ${chave} indispon\xEDvel:`, erro?.message);
    cache.delete(chave);
    return { recurso, id, nome: `${RECURSOS[recurso].singular} #${id}` };
  });
  cache.set(chave, pedido);
  return pedido;
}
function resolverReferencias(urls) {
  const alvos = urls.map((url) => partesDaUrl(url)).filter((alvo) => alvo !== null);
  return Promise.all(alvos.map(({ recurso, id }) => buscar(recurso, id)));
}

// src/presentation/serialize.ts
var ITENS_POR_PAGINA = 10;
function idDe(item) {
  const url = typeof item.url === "string" ? item.url : "";
  const achado = /\/(\d+)\/?$/.exec(url);
  return achado ? achado[1] : "";
}
function tituloDe(recurso, item) {
  const bruto = item[RECURSOS[recurso].titulo];
  const texto = typeof bruto === "string" ? bruto.trim() : "";
  return texto || `Registro ${idDe(item)}`.trim();
}
function paraCard(recurso, item) {
  return {
    id: idDe(item),
    titulo: tituloDe(recurso, item),
    destaques: RECURSOS[recurso].destaques.map((chave) => ({
      rotulo: rotulo(chave),
      valor: formatar(chave, item[chave])
    }))
  };
}
function paragrafos(texto) {
  return texto.replace(/\r\n/g, "\n").split(/\n{2,}/).map((paragrafo) => paragrafo.replace(/\s+/g, " ").trim()).filter(Boolean);
}
async function paraFicha(recurso, item) {
  const cfg = RECURSOS[recurso];
  const id = idDe(item);
  const campos = [];
  for (const chave of Object.keys(item)) {
    if (chave === cfg.titulo || chave === "url") continue;
    const valor = item[chave];
    const rot = rotulo(chave);
    if (Array.isArray(valor)) {
      campos.push(
        resolverReferencias(valor).then((referencias) => ({
          chave,
          rotulo: rot,
          tipo: "referencias",
          referencias
        }))
      );
      continue;
    }
    if (partesDaUrl(valor)) {
      campos.push(
        resolverReferencias([valor]).then((referencias) => ({
          chave,
          rotulo: rot,
          tipo: "referencias",
          referencias
        }))
      );
      continue;
    }
    if (chave === "opening_crawl") {
      campos.push({
        chave,
        rotulo: rot,
        tipo: "paragrafos",
        valor: paragrafos(String(valor))
      });
      continue;
    }
    const texto = formatar(chave, valor);
    campos.push({
      chave,
      rotulo: rot,
      tipo: "texto",
      valor: texto,
      vazio: texto === VAZIO
    });
  }
  return {
    recurso: { slug: recurso, singular: cfg.singular, plural: cfg.plural },
    id,
    titulo: tituloDe(recurso, item),
    campos: [
      ...await Promise.all(campos),
      {
        chave: "json",
        rotulo: rotulo("json"),
        tipo: "link",
        valor: `/api/${recurso}/${id}`
      }
    ]
  };
}
function paraLista(recurso, dados, { pagina, busca }) {
  const bruto = dados ?? {};
  const itens = Array.isArray(bruto.results) ? bruto.results : [];
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
    itens: itens.map((item) => paraCard(recurso, item))
  };
}

// src/api/controllers/api-controller.ts
function resolverRecurso(valor, res) {
  if (ehRecurso(valor)) return valor;
  json(res, 404, { erro: `Recurso "${valor}" n\xE3o encontrado` });
  return null;
}
function lerPagina(query) {
  const numero = Number(query.get("page"));
  return Number.isInteger(numero) && numero > 0 ? numero : 1;
}
var routes = [
  {
    method: "GET",
    // /api/people, /api/films, /api/planets... -> params.resource
    pattern: /^\/api\/(?<resource>[a-z]+)$/,
    handler: async ({ params, query }, res) => {
      const recurso = resolverRecurso(params.resource, res);
      if (!recurso) return;
      const pagina = lerPagina(query);
      const busca = (query.get("search") ?? "").trim();
      const repasse = new URLSearchParams();
      if (pagina > 1) repasse.set("page", String(pagina));
      if (busca) repasse.set("search", busca);
      const dados = await getRepository(recurso, repasse);
      json(res, 200, paraLista(recurso, dados, { pagina, busca }));
    }
  },
  {
    method: "GET",
    // /api/people/1 -> params.resource = people, params.id = 1
    pattern: /^\/api\/(?<resource>[a-z]+)\/(?<id>\d+)$/,
    handler: async ({ params }, res) => {
      const recurso = resolverRecurso(params.resource, res);
      if (!recurso) return;
      const item = await getRecord(recurso, params.id);
      json(res, 200, await paraFicha(recurso, item));
    }
  }
];
async function handle(req, res) {
  await dispatch(routes, req, res);
}

// src/api/static.ts
var import_node_fs = require("fs");
var import_promises = require("fs/promises");
var import_node_path = require("path");
var import_promises2 = require("stream/promises");
var PAGINAS = [
  (0, import_node_path.resolve)(__dirname, "..", "pages"),
  (0, import_node_path.resolve)(process.cwd(), "src", "pages")
].find((caminho) => (0, import_node_fs.existsSync)(caminho));
var TIPOS = {
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
  ".woff2": "font/woff2"
};
async function serveStatic(req, res) {
  if (!PAGINAS) return false;
  if (req.method !== "GET" && req.method !== "HEAD") return false;
  let caminho;
  try {
    caminho = decodeURIComponent((req.url ?? "/").split("?")[0]);
  } catch {
    return false;
  }
  const relativo = caminho === "/" ? "index.html" : caminho.replace(/^\/+/, "");
  const arquivo = (0, import_node_path.resolve)((0, import_node_path.join)(PAGINAS, relativo));
  if (arquivo !== PAGINAS && !arquivo.startsWith(PAGINAS + import_node_path.sep)) return false;
  let info;
  try {
    info = await (0, import_promises.stat)(arquivo);
  } catch {
    return false;
  }
  if (!info.isFile()) return false;
  res.writeHead(200, {
    "content-type": TIPOS[(0, import_node_path.extname)(arquivo).toLowerCase()] ?? "application/octet-stream",
    "content-length": info.size,
    "cache-control": "no-cache"
  });
  if (req.method === "HEAD") {
    res.end();
    return true;
  }
  try {
    await (0, import_promises2.pipeline)((0, import_node_fs.createReadStream)(arquivo), res);
  } catch (error) {
    console.error(error);
    res.destroy();
  }
  return true;
}

// src/api/server.ts
var server = http.createServer(
  async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    const { pathname } = new URL(
      req.url ?? "/",
      `http://${req.headers.host ?? "localhost"}`
    );
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
var PORTSERVER = process.env.PORT || 3333;
server.listen(PORTSERVER, () => {
  console.log(`Servidor iniciado em http://localhost:${PORTSERVER}`);
});
