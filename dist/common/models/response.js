"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseGeneric = void 0;
class ResponseGeneric {
    constructor(data, isSucces, message) {
        this.data = data;
        this.isSucces = isSucces;
        this.message = message;
    }
    // Constructor para respuestas de éxito
    static Success(data, message = "Operación exitosa") {
        return new ResponseGeneric(data, true, message);
    }
    // Constructor para respuestas de error
    static Error(message = "Ocurrió un error", data = null) {
        return new ResponseGeneric(data, false, message);
    }
}
exports.ResponseGeneric = ResponseGeneric;
