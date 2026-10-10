const promptSync = require('prompt-sync');
const { desejaContinuar } = require('./utils/utils.js');
const { gerarQrCode } = require('./utils/qrcodeConfig.js');
const {Hash} = require("./hash/hashSenha.js")
const input = promptSync();
const separador = "==============="

async function main() {
    while (true) {
        try {
            console.log(`Ferramentas para e-comerce\n`+
                `1. Para gerar QrCode\n`+
                `2. Para hash de senha\n`);
            let alternativa = parseInt(input(">>> "))

            switch (alternativa) {
                case 1:
                    console.clear();
                    console.log("Gerador de QrCode");
                    console.log(separador);
                    console.log("Insira a url para conversão:");
                    let urlParaQrCode = input(">>> ");
                    gerarQrCode(urlParaQrCode);
                    break;
            
                case 2:
                    console.clear();
                    console.log("Gerador de Senha Segura");
                    console.log(separador);
                    console.log("Insira a senha para fazer a segurança:");
                    let senhaParaHash = input(">>> ");
                    let senhaSegura = await Hash(senhaParaHash);
                    if (senhaSegura) console.log(senhaSegura)
                    break;
            }
            
            let continuar = desejaContinuar();
            if (continuar) continue;
            else return;
        
        } catch (error) {
            console.log(error.message);
            continue;
        }
    }
}
main();