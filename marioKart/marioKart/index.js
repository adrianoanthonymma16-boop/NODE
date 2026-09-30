import {desejaContinuar, listarPersonagens, iniciarPartida } from "./src/templates/models/ui.js"
import { personagens } from "./src/templates/models/personagens.js";
import promptSync from 'prompt-sync';
async function main() {
    const id = Array.from({ length: personagens.length }, (_, i) => i + 1);
    const input = promptSync();
    
    while (true) {      
        await listarPersonagens();
        let jogador01 = parseInt(input("JOGADOR 1: Escolha seu personagem: "));
        let jogador02 = parseInt(input("JOGADOR 2: Escolha seu personagem: "));

        if (!id.includes(jogador01) || !id.includes(jogador02)) {
            console.log("Seleção de jogador invalida, tente novamente");
            continue;
        }

        for (let i = 0; i < personagens.length; i++) {
            const personagen = personagens[i];
            if (jogador01 === personagen.id) {
                jogador01 = personagen;
            }
            if (jogador02 === personagen.id) {
                jogador02 = personagen;
            }
        }
        console.log(`O jogador 01 Escolheu o personagem ${jogador01.nome}`);
        console.log(`O jogador 02 Escolheu o personagem ${jogador02.nome}`);

        await iniciarPartida(jogador01, jogador02);
        
        const continuar = desejaContinuar();
        switch (continuar) {
            case true:
                console.clear();
                continue;
            case false:
                return;                
        }
    }
}
await main();