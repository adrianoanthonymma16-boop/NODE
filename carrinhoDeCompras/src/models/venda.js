let sales = [];

class Sale {

    constructor(item, quantidadeVenda) {
        this.id = randomUUID();
        this.date = new Date().toLocaleDateString("pt-BR");
        this.item = item;
        this.quantidadeVenda = quantidadeVenda;
    }
}

function createSale(item, quantidadeVenda) {
    try {
        if (quantidadeVenda <= 0) {
            throw new Error("Quantidade de venda deve ser positiva.");
        }
        if (quantidadeVenda > item.quantidade) {
            throw new Error(`Quantidade de venda (${quantidadeVenda}) é maior que a quantidade disponível em estoque (${item.quantidade}).`);
        }
        const sale = new Sale(item, quantidadeVenda);
        item.quantidade -= quantidadeVenda;
        if (item.quantidade === 0) {
            item.disponivel = false;
        }
        sales.push(sale);
        return sale;
    } catch (error) {
        console.error(error.message);
        return null;
    }
}

function getSales() {
    return sales;
}

export { createSale, getSales };