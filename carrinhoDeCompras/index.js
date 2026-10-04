import promptSync from "prompt-sync";
import * as estoque from "./src/models/estoque.js";
const prompt = promptSync();
function Main() {
    while (true) {
        console.log("=== Menu Principal ===");
        console.log("1 - Listar itens disponíveis\n" +
            "2 - Adicionar item ao estoque\n" +
            "3 - Remover item do estoque\n" +
            "4 - Aumentar quantidade de item\n" +
            "5 - Diminuir quantidade de item\n" +
            "6 - Adicionar item ao carrinho\n" +
            "7 - Remover item do carrinho\n" +
            "8 - Listar itens no carrinho\n" +
            "9 - Finalizar compra\n" +
            "10 - Sair"
        );
        const opcao = prompt(">>> ");
        // SAIR
        if (opcao === "10") {
            console.log("Saindo do programa...");
            return;
        }

        //CONTROLE DE OPÇÕES
        switch (opcao) {
            //pronto
            case "1":
                estoque.getEstoqueDisponivel();
                break;
            //pronto
            case "2":
                estoque.createItem();
                break;
            case "3":
                const idToRemove = parseInt(prompt("Digite o ID do item a ser removido: "));
                try {
                    estoque.removeItem(idToRemove);
                } catch (error) {
                    console.error(error.message);
                }
                break;
            case "4":
                const idToIncrease = parseInt(prompt("Digite o ID do item para aumentar a quantidade: "));
                const quantityToIncrease = parseInt(prompt("Digite a quantidade a ser adicionada: "));
                try {
                    estoque.increaseItemQuantity(idToIncrease, quantityToIncrease);
                    console.log(`Quantidade do item com ID ${idToIncrease} aumentada em ${quantityToIncrease}.`);
                } catch (error) {
                    console.error(error.message);
                }
                break;
            case "5":
                const idToDecrease = parseInt(prompt("Digite o ID do item para diminuir a quantidade: "));
                const quantityToDecrease = parseInt(prompt("Digite a quantidade a ser removida: "));
                try {
                    estoque.decreaseItemQuantity(idToDecrease, quantityToDecrease);
                    console.log(`Quantidade do item com ID ${idToDecrease} diminuída em ${quantityToDecrease}.`);
                } catch (error) {
                    console.error(error.message);
                }
                break;
            case "6":
                // Adicionar item ao carrinho
                break;
            case "7":
                // Remover item do carrinho
                break;
            case "8":
                // Listar itens no carrinho
                break;
            case "9":
                // Finalizar compra
                break;
            default:
                console.log("Opção inválida. Tente novamente.");
        }   
    }
}
Main();