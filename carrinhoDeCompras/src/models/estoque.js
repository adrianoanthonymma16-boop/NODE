import * as controlItems from './itens.js';
let estoque = controlItems.createDefaultItems();

function getEstoque() {
    for (let i = 0; i < estoque.length; i++) {
        let item = estoque[i];
        console.log(item.getFullDescription());
    }
}

function getEstoqueDisponivel() {
    for (let i = 0; i < estoque.length; i++) {
        let item = estoque[i];
        console.log(item.getDispItens());
    }
}

function getItemById(id) {
    for (let i = 0; i < estoque.length; i++) {
        if (estoque[i].id === id) {
            return estoque[i];
        }
    }
    return null;
}

function increaseItemQuantity(id, quantidade) {
    for (let i = 0; i < estoque.length; i++) {
        if (estoque[i].id === id) {
            estoque[i].quantidade += quantidade;
            return;
        }
    }
    throw new Error(`Item com ID ${id} não encontrado no estoque.`);
}

function decreaseItemQuantity(id, quantidade) {
    for (let i = 0; i < estoque.length; i++) {
        if (estoque[i].id === id) {
            if (estoque[i].quantidade < quantidade) {
                throw new Error(`Quantidade solicitada (${quantidade}) ` +
                                `é maior que a quantidade disponível ` +
                                `em estoque (${estoque[i].quantidade}).`);
            }
            estoque[i].quantidade -= quantidade;
            return;
        }
    }
    throw new Error(`Item com ID ${id} não encontrado no estoque.`);
}

function createItem() {
    const newItem = controlItems.createItem();
    estoque.push(newItem);
    console.log(`Item ${newItem.nome} adicionado ao estoque.`);
}

function removeItem(id) {
    for (let i = 0; i < estoque.length; i++) {
        if (estoque[i].id === id) {
            estoque.splice(i, 1);
            console.log(`Item com ID ${id} removido do estoque.`);
            return;
        }
    }
    throw new Error(`Item com ID ${id} não encontrado no estoque.`);
}

export { getEstoque, getEstoqueDisponivel, getItemById, increaseItemQuantity, decreaseItemQuantity, createItem, removeItem };

