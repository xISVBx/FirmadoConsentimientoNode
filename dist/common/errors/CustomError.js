"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomError = void 0;
class CustomError extends Error {
    constructor(message, status) {
        super(message);
        this.status = status;
    }
    static NotFound(message) {
        return new CustomError(message, 404);
    }
    static BadRequest(message) {
        return new CustomError(message, 400);
    }
    static InternalServerError(message) {
        return new CustomError(message, 500);
    }
}
exports.CustomError = CustomError;
