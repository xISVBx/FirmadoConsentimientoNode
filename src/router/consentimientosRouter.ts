import { Router } from "express";
import ConsentimientosService from "../Services/ConsentimientosService";

class ProductoRouter {

    router: Router;
    private controller: ConsentimientosService;

    constructor() {
        this.controller = new ConsentimientosService();
        this.router = Router();
        this.config();
    }

    private config() {
        this.router.route('/consentimiento/pdf').post(this.controller.GenerarConsentimiento);
    }
}

export default new ProductoRouter();