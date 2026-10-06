import PromptSync from "prompt-sync";
const prompt = PromptSync();

function validarItem(nome, preco, quantidade, itensExistentes = []) {
    const erros = [];
    
    // // ============================================
    // // ID — deve ser número inteiro positivo e único
    // // ============================================
    // if (typeof id !== "number" || isNaN(id)) {
    //     erros.push("ID deve ser um número");
    // } else if (!Number.isInteger(id)) {
    //     erros.push("ID deve ser um número inteiro");
    // } else if (id <= 0) {
    //     erros.push("ID deve ser positivo");
    // } else if (itensExistentes.some(i => i.id === id)) {
    //     erros.push(`ID ${id} já existe`);
    // }
    
    // ============================================
    // NOME — string, 3-100 caracteres, sem só espaços
    // ============================================
    if (typeof nome !== "string") {
        erros.push("Nome deve ser texto");
    } else if (nome.trim().length === 0) {
        erros.push("Nome não pode ser vazio");
    } else if (nome.trim().length < 3) {
        erros.push("Nome deve ter pelo menos 3 caracteres");
    } else if (nome.length > 100) {
        erros.push("Nome muito longo (máx 100 caracteres)");
    } else if (!/^[a-zA-ZÀ-ÿ0-9\s]+$/.test(nome.trim())) {
        erros.push("Nome contém caracteres inválidos");
    }
    
    // ============================================
    // PREÇO — número positivo, até 2 casas decimais
    // ============================================
    if (typeof preco !== "number" || isNaN(preco)) {
        erros.push("Preço deve ser um número");
    } else if (preco <= 0) {
        erros.push("Preço deve ser positivo");
    } else if (preco > 1_000_000) {
        erros.push("Preço muito alto (máx 1.000.000)");
    } else if (!/^\d+(\.\d{1,2})?$/.test(preco.toString())) {
        erros.push("Preço deve ter no máximo 2 casas decimais");
    }
    
    // ============================================
    // QUANTIDADE — inteiro positivo, até 10.000
    // ============================================
    if (typeof quantidade !== "number" || isNaN(quantidade)) {
        erros.push("Quantidade deve ser um número");
    } else if (!Number.isInteger(quantidade)) {
        erros.push("Quantidade deve ser um número inteiro");
    } else if (quantidade <= 0) {
        erros.push("Quantidade deve ser positiva");
    } else if (quantidade > 10_000) {
        erros.push("Quantidade muito alta (máx 10.000)");
    }
    
    return erros;
}
function continuar() {
    let escolha;
    while (true) {
        let continuar = prompt("(s/n) >>> ").toLowerCase();
        switch (continuar) {
            case "s":
                escolha = true;
                return escolha;
            case "n":
                escolha = false;
                return escolha;
            default:
                console.log("Alternativa inválida, tente novamente!");
                continue;
        }
    }
}

function formatarMoeda(valor) {
    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

export { validarItem, continuar, formatarMoeda };