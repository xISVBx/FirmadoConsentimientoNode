import { IStatement } from "../../../domain/entities/IStatement";
import { getConnection } from "../context/database";
import { CustomError } from "../../../common/errors/CustomError";
import { StatementSend } from "common/utils/token";
import { FieldPacket } from "mysql2";

export const GuardarConsentimiento = async (base64Consentimiento: Uint8Array, nombreTitular: string, telefonoTitular: string,
    correoTitular: string, fechaNacimiento: string, idConsentimiento: string,
    pathConsentimiento: string, ip: string,
    location: string,
    qrCode: string): Promise<boolean> => {
    var conn = await getConnection();
    await conn.beginTransaction();
    try {

        const bufferConsentimiento = Buffer.from(base64Consentimiento);

        const resultConsentimiento = await conn.execute(
            `UPDATE consentimientos
            SET 
                path_consentimiento = ?, 
                consentimiento = ?, 
                created = ?, 
                ip = ?, 
                location = ?, 
                estado = 'created', 
                qr_code = ?
            WHERE id = ?;`,
            [
                pathConsentimiento,           // Nuevo path del consentimiento
                bufferConsentimiento,         // Consentimiento en formato binario (Buffer)
                new Date(),                   // Fecha y hora actual para el campo 'created'
                ip,                            // IP desde donde se actualiza
                location,                      // Location desde donde se actualiza
                qrCode,                        // El código QR generado
                idConsentimiento              // ID del consentimiento que queremos actualizar
            ]
        );

        let fechaNacimientoDate;
        if (fechaNacimiento) {
            fechaNacimientoDate = new Date(fechaNacimiento);
            if (isNaN(fechaNacimientoDate.getTime())) {
                fechaNacimientoDate = null; 
            }
        } else {
            fechaNacimientoDate = null; 
        }

        const resultDatos = await conn.execute(
            `INSERT INTO datos_consentimientos
            (id_consentimiento, nombre, telefono, correo, fecha_nacimiento)
            VALUES (?, ?, ?, ?, ?);`,
            [idConsentimiento, nombreTitular, telefonoTitular, correoTitular, fechaNacimientoDate]
        );
        await conn.commit();
        return true;
    } catch (e) {
        await conn.rollback();
        throw CustomError.InternalServerError(`${e}`)
    }
}

export const getConsentimientoById = async (idConsentimiento: string): Promise<any> => {
    const conn = await getConnection(); // Establecer conexión con la base de datos
    try {
        // Realizar la consulta para obtener todos los campos de la tabla 'consentimientos'
        const [rows]: [any[], FieldPacket[]] = await conn.execute(
            `SELECT id, path_consentimiento, consentimiento, created, viewed, enviado, ip, location, estado, qr_code 
            FROM consentimientos
            WHERE id = ?`, 
            [idConsentimiento]
        );

        // Verificar si se ha obtenido algún resultado
        if (rows.length === 0) {
            throw new Error("Consentimiento no encontrado");
        }

        // Retornar el primer resultado de la consulta
        return rows[0]; 
    } catch (error) {
        console.error("Error al obtener el consentimiento:", error);
        throw CustomError.InternalServerError(`Error al obtener el consentimiento: ${error}`);
    }
}

export const GuardarStatement = async (base64Consentimiento: Uint8Array, path: string, statement: IStatement, agente: StatementSend): Promise<boolean> => {
    var conn = await getConnection();
    await conn.beginTransaction();
    try {
        const bufferConsentimiento = Buffer.from(base64Consentimiento);

        const resultConsentimiento = await conn.execute(
            `UPDATE consentimientos
            SET 
                path_consentimiento = ?, 
                consentimiento = ?, 
                created = ?, 
                ip = ?, 
                location = ?, 
                estado = 'created', 
                qr_code = ?
            WHERE id = ?;`,
            [
                path, 
                bufferConsentimiento, 
                new Date(),
                '',
                '',
                '',
                agente.consentimientoId

            ]
        );
        const resultDatos = await conn.execute(
            `INSERT INTO datos_afirmaciones
            (id_consentimiento, codigoPostal, ingresoAnual, compania, plan, nombreConsumidor)
            VALUES (?, ?, ?, ?, ?, ?);`,
            [agente.consentimientoId, agente.codigoPostal, agente.ingresoAnual, agente.compania, agente.plan, statement.nombreConsumidor]
        );

        await conn.commit();
        return true;
    } catch (e) {
        await conn.rollback();
        throw CustomError.InternalServerError(`${e}`)
    }
}
//CREAR UN CONSENTMIENTO
export const createConsentimiento = async (idConsentimiento: string): Promise<boolean> => {
    const conn = await getConnection();  // Establecer la conexión con la base de datos
    await conn.beginTransaction();  // Comienza la transacción

    console.log(idConsentimiento)
    try {
        // Insertamos solo los datos necesarios: id, estado 'sended', y la fecha 'enviado'
        await conn.execute(
            `INSERT INTO consentimientos
            (id, estado, enviado)
            VALUES (?, ?, ?);`,
            [
                idConsentimiento,       // ID del consentimiento
                'sended',               // Estado 'sended'
                new Date()              // Fecha actual para el campo 'enviado'
            ]
        );

        // Si todo sale bien, confirmamos los cambios en la base de datos
        await conn.commit();
        return true;
    } catch (e) {
        // Si hay un error, deshacemos los cambios realizados
        await conn.rollback();
        throw CustomError.InternalServerError(`Error al crear el consentimiento: ${e}`);
    }
};
