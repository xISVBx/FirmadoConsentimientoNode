import jwt from 'jsonwebtoken';

// Define la interfaz para el payload del JWT
export interface ConsentimientoSend {
    nombreAgente: string;
    numeroProductor: string;
    telefonoAgente: string;
    correoAgente: string;
    consentimientoId: string;
}

export interface StatementSend {
    nombreAgente: string;
    codigoPostal: string;
    ingresoAnual: string;
    compania: string;
    plan: string;
    consentimientoId: string;
}

export function generateToken(payload: any, expiresIn?: string): string {
    const options = expiresIn ? { expiresIn } : {};
    const SECRET_KEY = process.env.SECRET_KEY || "secreto secretoso";
    return jwt.sign(payload, SECRET_KEY, options);
}

export function verifyToken(token: string): any | null {
    const SECRET_KEY = process.env.SECRET_KEY || 'secreto secretoso'; // Usa la misma clave secreta que al generar el token

    try {
        // Verifica el token y decodifica el payload
        const decoded = jwt.verify(token, SECRET_KEY) as ConsentimientoSend;
        return decoded;
    } catch (error) {
        console.error('Error al verificar el token: ', error);
        return null;
    }
}