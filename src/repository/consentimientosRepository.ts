import { getConnection } from "../database/database";

class ConsentimientosRepository {
    async GuardarConsentimiento(base64Consentimiento: string, nombreTitular: string, telefonoTitular: string,
        correoTitular: string, fechaNacimiento: string, idConsentimiento: string,
        pathConsentimiento: string): Promise<boolean> {
        var conn = await getConnection()
        await conn.beginTransaction();
        try {

            const resultConsentimiento = await conn.execute(
                `INSERT INTO consentimientos
            (id, path_consentimiento, consentimiento, created)
            VALUES (?, ?, ?);`,
                [idConsentimiento, pathConsentimiento, base64Consentimiento, Date.now()]
            )
            const resultDatos = await conn.execute(
                `INSERT INTO datos_consentimientos
            (id_consentimiento, nombre, telefono, correo, fecha_nacimiento)
            VALUES (?, ?, ?, ?, ?);`,
                [idConsentimiento, nombreTitular, telefonoTitular, correoTitular, fechaNacimiento]
            )
            await conn.commit();
            return true;
        } catch (e) {
            await conn.rollback();
            return false;
        }

    }
}

export default new ConsentimientosRepository()