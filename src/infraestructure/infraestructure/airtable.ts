const Airtable = require("airtable");

const API_KEY =
  "patGuLU79HDlj9kEj.d2a7ded3b0c432a29082f6190d5e87904090d07771cb79a8a30df45f9567a1f5";
const BASE_ID = "app4F1V8lFD3ud9Aw";

const base = new Airtable({ apiKey: API_KEY }).base(BASE_ID);

export const GetReportes = async (
  estado: string | null,
  producerName: string | null,
  suscriberName: string | null,
  compania: string | null
): Promise<any> => {
  try {
    let filterFormula = "";


    // Vamos a agregar los filtros dentro de un OR para que cualquiera sea válido
    let conditions = [];

    if (estado) {
      // Filtro para el campo {Estado}
      conditions.push(`ARRAYJOIN({Estado}, "") = "${estado}"`);
    }

    if (suscriberName) {
      // Filtro para el campo {Suscriber_Name}
      conditions.push(`ARRAYJOIN({Suscriber_Name}, "") = "${suscriberName}"`);
    }

    if (producerName) {
      // Filtro para el campo {Member ID}
      conditions.push(`{Producer_Name} = "${producerName}"`);
    }
    if(compania){
      conditions.push(`{Compañía} = "${compania}"`)
    }

    // Si no se ha añadido ningún filtro, devolvemos todos los registros
    if (conditions.length === 0) {
      filterFormula = "1"; // Esto significa "sin filtro"
    } else {
      // Unimos todas las condiciones con 'AND'
      filterFormula = `AND(${conditions.join(", ")})`;
    }

    console.log(filterFormula)

    const records = await base("Reportes")
      .select({
        filterByFormula: filterFormula,
        sort: [],
      })
      .all();

    const fields = records.map((record: any) => record.fields);

    return fields;
  } catch (err) {
    console.error("Error al obtener los registros:", err);
  }
};

export const GetUsuarios = async (): Promise<string[]> => {
  try {
    const records = await base("Lista de Usuarios Registrados")
      .select({
        fields: ["Nombre Completo"],
      })
      .all();

    // Mapeamos para extraer solo los nombres completos
    const nombres = records.map(
      (record: any) => record.fields["Nombre Completo"]
    );

    nombres.sort((a: string, b: string) => a.localeCompare(b));

    return nombres;
  } catch (err) {
    console.error("Error al obtener los registros:", err);
    throw err; // Opcional: lanzar el error para manejarlo en el nivel superior
  }
};

export const GetTitulares = async (): Promise<string[]> => {
  try {
    const records = await base("Titulares")
      .select({
        fields: ["Nombre y Apellido"],
      })
      .all();
    // Mapeamos para extraer solo los nombres completos
    const nombres = records.map(
      (record: any) => record.fields["Nombre y Apellido"]
    );

    nombres.sort((a: string, b: string) => a.localeCompare(b));

    return nombres;
  } catch (err) {
    console.error("Error al obtener los registros:", err);
    throw err; // Opcional: lanzar el error para manejarlo en el nivel superior
  }
};

export const GetSeguros = async (): Promise<string[]> => {
  try {
    const records = await base("Seguros")
      .select({
        fields: ["Nombre"],
      })
      .all();

    // Mapeamos para extraer solo los nombres completos
    const nombres = records.map((record: any) => record.fields["Nombre"]);

    nombres.sort((a: string, b: string) => a.localeCompare(b));

    return nombres;
  } catch (err) {
    console.error("Error al obtener los registros:", err);
    throw err; // Opcional: lanzar el error para manejarlo en el nivel superior
  }
};
