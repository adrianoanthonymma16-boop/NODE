const PromptSync = require("prompt-sync");
const input = PromptSync();

function desejaContinuar() {
    while (true) {
        console.log("Deseja Continuar? (s/n)");
        const resposta = input(">>> ").trim().toLowerCase();
        let selecao;
        switch (resposta) {
            case "s":
                selecao = true;
                break;
            case "n":
                selecao = false;
                break;
            default:
                continue;
        }
        return selecao;
    }
}
module.exports = {
    desejaContinuar
}