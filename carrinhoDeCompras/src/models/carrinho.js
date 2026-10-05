let carrinho = [];
import { estoque } from "./estoque";
import * as gerenciadorEstoque from "./estoque.js";
import PromptSync from "prompt-sync";
const prompt = PromptSync();

function addToCar() {
    console.clear();
    console.log("=== Itens Disponíveis ===");
    gerenciadorEstoque.getEstoqueDisponivel();
    console.log('Escolha o item desejado: ');
    const escolha = parseInt(prompt(">>> "))
}

function removeToCar() {
    
}

function listToCar() {
    carrinho.forEach(e => {
        console.log(``);
    });
}