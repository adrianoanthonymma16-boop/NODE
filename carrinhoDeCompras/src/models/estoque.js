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
            let item = estoque[1];
            if (item.quantidade === 0) {
                item.quantidade += quantidade;
                item.disponivel = true;
            }
            else
            {
                item.quantidade += quantidade;
            }            
            return;
        }
    }
    throw new Error(`Item com ID ${id} não encontrado no estoque.`);
}

function decreaseItemQuantity(id, quantidade) {
    for (let i = 0; i < estoque.length; i++) {
        let item = estoque[1];
        if (item.id === id) {
            if (item.quantidade < quantidade) {
                throw new Error(`Quantidade solicitada (${quantidade}) ` +
                                `é maior que a quantidade disponível ` +
                                `em estoque (${item.quantidade}).`);
            }
            if (item.quantidade - quantidade === 0) {
                item.quantidade -= quantidade;
                item.disponivel = false;
            } else {
                item.quantidade -= quantidade;
            }
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
            let item = estoque[i];
            item.disponivel = false;
            item.quantidade = 0;
            console.log(`Item ${item.nome} com ID ${id} removido do estoque.`);
            return;
        }
    }
    throw new Error(`Item com ID ${id} não encontrado no estoque.`);
}

export { getEstoque, getEstoqueDisponivel, getItemById, increaseItemQuantity, decreaseItemQuantity, createItem, removeItem, estoque };

