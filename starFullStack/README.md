# Star Wars Full Stack

Explorador dos dados públicos da [SWAPI](https://swapi.dev/) — backend em Node + TypeScript
e frontend em HTML, CSS e JavaScript puro.

O navegador fala **somente** com este backend. Ele é a única saída para a internet: recebe a
requisição do cliente, consulta a SWAPI, trata os dados (rótulos, formatação, referências) e
devolve a resposta pronta para renderizar.

## Como rodar

```bash
npm install
npm run start:watch
```

Abra **http://localhost:3333**. O próprio servidor entrega as páginas (`src/pages`) e a API.

## Rotas

| Rota | Retorno |
| --- | --- |
| `GET /` | `src/pages/index.html` |
| `GET /style.css`, `/script.js` | arquivos estáticos de `src/pages` |
| `GET /api/people?page=2&search=luke` | listagem tratada |
| `GET /api/people/1` | ficha tratada de um registro |
| `GET /api/films`, `/api/planets`, `/api/species`, `/api/starships`, `/api/vehicles` | demais coleções |

Recurso fora da whitelist devolve `404`. Método diferente de `GET` devolve `405` com o
header `Allow`. Falha na origem propaga o status real (ex.: `404` para `people/999`).
O cliente só pode mandar `page` e `search` — nenhuma outra URL é repassada.

## O que o frontend recebe

A listagem já vem com paginação calculada e os cards montados:

```json
{
  "recurso": { "slug": "people", "singular": "Personagem", "plural": "Personagens" },
  "busca": null,
  "pagina": 2,
  "totalPaginas": 9,
  "total": 82,
  "temAnterior": true,
  "temProximo": true,
  "itens": [
    {
      "id": "11",
      "titulo": "Anakin Skywalker",
      "destaques": [
        { "rotulo": "Ano de nascimento", "valor": "41.9BBY" },
        { "rotulo": "Gênero", "valor": "male" },
        { "rotulo": "Altura", "valor": "188 cm" }
      ]
    }
  ]
}
```

A ficha traz todos os campos com rótulo e valor final, e cada `tipo` diz como renderizar:

```json
{
  "recurso": { "slug": "people", "singular": "Personagem", "plural": "Personagens" },
  "id": "1",
  "titulo": "Luke Skywalker",
  "campos": [
    { "chave": "height", "rotulo": "Altura", "tipo": "texto", "valor": "172 cm", "vazio": false },
    {
      "chave": "homeworld",
      "rotulo": "Planeta natal",
      "tipo": "referencias",
      "referencias": [{ "recurso": "planets", "id": "1", "nome": "Tatooine" }]
    },
    {
      "chave": "films",
      "rotulo": "Filmes",
      "tipo": "referencias",
      "referencias": [{ "recurso": "films", "id": "1", "nome": "A New Hope" }]
    },
    { "chave": "created", "rotulo": "Criado em", "tipo": "texto", "valor": "9 de dez. de 2014", "vazio": false },
    { "chave": "json", "rotulo": "JSON do registro", "tipo": "link", "valor": "/api/people/1" }
  ]
}
```

Tipos de campo: `texto` (valor final + flag `vazio`), `referencias` (chips já nomeados),
`paragrafos` (texto de abertura, uma string por parágrafo) e `link` (aponta para a própria API).

## Backend

- `src/api/server.ts` — decide entre API (`/api/...`) e arquivo estático.
- `src/api/static.ts` — serve `src/pages` com content-type, `HEAD` e proteção contra `../`.
- `src/api/router.ts` — tabela de rotas (`method` + `pattern` com grupos nomeados), 404/405/500
  centralizados e helpers de resposta JSON. Nenhum `if` por endpoint.
- `src/api/controllers/api-controller.ts` — declara `/api/:resource` e `/api/:resource/:id`,
  valida o recurso contra a whitelist e saneia `page`/`search`.
- `src/services/service-starWars.ts` — acesso à SWAPI: root cacheado, `getRepository`
  (coleção) e `getRecord` (registro). Erros viram `HttpError` com status real.
- `src/services/references.ts` — resolve URL de referência em `{ recurso, id, nome }`, com
  cache em memória e limite de 8 requisições simultâneas. Uma referência quebrada não derruba
  a ficha: cai no rótulo genérico ("Personagem #5").
- `src/presentation/schema.ts` — recursos expostos, rótulos em pt-BR, unidades e regras de
  formatação (datas, milhares, `unknown`/`n/a`/`none` → `—`).
- `src/presentation/serialize.ts` — monta a listagem e a ficha: título, destaques, ordem dos
  campos, texto de abertura e resolução das referências.
- `src/errors.ts` — `HttpError`, para o serviço sinalizar o status HTTP sem try/catch por rota.

## Frontend

- `index.html` — header (marca em texto/ CSS, menu, busca), tela inicial, resultados,
  paginação, `<dialog>` da ficha e sprite de ícones SVG. Nenhum arquivo externo.
- `style.css` — tokens (`:root`), layout, cards, estados (esqueleto/vazio/erro), ficha,
  responsivo e `prefers-reduced-motion`.
- `api.js` — `listar()` (com cancelamento da requisição anterior) e `carregar()`; ambos batem
  em `/api` na mesma origem. Não conhece a SWAPI.
- `script.js` — estado da tela, navegação por hash, renderização dos cards e da ficha a partir
  do `tipo` de cada campo. Não há tabela de campos, rótulos nem formatação no cliente.

## Dados exibidos

O card mostra três campos de destaque. A ficha percorre **todas as chaves** que a origem
devolve — campo novo na SWAPI aparece sozinho, com rótulo automático. Listas de referências
viram chips já nomeados (o nome é resolvido no backend), e o clique abre a ficha daquele
registro, com botão de voltar.
