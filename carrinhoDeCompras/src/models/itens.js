import * as utils from '../utils/utils.js';
import promptSync from 'prompt-sync';
const prompt = promptSync();

class Item {
    static #nextId = 1;
    constructor(nome, preco, quantidade) {
        this.id = Item.#nextId++;
        this.nome = nome;
        this.preco = preco;
        this.quantidade = quantidade;
        this.disponivel = true;
    }

    getFullDescription() {
        return `id: ${this.id}, nome: ${this.nome}, preço: R$ ${this.preco.toFixed(2)}, quantidade: ${this.quantidade}`;
    }

    getDispItens() {
        if (!this.disponivel) {
            return `${this.nome} - Indisponível`;
        }
        
        const precoFormatado = this.preco.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
        
        return `ID: ${this.id} | ${this.nome} | ${precoFormatado} | Qtd: ${this.quantidade}`;
    }
}

function createDefaultItems() {
    const item1 = new Item("Camiseta", 29.99, 2);
    const item2 = new Item("Calça Jeans", 79.99, 1);
    const item3 = new Item("Tênis", 149.99, 1);
    const item4 = new Item("Boné", 19.99, 3);
    const item5 = new Item("Mochila", 89.99, 1);

    return [
        item1,
        item2,
        item3,
        item4,
        item5
    ];
}

function createItem() { 
    while (true) {
        const nome = prompt("Digite o nome do item:");
        const preco = parseFloat(prompt("Digite o preço do item:"));
        const quantidade = parseInt(prompt("Digite a quantidade do item:"));

        
        const erros = utils.validarItem(nome, preco, quantidade);
        if (erros.length > 0) {
            console.log("Erros encontrados:");
            erros.forEach(erro => console.log(`- ${erro}`));
            console.log("Por favor, tente novamente.");
            continue;
        }

        return new Item(nome, preco, quantidade);
    }
}
export {
    createDefaultItems,
    createItem
};
