import { getConnection } from "../database/database";

export const GuardarConsentimiento = async (base64Consentimiento: Uint8Array, nombreTitular: string, telefonoTitular: string,
    correoTitular: string, fechaNacimiento: string, idConsentimiento: string,
    pathConsentimiento: string): Promise<boolean> => {
    var conn = await getConnection();
    await conn.beginTransaction();
    try {

        // Convertir Uint8Array a Buffer
        const bufferConsentimiento = Buffer.from(base64Consentimiento);

        // Usar new Date() para el campo TIMESTAMP
        const resultConsentimiento = await conn.execute(
            `INSERT INTO consentimientos
            (id, path_consentimiento, consentimiento, created)
            VALUES (?, ?, ?, ?);`,
            [idConsentimiento, pathConsentimiento, bufferConsentimiento, new Date()]
        );

        // Convertir fechaNacimiento a un objeto Date y manejar valores inválidos
        let fechaNacimientoDate;
        if (fechaNacimiento) {
            fechaNacimientoDate = new Date(fechaNacimiento);
            if (isNaN(fechaNacimientoDate.getTime())) {
                fechaNacimientoDate = null; // O el valor que prefieras para fechas inválidas
            }
        } else {
            fechaNacimientoDate = null; // O el valor que prefieras si fechaNacimiento es nulo o vacío
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
        console.log(e);
        await conn.rollback();
        return false;
    }
}

export const GuardarStatement = async (base64Consentimiento: Uint8Array, nombreTitular: string, telefonoTitular: string,
    correoTitular: string, fechaNacimiento: string, idConsentimiento: string,
    pathConsentimiento: string): Promise<boolean> => {
    var conn = await getConnection();
    await conn.beginTransaction();
    try {

        // Convertir Uint8Array a Buffer
        const bufferConsentimiento = Buffer.from(base64Consentimiento);

        // Usar new Date() para el campo TIMESTAMP
        const resultConsentimiento = await conn.execute(
            `INSERT INTO consentimientos
            (id, path_consentimiento, consentimiento, created)
            VALUES (?, ?, ?, ?);`,
            [idConsentimiento, pathConsentimiento, bufferConsentimiento, new Date()]
        );

        // Convertir fechaNacimiento a un objeto Date y manejar valores inválidos
        let fechaNacimientoDate;
        if (fechaNacimiento) {
            fechaNacimientoDate = new Date(fechaNacimiento);
            if (isNaN(fechaNacimientoDate.getTime())) {
                fechaNacimientoDate = null; // O el valor que prefieras para fechas inválidas
            }
        } else {
            fechaNacimientoDate = null; // O el valor que prefieras si fechaNacimiento es nulo o vacío
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
        console.log(e);
        await conn.rollback();
        return false;
    }
}
