import jwt from 'jsonwebtoken';

// Define la interfaz para el payload del JWT
export interface Agente {
    nombreAgente: string;
    numeroProductor: string;
    telefonoAgente: string;
    correoAgente: string;
}

export function generateToken(payload: Agente, expiresIn?: string): string {
    const options = expiresIn ? { expiresIn } : {};
    const SECRET_KEY = process.env.SECRET_KEY || "secreto secretoso";
    return jwt.sign(payload, SECRET_KEY, options);
}

export function verifyToken(token: string): Agente | null {
    const SECRET_KEY = process.env.SECRET_KEY || 'secreto secretoso'; // Usa la misma clave secreta que al generar el token

    try {
        // Verifica el token y decodifica el payload
        const decoded = jwt.verify(token, SECRET_KEY) as Agente;
        return decoded;
    } catch (error) {
        console.error('Error al verificar el token: ', error);
        return null;
    }
}