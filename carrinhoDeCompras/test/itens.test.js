import { test } from "node:test";
import assert from "node:assert/strict";
import { Item } from "../src/models/itens.js";
import { validarItem } from "../src/utils/utils.js";

test("cria item com quantidade definida", () => {
    const item = new Item("Fone de Ouvido", 79.9, 4);

    assert.equal(item.nome, "Fone de Ouvido");
    assert.equal(item.preco, 79.9);
    assert.equal(item.quantidade, 4);
    assert.equal(item.disponivel, true);
});

test("item sem quantidade informada começa com o padrão", () => {
    const item = new Item("Fone de Ouvido", 79.9);

    assert.equal(item.quantidade, 10);
    assert.equal(item.disponivel, true);
});

test("item criado sem estoque já nasce indisponível", () => {
    const item = new Item("Fone de Ouvido", 79.9, 0);

    assert.equal(item.disponivel, false);
});

test("validarItem aceita dados válidos", () => {
    assert.deepEqual(validarItem("Fone de Ouvido", 79.9, 4), []);
});

test("validarItem rejeita quantidade inválida", () => {
    assert.ok(validarItem("Fone de Ouvido", 79.9, 0).length > 0);
    assert.ok(validarItem("Fone de Ouvido", 79.9, -2).length > 0);
    assert.ok(validarItem("Fone de Ouvido", 79.9, 1.5).length > 0);
    assert.ok(validarItem("Fone de Ouvido", 79.9, NaN).length > 0);
});
