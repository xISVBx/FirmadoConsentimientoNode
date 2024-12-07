import { ResponseGeneric } from "../common/models/response.js";
import { GetReportes, GetSeguros, GetTitulares, GetUsuarios } from "../infraestructure/infraestructure/airtable.js";

export default class AirTableService {

    async GetReportes(estado:string|null, aseguradora:string|null, agente:string|null): Promise<ResponseGeneric<any>> {
        try {

            var response = await GetReportes(estado, aseguradora, agente)

        } catch (err) {
            return ResponseGeneric.Error(`${err}`)
        }
        return ResponseGeneric.Success(response, 'Prueba completada!!!');
    }

    async GetUsuarios(): Promise<ResponseGeneric<any>> {
        try {

            var response = await GetUsuarios()

        } catch (err) {
            return ResponseGeneric.Error(`${err}`)
        }
        return ResponseGeneric.Success(response, 'Prueba completada!!!');
    }

    async GetTitulares(): Promise<ResponseGeneric<any>> {
        try {

            var response = await GetTitulares()

        } catch (err) {
            return ResponseGeneric.Error(`${err}`)
        }
        return ResponseGeneric.Success(response, 'Prueba completada!!!');
    }

    async GetSeguros(): Promise<ResponseGeneric<any>> {
        try {

            var response = await GetSeguros()

        } catch (err) {
            return ResponseGeneric.Error(`${err}`)
        }
        return ResponseGeneric.Success(response, 'Prueba completada!!!');
    }

}
