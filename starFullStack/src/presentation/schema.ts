/**
 * Esquema de exibição — vive no backend.
 *
 * O cliente não conhece rótulos, unidades nem formatação: recebe o texto final
 * pronto. Aqui ficam os rótulos em pt-BR, as unidades e as regras de formatação.
 */

export type Recurso = {
    /** Nome no singular, usado no card e no cabeçalho da ficha. */
    singular: string;
    /** Nome no plural, usado no título da listagem. */
    plural: string;
    /** Campo usado como título do card e da ficha. */
    titulo: string;
    /** Campos mostrados no card — a ficha mostra todos. */
    destaques: readonly string[];
};

/** Recursos expostos pela API. Serve de whitelist: nada fora daqui chega à SWAPI. */
export const RECURSOS = {
    films: {
        singular: "Filme",
        plural: "Filmes",
        titulo: "title",
        destaques: ["episode_id", "release_date", "director"],
    },
    species: {
        singular: "Espécie",
        plural: "Espécies",
        titulo: "name",
        destaques: ["classification", "language", "average_lifespan"],
    },
    people: {
        singular: "Personagem",
        plural: "Personagens",
        titulo: "name",
        destaques: ["birth_year", "gender", "height"],
    },
    planets: {
        singular: "Planeta",
        plural: "Planetas",
        titulo: "name",
        destaques: ["climate", "terrain", "population"],
    },
    starships: {
        singular: "Nave",
        plural: "Naves",
        titulo: "name",
        destaques: ["model", "starship_class", "cost_in_credits"],
    },
    vehicles: {
        singular: "Veículo",
        plural: "Veículos",
        titulo: "name",
        destaques: ["model", "vehicle_class", "cost_in_credits"],
    },
} satisfies Record<string, Recurso>;

export type Slug = keyof typeof RECURSOS;

/** `hasOwnProperty` também barra `__proto__` e `constructor`. */
export function ehRecurso(valor: string): valor is Slug {
    return Object.prototype.hasOwnProperty.call(RECURSOS, valor);
}

/** Valor vazio na tela. */
export const VAZIO = "—";

const ROMANOS: Record<number, string> = {
    1: "I",
    2: "II",
    3: "III",
    4: "IV",
    5: "V",
    6: "VI",
    7: "VII",
    8: "VIII",
    9: "IX",
};

/** Unidade acrescentada quando o valor é numérico. */
const UNIDADES: Record<string, string> = {
    height: "cm",
    mass: "kg",
    length: "m",
    diameter: "km",
    orbital_period: "h",
    rotation_period: "h",
    surface_water: "%",
    population: "hab.",
    average_height: "cm",
    average_lifespan: "anos",
    cost_in_credits: "créditos",
    cargo_capacity: "kg",
    max_atmosphering_speed: "km/h",
    MGLT: "MGLT",
};

/** Rótulos em pt-BR para as chaves conhecidas da SWAPI. */
const ROTULOS: Record<string, string> = {
    name: "Nome",
    title: "Título",
    height: "Altura",
    mass: "Massa",
    hair_color: "Cor do cabelo",
    skin_color: "Cor da pele",
    eye_color: "Cor dos olhos",
    birth_year: "Ano de nascimento",
    gender: "Gênero",
    homeworld: "Planeta natal",
    films: "Filmes",
    species: "Espécies",
    vehicles: "Veículos",
    starships: "Naves",
    created: "Criado em",
    edited: "Editado em",
    url: "Registro original",

    episode_id: "Episódio",
    opening_crawl: "Texto de abertura",
    director: "Direção",
    producer: "Produção",
    release_date: "Lançamento",
    characters: "Personagens",

    rotation_period: "Período de rotação",
    orbital_period: "Período orbital",
    diameter: "Diâmetro",
    climate: "Clima",
    gravity: "Gravidade",
    terrain: "Terreno",
    surface_water: "Água na superfície",
    population: "População",
    residents: "Residentes",

    classification: "Classificação",
    designation: "Designação",
    average_height: "Altura média",
    skin_colors: "Cores da pele",
    hair_colors: "Cores do cabelo",
    eye_colors: "Cores dos olhos",
    average_lifespan: "Expectativa de vida",
    language: "Idioma",
    people: "Personagens",

    model: "Modelo",
    manufacturer: "Fabricante",
    cost_in_credits: "Custo (créditos)",
    length: "Comprimento",
    max_atmosphering_speed: "Velocidade atmosférica máx.",
    crew: "Tripulação",
    passengers: "Passageiros",
    cargo_capacity: "Capacidade de carga",
    consumables: "Consumíveis",
    hyperdrive_rating: "Classe do hiperpropulsor",
    MGLT: "MGLT",
    starship_class: "Classe da nave",
    vehicle_class: "Classe do veículo",
    pilots: "Pilotos",

    json: "JSON do registro",
};

/** Chave da API -> rótulo legível. Campo novo ganha rótulo automático. */
export function rotulo(chave: string): string {
    const conhecido = ROTULOS[chave];
    if (conhecido) return conhecido;

    const texto = String(chave).replace(/_/g, " ");
    return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function comUnidade(chave: string, valor: string): string {
    const unidade = UNIDADES[chave];
    if (!unidade) return valor;
    return unidade === "%" ? `${valor}%` : `${valor} ${unidade}`;
}

const SO_DATA = /^(\d{4})-(\d{2})-(\d{2})$/;

export function formatarData(texto: string): string {
    const soData = SO_DATA.exec(texto);
    if (soData) return `${soData[3]}/${soData[2]}/${soData[1]}`;

    const data = new Date(texto);
    if (Number.isNaN(data.getTime())) return texto;

    return new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "medium",
        timeZone: "UTC",
    }).format(data);
}

/**
 * Traduz um valor escalar da API para o texto exibido.
 * Datas, números (com unidade) e "unknown"/"n/a" têm tratamento próprio.
 */
export function formatar(chave: string, valor: unknown): string {
    if (valor === null || valor === undefined) return VAZIO;

    const texto = String(valor).trim();
    if (!texto) return VAZIO;

    const minusculo = texto.toLowerCase();
    if (
        minusculo === "unknown" ||
        minusculo === "n/a" ||
        minusculo === "none" ||
        minusculo === "null"
    ) {
        return VAZIO;
    }
    if (minusculo === "indefinite") return "Indefinido";

    if (chave === "created" || chave === "edited" || chave === "release_date") {
        return formatarData(texto);
    }

    if (chave === "episode_id") {
        return ROMANOS[Number(texto)] ?? texto;
    }

    // "1,358" -> milhar em inglês
    if (/^\d{1,3}(,\d{3})+$/.test(texto)) {
        return comUnidade(chave, Number(texto.replace(/,/g, "")).toLocaleString("pt-BR"));
    }

    if (/^-?\d+(\.\d+)?$/.test(texto)) {
        const numero = Number(texto);
        const formatado =
            Number.isInteger(numero) && Math.abs(numero) >= 1000
                ? numero.toLocaleString("pt-BR")
                : texto.replace(".", ",");
        return comUnidade(chave, formatado);
    }

    return texto;
}
