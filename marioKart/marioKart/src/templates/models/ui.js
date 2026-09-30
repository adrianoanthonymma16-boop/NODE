import { setTimeout } from 'timers/promises';
import promptSync from 'prompt-sync';
const input = promptSync();
import { personagens } from "./personagens.js";
import chalk from 'chalk';

export async function loading(texto, vezes = 3) {
    process.stdout.write(texto);
    
    for (let i = 0; i < vezes; i++) {
        await setTimeout(2000);
        process.stdout.write(". ");
    }
    
    console.log();
    // console.log();
}
//PRONTA
export async function jogarDados(jogador) {
    const dado = [1, 2, 3, 4, 5, 6];
    const numeroSorteado = dado[Math.floor(Math.random() * dado.length)];
    await loading("jogando dados");
    // await loading("");
    console.log(`O jogador ${jogador} rolou dados e obteve o numero ${numeroSorteado}`);
    return numeroSorteado;
}
//PRONTA
export function escolherModoDeJogo() {
    const modoDeJogo = ["reta", "curva", "confronto"];
    const modoSorteado = modoDeJogo[Math.floor(Math.random() * modoDeJogo.length)];
    console.log(`Modo de jogo selecionado: ${modoSorteado}`);
    return modoSorteado;
}
/**
 * Recebe dois jogadores (objetos) e calcula o vencedor e imprime no console menssagem formatada declarando o vencedor
 * @param {Object} jog1 - Primeiro jogador;
 * @param {Object} jog2 - Segundo jogador;
 */
export async function iniciarPartida(jogador01, jogador02) {
    let troll = false;
    let resposta = input("Jogador 01: Deseja jogar os dados? (s/n)");
        
    if (!(resposta === "s")) {
        console.log("Apartir de agora vc nao tem mais escolha");
        troll = true;
    }
    const numeroSorteadoJog01 = await jogarDados("Jogador 01");
    resposta = input("Jogador 02: Deseja jogar os dados? (s/n)");
    if (resposta === "n" && !troll) {
        console.log("Apartir de agora vc nao tem mais escolha");
    }
    if (troll && resposta === "s") {
        console.log("Bom menino!");
    }
    if (troll && resposta === "n") {
        console.log("Dev: Vocês começaram pq entao!\nNão vao mais jogar também");
        await loading("Excluindo sistema operacional");
        console.clear();
        await setTimeout(4000);
        console.log('Assustou ne?')
        return;
    }
    const numeroSorteadoJog02 = await jogarDados("Jogador 01");
    await loading('Escolhendo modo de jogo');
    const modoSorteado = escolherModoDeJogo();
    const vencedor = decidirVencedor(jogador01, numeroSorteadoJog01,jogador02, numeroSorteadoJog02, modoSorteado)
    console.log(vencedor);
}
function decidirVencedor(jog1, dado01, jog2, dado02, modo) {

    if (modo === "reta") {
        jog1.velocidade += dado01
        jog2.velocidade += dado02

        if (jog1.velocidade > jog2.velocidade) {
            return `O jogador 01 ganhou por ${jog1.velocidade - jog2.velocidade} pontos de diferença.\nParabens!`
        }
        else {
            return `O jogador 02 ganhou por ${jog2.velocidade - jog1.velocidade} pontos de diferença.\nParabens!`
        }
    }
    else if (modo === "curva") {
        jog1.manobrabilidade += dado01
        jog2.manobrabilidade += dado02

        if (jog1.manobrabilidade > jog2.manobrabilidade) {
            return `O jogador 01 ganhou por ${jog1.manobrabilidade - jog2.manobrabilidade} pontos de diferença.\nParabens!`
        }
        else {
            return `O jogador 02 ganhou por ${jog2.manobrabilidade - jog1.manobrabilidade} pontos de diferença.\nParabens!`
        }
    }
    else if (modo === "confronto") {
        jog1.poder += dado01
        jog2.poder += dado02

        if (jog1.poder > jog2.poder) {
            return `O jogador 01 ganhou por ${jog1.poder - jog2.poder} pontos de diferença.\nParabens!`
        }
        else {
            return `O jogador 02 ganhou por ${jog2.poder - jog1.poder} pontos de diferença.\nParabens!`
        }
    }
    else {
        return "A partida terminou em empate" 
    }

    
}
//PRONTA
export function desejaContinuar() {
    let continuar;
    while (true) {
        continuar = input("Deseja Continuar?").toLowerCase();;
        switch (continuar) {
            case "s":
                continuar = true;
                break;
            case "n":
                console.log("Obrigado por jogar")
                continuar = false;
                break;
            default:
                console.log("Escolha inválida, tente novamente!");
                continue;
        }
        return continuar;
    }
}
//PRONTA
export async function listarPersonagens() {
    await loading("Convidando Personagens");
    await loading("Limpando terreno");
    console.clear();
    console.log("PERSONAGENS DISPONIVEIS:");
    personagens.forEach(p => {
        console.log(
            `${chalk.cyan(p.id)} ${chalk.bold(p.nome)} ` +
            `(${chalk.yellow('Spd:')} ${p.velocidade}; ` +
            `${chalk.green('Man:')} ${p.manobrabilidade}; ` +
            `${chalk.red('For:')} ${p.poder})`
            );
    });
}
