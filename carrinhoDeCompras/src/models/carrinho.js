let carrinho = [];
import * as gerenciadorEstoque from "./estoque.js";
import { continuar, formatarMoeda } from "../utils/utils.js";
import PromptSync from "prompt-sync";
const prompt = PromptSync();

//pronto
function addToCar() {
    let itensAdcionados = [];
    while (true) {
        console.clear();
        console.log("=== Itens Disponíveis ===");
        gerenciadorEstoque.getEstoqueDisponivel();
        console.log('Escolha o item desejado: ');
        const escolha = parseInt(prompt(">>> "))
        const item = gerenciadorEstoque.getItemById(escolha);

        if (!item) {
            console.log("Item não encontrado.");
        } else {
            const jaNoCarrinho = carrinho.find(entrada => entrada.item.id === item.id)?.quantidade ?? 0;
            const disponivel = item.quantidade - jaNoCarrinho;

            if (!item.disponivel || disponivel <= 0) {
                console.log(`${item.nome} indisponível no estoque.`);
            } else {
                console.log(`Quantidade disponível de ${item.nome}: ${disponivel}`);
                const quantidade = parseInt(prompt("Quantidade: >>> "));

                if (!Number.isInteger(quantidade) || quantidade <= 0 || quantidade > disponivel) {
                    console.log(`Quantidade inválida (mínimo 1, máximo ${disponivel}).`);
                } else {
                    const entrada = carrinho.find(entry => entry.item.id === item.id);
                    if (entrada) entrada.quantidade += quantidade;
                    else carrinho.push({ item, quantidade });
                    itensAdcionados.push({ item, quantidade });
                    console.log(`${quantidade}x ${item.nome} adicionado ao carrinho.`);
                }
            }
        }

        console.log("Deseja adcionar outro item?");
        let desejaContinuar = continuar();
        if (desejaContinuar) continue;
        else {
            console.clear();
            console.log("=== Itens adicionados no carrinho ===");
            let total = 0;
            itensAdcionados.forEach(entrada => {
                const subtotal = entrada.item.preco * entrada.quantidade;
                total += subtotal;
                console.log(`Item: ${entrada.item.nome}\n` +
                    `Quantidade: ${entrada.quantidade}\n` +
                    `Preço: ${formatarMoeda(entrada.item.preco)}\n` +
                    `Subtotal: ${formatarMoeda(subtotal)}\n` +
                    `====================`
                )
            });
            console.log(`Total: ${formatarMoeda(total)}`);
            return;
        }
    }
}

function removeToCar() {
    if (carrinho.length === 0) {
        console.clear();
        console.log("Carrinho vazio");
        return;
    }

    listToCar();
    console.log("Digite o ID do item a ser removido:");
    const selecao = parseInt(prompt(">>> "));

    const index = carrinho.findIndex(entrada => entrada.item.id === selecao);

    if (index === -1) {
        console.log("Item não encontrado");
        return;
    }

    carrinho.splice(index, 1);   // remove no índice
    console.log("Item removido com sucesso!");
}

//Pronto
function listToCar() {
    console.log("===Carrinho===")
    if (carrinho.length === 0) {
        console.log("=== Carrinho Vazio ===");
        return;
    }
    let total = 0;
    carrinho.forEach(entrada => {
        const subtotal = entrada.item.preco * entrada.quantidade;
        total += subtotal;
        console.log(
            `Id: ${entrada.item.id}\n`+
            `Item: ${entrada.item.nome}\n` +
            `Preço: ${formatarMoeda(entrada.item.preco)}\n` +
            `Quantidade: ${entrada.quantidade}\n` +
            `Subtotal: ${formatarMoeda(subtotal)}\n`
        );
    });
    console.log(`Total: ${formatarMoeda(total)}`)
    console.log("==================")
    return;
}

export {
    addToCar,
    removeToCar,
    listToCar,
    carrinho
}
