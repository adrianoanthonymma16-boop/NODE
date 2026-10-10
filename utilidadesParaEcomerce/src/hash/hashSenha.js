const argon2 = require("argon2");
const { REGRAS_SENHA } = require("../validators/regraDeSenha.js");

async function Hash(senha) {
    const ERROS = verificarPadraoDeSenha(senha);
    
    if (ERROS.length > 0) {
        console.log("❌ Erros:");
        ERROS.forEach(e => console.log("- " + e));
        return null;
    }
    
    const hash = await argon2.hash(senha);
    return hash;
}

function verificarPadraoDeSenha(senha) {
    return REGRAS_SENHA
        .filter(regra => regra.ativo && !regra.teste(senha))
        .map(regra => regra.mensagem);
}

module.exports = { Hash };