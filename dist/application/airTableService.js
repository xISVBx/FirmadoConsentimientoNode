"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const response_js_1 = require("../common/models/response.js");
const airtable_js_1 = require("../infraestructure/infraestructure/airtable.js");
class AirTableService {
    Prueba(estado, aseguradora, agente) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                var response = yield (0, airtable_js_1.getFilteredData)(estado, aseguradora, agente);
            }
            catch (err) {
                return response_js_1.ResponseGeneric.Error(`${err}`);
            }
            return response_js_1.ResponseGeneric.Success(response, 'Prueba completada!!!');
        });
    }
}
exports.default = AirTableService;
