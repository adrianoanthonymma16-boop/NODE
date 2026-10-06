let carrinho = [];
import * as gerenciadorEstoque from "./estoque.js";
import { continuar } from "../utils/utils.js";
import PromptSync from "prompt-sync";
const prompt = PromptSync();

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
                gerenciadorEstoque.estoque.push(item);
                itensAdcionados.push(item.nome)
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
    
}

function listToCar() {
    console.log("===Carrinho===")
    carrinho.forEach(e => {
        console.log(`Item: ${e.nome}`+
            `Preço: ${e.preco}`
        );
    });
}
addToCar();
