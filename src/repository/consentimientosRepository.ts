import { Connection } from "mysql2/typings/mysql/lib/Connection";
import { ResponseGeneric } from "../common/response";
import { generatePdf } from "../utils/CrearConsentimiento";
import { v4 as uuidv4 } from 'uuid';
import { getConnection } from "../database/database";


export default class ConsentimientosRepository {
    async GuardarConsentimiento(base64Consentimiento: string, nombreTitular: string, telefonoTitular: string,
        correoTitular: string, fechaNacimiento: string, nombreAgente: string, numeroAgente: string,
        telefonoAgente: string, correoAgente: string, idConsentimiento: string, pathConsentimiento: string): Promise<boolean> {
        var conn = await getConnection()
        await conn.beginTransaction();
        try {

            const [resultConsentimiento] = await conn.execute(
                `INSERT INTO consentimientos
            (id, path_consentimiento, consentimiento)
            VALUES (?, ?, ?);`,
                [idConsentimiento, pathConsentimiento, base64Consentimiento]
            )
            const [resultDatos] = await conn.execute(
                `INSERT INTO datos_consentimientos
            (id, id_consentimiento, nombre, correo_electronico, fecha_registro)
            VALUES (?, ?, ?, ?, ?);`,
                [idConsentimiento, pathConsentimiento, base64Consentimiento]
            )
            await conn.commit();
            return true;
        } catch (e) {
            await conn.rollback();
            return false;
        }

    }
}
