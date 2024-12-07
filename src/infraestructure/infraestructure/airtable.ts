const Airtable = require('airtable')

const API_KEY = 'patGuLU79HDlj9kEj.d2a7ded3b0c432a29082f6190d5e87904090d07771cb79a8a30df45f9567a1f5';
const BASE_ID = 'app4F1V8lFD3ud9Aw';

const base = new Airtable({ apiKey: API_KEY }).base(BASE_ID);

export const GetReportes = async (estado: string | null, aseguradora: string | null, agente: string | null): Promise<any> => {
  try {
    let filterFormula = '';

    if (estado) {
      filterFormula += `{Estado} = "${estado}"`;
    }

    if (aseguradora) {
      if (filterFormula) filterFormula += ' AND ';
      filterFormula += `{Member ID} = "${aseguradora}"`;
    }

    if (agente) {
      if (filterFormula) filterFormula += ' AND ';
      filterFormula += `{Producer_Name} = "${agente}"`;
    }

    if (!filterFormula) {
      filterFormula = '1';
    }

    const records = await base('Reportes').select({
      filterByFormula: filterFormula,
      sort: [],
    }).all();

    const fields = records.map((record: any) => record.fields);

    return fields;

  } catch (err) {
    console.error('Error al obtener los registros:', err);
  }
};

/**
 * @openapi
 * /api/airtable/usuarios:
 *   get:
 *     summary: Obtiene la lista de usuarios registrados en Airtable.
 *     description: Este endpoint recupera los registros de la tabla "Lista de Usuarios Registrados" en Airtable.
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   Nombre Completo:
 *                     type: string
 *                     description: Nombre completo del usuario registrado.
 *       500:
 *         description: Error interno del servidor.
 */
export const GetUsuarios = async (): Promise<string[]> => {
  try {
    const records = await base('Lista de Usuarios Registrados')
      .select({
        fields: ['Nombre Completo'],
      })
      .all();

    // Mapeamos para extraer solo los nombres completos
    const nombres = records.map((record:any) => record.fields['Nombre Completo']);
    return nombres;

  } catch (err) {
    console.error('Error al obtener los registros:', err);
    throw err; // Opcional: lanzar el error para manejarlo en el nivel superior
  }
};


export const GetTitulares = async (): Promise<string[]> => {
  try {
    const records = await base('Titulares')
      .select({
        fields: ['Nombre y Apellido'],
      }).all();
    // Mapeamos para extraer solo los nombres completos
    const nombres = records.map((record:any) => record.fields['Nombre y Apellido']);
    return nombres;

  } catch (err) {
    console.error('Error al obtener los registros:', err);
    throw err; // Opcional: lanzar el error para manejarlo en el nivel superior
  }
};

export const GetSeguros = async (): Promise<string[]> => {
  try {
    const records = await base('Seguros')
      .select({
        fields: ['Nombre'],
      })
      .all();

    // Mapeamos para extraer solo los nombres completos
    const nombres = records.map((record:any) => record.fields['Nombre']);
    return nombres;

  } catch (err) {
    console.error('Error al obtener los registros:', err);
    throw err; // Opcional: lanzar el error para manejarlo en el nivel superior
  }
};
