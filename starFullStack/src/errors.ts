/**
 * Erro com status HTTP embutido.
 * Permite que o serviço sinalize o status certo sem cada rota ter seu próprio try/catch.
 */
export class HttpError extends Error {
    constructor(
        readonly status: number,
        message: string,
        readonly detail?: string
    ) {
        super(message);
        this.name = "HttpError";
    }
}
