require("dotenv").config();

const TAMANHO_MINIMO = parseInt(process.env.TAMANHO_MINIMO_SENHA) || 6;
const EXIGE_MAIUSCULA = process.env.CARACTERE_MAIUSCULO === "true";
const EXIGE_MINUSCULA = process.env.CARACTERE_MINUSCULO === "true";
const EXIGE_NUMERO = process.env.CARACTERE_NUMERICO === "true";
const EXIGE_ESPECIAL = process.env.CARACTERE_ESPECIAL === "true";

const REGRAS_SENHA = [
    {
        id: "tamanho",
        ativo: true,
        teste: (senha) => senha.length >= TAMANHO_MINIMO,
        mensagem: `Senha deve ter pelo menos ${TAMANHO_MINIMO} caracteres`
    },
    {
        id: "maiuscula",
        ativo: EXIGE_MAIUSCULA,
        teste: (senha) => /[A-Z]/.test(senha),
        mensagem: "Senha deve ter pelo menos 1 letra maiúscula"
    },
    {
        id: "minuscula",
        ativo: EXIGE_MINUSCULA,
        teste: (senha) => /[a-z]/.test(senha),
        mensagem: "Senha deve ter pelo menos 1 letra minúscula"
    },
    {
        id: "numero",
        ativo: EXIGE_NUMERO,
        teste: (senha) => /[0-9]/.test(senha),
        mensagem: "Senha deve ter pelo menos 1 caractere numérico"
    },
    {
        id: "especial",
        ativo: EXIGE_ESPECIAL,
        teste: (senha) => /["!@#$%*()_+=\-§¬¢£³²¹'`^~}<>;:?\/°ºª]/.test(senha),
        mensagem: "Senha deve ter pelo menos 1 caractere especial"
    },
    {
        id: "sem-espaco",
        ativo: true,
        teste: (senha) => !/\s/.test(senha),
        mensagem: "Senha não pode conter espaços"
    }
];

module.exports = {
    REGRAS_SENHA
}; 