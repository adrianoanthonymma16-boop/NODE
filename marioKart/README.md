# Mario Kart

Jogo de terminal interativo com temática de Mario Kart, feito como desafio do curso da DIO.

Dois jogadores escolhem um personagem, rolam os dados e disputam a corrida. A cada
rodada o jogo sorteia um modo — **reta**, **curva** ou **confronto** — e o vencedor é
definido pelo atributo correspondente, somado ao valor do dado.

## Personagens

| # | Personagem | Velocidade | Manobrabilidade | Poder |
| --- | --- | --- | --- | --- |
| 1 | Mario | 4 | 3 | 3 |
| 2 | Princesa Peach | 3 | 4 | 2 |
| 3 | Yoshi | 2 | 4 | 3 |
| 4 | Bowser | 5 | 2 | 5 |
| 5 | Luigi | 3 | 4 | 4 |
| 6 | Donkey Kong | 2 | 2 | 5 |

Bowser e Donkey Kong compensam a baixa velocidade com poder alto; Yoshi e Luigi apostam
em manobrabilidade.

## Requisitos

- Node.js 18 ou superior (o projeto usa ES Modules)

## Como rodar

```bash
npm install
node marioKart/index.js
```

## Como jogar

1. Escolha um personagem para o jogador 1 e outro para o jogador 2 (digite o número).
2. Confirme se deseja jogar os dados.
3. O jogo sorteia o modo (`reta`, `curva` ou `confronto`) e compara os atributos.
4. Ao final, responda `s` para jogar de novo ou `n` para encerrar.

## Estrutura

```
marioKart/
├── package.json
└── marioKart/
    ├── index.js                      # loop principal: seleção e revanche
    └── src/templates/models/
        ├── personagens.js            # classe Personagem e lista padrão
        └── ui.js                     # dados, modos de jogo, decisão do vencedor
```

## Dependências

- [`prompt-sync`](https://www.npmjs.com/package/prompt-sync) — entrada de dados síncrona no terminal
- [`chalk`](https://www.npmjs.com/package/chalk) — cores na listagem de personagens

## Licença

ISC
