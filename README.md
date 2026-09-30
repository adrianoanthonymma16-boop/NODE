# NODE

Repositório contenedor único para todos os projetos **Node.js** do curso da DIO.

Cada projeto vive em uma pasta independente, com seu próprio `package.json`,
suas próprias dependências e seu próprio histórico de uso.

## Projetos

| Projeto | Descrição | Tecnologias |
| --- | --- | --- |
| [marioKart](./marioKart) | Jogo de terminal interativo com temática de Mario Kart. Dois jogadores escolhem personagens, rolam dados e disputam o resultado de acordo com o modo de jogo sorteado. | Node.js (ESM), `prompt-sync`, `chalk` |

## Como usar

Clone o repositório e entre na pasta do projeto desejado:

```bash
git clone <url-do-repo> NODE
cd NODE/marioKart
npm install
node marioKart/index.js
```

## Convenção de pastas

- Um diretório por projeto, nomeado no formato `nomeDoProjeto`.
- Nenhum `package.json` na raiz — as dependências ficam isoladas por projeto.
- O `package-lock.json` de cada projeto é versionado, o `node_modules` não.

## Licença

ISC
