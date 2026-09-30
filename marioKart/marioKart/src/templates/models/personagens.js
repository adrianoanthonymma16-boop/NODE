export let personagens = []  

class Personagem{
    constructor(id, nome, velocidade, manobrabilidade, poder) {
        this.id = id;
        this.nome = nome;
        this.velocidade = velocidade;
        this.manobrabilidade = manobrabilidade;
        this.poder = poder;
        this.pontuacao = 0;
    }
}

function personagensPadrao() {
    return [
       new Personagem(1, "Mario", 4, 3, 3),
       new Personagem(2, "Princesa Peach", 3, 4, 2),
       new Personagem(3, "Yoshi", 2, 4, 3),
       new Personagem(4, "Bowser", 5, 2, 5),
       new Personagem(5, "Luigi", 3, 4, 4),
       new Personagem(6, "Donkey Kong", 2, 2, 5),
    ];
}

personagens = personagensPadrao();