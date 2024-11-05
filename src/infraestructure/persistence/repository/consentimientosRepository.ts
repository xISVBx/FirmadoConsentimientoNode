import { IStatement } from "../../../domain/entities/IStatement";
import { getConnection } from "../context/database";
import { CustomError } from "../../../common/errors/CustomError";
import { StatementSend } from "common/utils/token";

export const GuardarConsentimiento = async (base64Consentimiento: Uint8Array, nombreTitular: string, telefonoTitular: string,
    correoTitular: string, fechaNacimiento: string, idConsentimiento: string,
    pathConsentimiento: string): Promise<boolean> => {
    var conn = await getConnection();
    await conn.beginTransaction();
    try {

        const bufferConsentimiento = Buffer.from(base64Consentimiento);

        const resultConsentimiento = await conn.execute(
            `INSERT INTO consentimientos
            (id, path_consentimiento, consentimiento, created)
            VALUES (?, ?, ?, ?);`,
            [idConsentimiento, pathConsentimiento, bufferConsentimiento, new Date()]
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

export const GuardarStatement = async (base64Consentimiento: Uint8Array, path: string, statement: IStatement, agente: StatementSend): Promise<boolean> => {
    var conn = await getConnection();
    await conn.beginTransaction();
    try {

        const bufferConsentimiento = Buffer.from(base64Consentimiento);

        const resultConsentimiento = await conn.execute(
            `INSERT INTO consentimientos
            (id, path_consentimiento, consentimiento, created)
            VALUES (?, ?, ?, ?);`,
            [statement.idConsentimiento, path, bufferConsentimiento, new Date()]
        );

        const resultDatos = await conn.execute(
            `INSERT INTO datos_afirmaciones
            (id_consentimiento, codigoPostal, ingresoAnual, compania, plan, nombreConsumidor)
            VALUES (?, ?, ?, ?, ?, ?);`,
            [statement.idConsentimiento, agente.codigoPostal, agente.ingresoAnual, agente.compania, agente.plan, statement.nombreConsumidor]
        );

        await conn.commit();
        return true;
    } catch (e) {
        await conn.rollback();
        throw CustomError.InternalServerError(`${e}`)
    }
}
