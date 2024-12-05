import { ResponseGeneric } from "../common/models/response.js";
import { getFilteredData } from "../infraestructure/infraestructure/airtable.js";

export default class AirTableService {

    async Prueba(estado:string|null, aseguradora:string|null, agente:string|null): Promise<ResponseGeneric<any>> {
        try {

            var response = await getFilteredData(estado, aseguradora, agente)

        } catch (err) {
            return ResponseGeneric.Error(`${err}`)
        }
        return ResponseGeneric.Success(response, 'Prueba completada!!!');
    }

}
