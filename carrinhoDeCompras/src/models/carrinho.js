let carrinho = [];
import * as gerenciadorEstoque from "./estoque.js";
import { continuar } from "../utils/utils.js";
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
        gerenciadorEstoque.estoque.forEach(item => {
            if (escolha === item.id) {
                carrinho.push(item);
                itensAdcionados.push(item)
            }
        });
        console.log("Deseja adcionar outro item?");
        let desejaContinuar = continuar();
        if (desejaContinuar) continue;
        else {
            console.clear();
            console.log("=== Itens adicionados no carrinho ===");
            itensAdcionados.forEach(e => {
                console.log(`Item: ${e.nome}\n` +
                    `Preço: ${e.preco}\n`+
                    `====================`
                )
            });
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
    
    const index = carrinho.findIndex(item => item.id === selecao);
    
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
    carrinho.forEach(e => {
        console.log(
            `Id: ${e.id}\n`+
            `Item: ${e.nome}\n` +
            `Preço: ${e.preco}\n`
        );
    });
    console.log("==================")
    return;
}

export {
    addToCar,
    removeToCar,
    listToCar
}
