import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { finalizarCompra, getSales } from "../src/models/venda.js";
import { estoque } from "../src/models/estoque.js";
import { Item } from "../src/models/itens.js";

const CAMISETA = 29.99;
const TENIS = 149.99;

let vendasIniciais;

function entrada(item, quantidade) {
    return { item, quantidade };
}

beforeEach(() => {
    estoque.forEach(item => {
        item.quantidade = 10;
        item.disponivel = true;
    });
    vendasIniciais = getSales().length;
});

test("carrinho vazio não finaliza a compra", () => {
    const resultado = finalizarCompra([]);

    assert.equal(resultado, null);
    assert.equal(getSales().length, vendasIniciais);
});

test("calcula o total somando a quantidade de cada item", () => {
    const camiseta = estoque.find(item => item.nome === "Camiseta");
    const tenis = estoque.find(item => item.nome === "Tênis");
    const carrinho = [entrada(camiseta, 3), entrada(tenis, 2)];

    const resultado = finalizarCompra(carrinho);

    assert.ok(resultado);
    assert.ok(Math.abs(resultado.total - (3 * CAMISETA + 2 * TENIS)) < 0.01);
    assert.equal(camiseta.quantidade, 7);
    assert.equal(tenis.quantidade, 8);
});

test("item repetido no carrinho soma as quantidades em uma única venda", () => {
    const camiseta = estoque.find(item => item.nome === "Camiseta");
    const carrinho = [entrada(camiseta, 2), entrada(camiseta, 3)];

    const resultado = finalizarCompra(carrinho);

    assert.ok(resultado);
    assert.equal(resultado.vendas.length, 1);
    assert.equal(resultado.vendas[0].quantidadeVenda, 5);
    assert.ok(Math.abs(resultado.total - 5 * CAMISETA) < 0.01);
    assert.equal(camiseta.quantidade, 5);
});

test("limpa o carrinho depois de finalizar", () => {
    const camiseta = estoque.find(item => item.nome === "Camiseta");
    const carrinho = [entrada(camiseta, 1)];

    finalizarCompra(carrinho);

    assert.equal(carrinho.length, 0);
});

test("registra a venda no histórico", () => {
    const camiseta = estoque.find(item => item.nome === "Camiseta");
    const carrinho = [entrada(camiseta, 2)];

    finalizarCompra(carrinho);

    const historico = getSales();
    assert.equal(historico.length, vendasIniciais + 1);
    assert.equal(historico[historico.length - 1].quantidadeVenda, 2);
});

test("estoque zerado marca o item como indisponível", () => {
    const camiseta = estoque.find(item => item.nome === "Camiseta");
    camiseta.quantidade = 2;

    const resultado = finalizarCompra([entrada(camiseta, 2)]);

    assert.ok(resultado);
    assert.equal(camiseta.quantidade, 0);
    assert.equal(camiseta.disponivel, false);
});

test("não vende mais do que o estoque permite", () => {
    const camiseta = estoque.find(item => item.nome === "Camiseta");
    const mochila = estoque.find(item => item.nome === "Mochila");
    const carrinho = [entrada(camiseta, 4), entrada(mochila, 11)];

    const resultado = finalizarCompra(carrinho);

    assert.equal(resultado, null);
    assert.equal(carrinho.length, 2);
});

test("falha em um item invalida a compra inteira (sem venda parcial)", () => {
    const camiseta = estoque.find(item => item.nome === "Camiseta");
    const mochila = estoque.find(item => item.nome === "Mochila");
    const carrinho = [entrada(camiseta, 2), entrada(mochila, 999)];

    const resultado = finalizarCompra(carrinho);

    assert.equal(resultado, null);
    assert.equal(camiseta.quantidade, 10);
    assert.equal(mochila.quantidade, 10);
    assert.equal(getSales().length, vendasIniciais);
    assert.equal(carrinho.length, 2);
});

test("item fora do estoque bloqueia a finalização", () => {
    const camiseta = estoque.find(item => item.nome === "Camiseta");
    const carrinho = [entrada({ ...camiseta, id: 9999, nome: "Item Apagado" }, 1)];

    const resultado = finalizarCompra(carrinho);

    assert.equal(resultado, null);
    assert.equal(getSales().length, vendasIniciais);
});

test("vende item adicionado pelo usuário, sem depender dos padrões", () => {
    const fone = new Item("Fone de Ouvido", 79.9, 3);
    estoque.push(fone);

    try {
        const resultado = finalizarCompra([entrada(fone, 3)]);

        assert.ok(resultado);
        assert.ok(Math.abs(resultado.total - 3 * 79.9) < 0.01);
        assert.equal(fone.quantidade, 0);
        assert.equal(fone.disponivel, false);
        assert.equal(resultado.vendas[0].item.id, fone.id);
    } finally {
        estoque.splice(estoque.indexOf(fone), 1);
    }
});

test("item do usuário sem estoque suficiente também é barrado", () => {
    const teclado = new Item("Teclado Mecânico", 250, 2);
    estoque.push(teclado);

    try {
        const resultado = finalizarCompra([entrada(teclado, 3)]);

        assert.equal(resultado, null);
        assert.equal(teclado.quantidade, 2);
        assert.equal(getSales().length, vendasIniciais);
    } finally {
        estoque.splice(estoque.indexOf(teclado), 1);
    }
});

test("mescla item do usuário com itens padrão em uma única compra", () => {
    const boné = estoque.find(item => item.nome === "Boné");
    const mochila = new Item("Mochila de Montanha", 199.99, 2);
    estoque.push(mochila);

    try {
        const resultado = finalizarCompra([entrada(boné, 2), entrada(mochila, 1)]);

        assert.ok(resultado);
        assert.equal(resultado.vendas.length, 2);
        assert.ok(Math.abs(resultado.total - (2 * 19.99 + 199.99)) < 0.01);
        assert.equal(boné.quantidade, 8);
        assert.equal(mochila.quantidade, 1);
    } finally {
        estoque.splice(estoque.indexOf(mochila), 1);
    }
});
