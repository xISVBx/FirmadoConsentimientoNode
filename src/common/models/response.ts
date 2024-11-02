export class ResponseGeneric<T> {
    public data: T | null; // Permitir null como un valor válido
    public isSucces: boolean;
    public message: string;

    constructor(data: T | null, isSucces: boolean, message: string) {
        this.data = data;
        this.isSucces = isSucces;
        this.message = message;
    }

    // Constructor para respuestas de éxito
    static Success<T>(data: T, message: string = "Operación exitosa"): ResponseGeneric<T> {
        return new ResponseGeneric(data, true, message);
    }

    // Constructor para respuestas de error
    static Error<T>(message: string = "Ocurrió un error", data: T | null = null): ResponseGeneric<T> {
        return new ResponseGeneric(data, false, message);
    }
}
