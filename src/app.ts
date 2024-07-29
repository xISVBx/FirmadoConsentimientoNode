import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import ConsentimientoRouter from './router/consentimientosRouter.js'
import dotenv from 'dotenv';


class Server{

    private app: express.Express
    
    constructor(){
        this.app = express();
        this.config();
        this.routes();
        this.start();
    }

    private config(){
        dotenv.config();
        this.app.use(cors({
            origin: '*',
            credentials: true
        }));
        this.app.use(express.json());
        this.app.use(morgan('dev'));
    }
    
    private routes(){
        this.app.use('/api',ConsentimientoRouter.router)
        this.app.get('/api', (req, res) => {
            res.status(200).send({ message: 'API is running' });
        });
    }

    private start(){
        // Usar el puerto proporcionado por el entorno (por ejemplo, por cPanel)
        const port = process.env.PORT || 3000; // Usa el puerto de entorno o 80 por defecto
    
        this.app.listen(parseInt(port as string), () => {
            console.log(`Listening on http://:${port}/`);
        });
    }
    
}

new Server();