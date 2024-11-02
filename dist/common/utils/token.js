"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = generateToken;
exports.verifyToken = verifyToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function generateToken(payload, expiresIn) {
    const options = expiresIn ? { expiresIn } : {};
    const SECRET_KEY = process.env.SECRET_KEY || "secreto secretoso";
    return jsonwebtoken_1.default.sign(payload, SECRET_KEY, options);
}
function verifyToken(token) {
    const SECRET_KEY = process.env.SECRET_KEY || 'secreto secretoso'; // Usa la misma clave secreta que al generar el token
    try {
        // Verifica el token y decodifica el payload
        const decoded = jsonwebtoken_1.default.verify(token, SECRET_KEY);
        return decoded;
    }
    catch (error) {
        console.error('Error al verificar el token: ', error);
        return null;
    }
}
