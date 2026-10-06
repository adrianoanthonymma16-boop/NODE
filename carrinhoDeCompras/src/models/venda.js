import { randomUUID } from "node:crypto";
import * as gerenciadorEstoque from "./estoque.js";
import { formatarMoeda } from "../utils/utils.js";

let sales = [];

class Sale {

    constructor(item, quantidadeVenda) {
        this.id = randomUUID();
        this.date = new Date().toLocaleDateString("pt-BR");
        this.item = item;
        this.quantidadeVenda = quantidadeVenda;
        this.precoUnitario = item.preco;
        this.subtotal = item.preco * quantidadeVenda;
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

function agruparPorItem(carrinho) {
    const agrupado = new Map();

    for (const entrada of carrinho) {
        const item = gerenciadorEstoque.getItemById(entrada.item.id);

        if (!item) {
            console.log(`"${entrada.item.nome}" não está mais no estoque.`);
            return null;
        }

        const quantidade = agrupado.get(item.id)?.quantidade ?? 0;
        agrupado.set(item.id, { item, quantidade: quantidade + entrada.quantidade });
    }

    return [...agrupado.values()];
}

function validarDisponibilidade(linhas) {
    for (const { item, quantidade } of linhas) {
        if (!Number.isInteger(quantidade) || quantidade <= 0) {
            console.log(`Quantidade inválida para "${item.nome}".`);
            return false;
        }
        if (!Number.isFinite(item.quantidade) || item.quantidade < quantidade) {
            const disponivel = Number.isFinite(item.quantidade) ? item.quantidade : 0;
            console.log(`Estoque insuficiente para "${item.nome}": pedido ${quantidade}, disponível ${disponivel}.`);
            return false;
        }
    }
    return true;
}

function exibirRecibo(vendas, total) {
    console.log("=== Recibo da compra ===");
    vendas.forEach(venda => {
        console.log(
            `${venda.quantidadeVenda}x ${venda.item.nome} ` +
            `(${formatarMoeda(venda.precoUnitario)} un.) = ` +
            `${formatarMoeda(venda.subtotal)}`
        );
    });
    console.log("------------------------");
    console.log(`Total: ${formatarMoeda(total)}`);
    console.log("Compra finalizada com sucesso!");
}

function finalizarCompra(carrinho) {
    if (!Array.isArray(carrinho) || carrinho.length === 0) {
        console.log("Carrinho vazio. Adicione itens antes de finalizar a compra.");
        return null;
    }

    const linhas = agruparPorItem(carrinho);
    if (!linhas) return null;

    if (!validarDisponibilidade(linhas)) return null;

    const vendas = [];
    for (const { item, quantidade } of linhas) {
        const venda = createSale(item, quantidade);
        if (!venda) {
            console.log("Não foi possível registrar a venda.");
            return null;
        }
        vendas.push(venda);
    }

    const total = vendas.reduce((soma, venda) => soma + venda.subtotal, 0);
    exibirRecibo(vendas, total);
    carrinho.length = 0;

    return { vendas, total };
}

function getSales() {
    return sales;
}

export { createSale, finalizarCompra, getSales };
