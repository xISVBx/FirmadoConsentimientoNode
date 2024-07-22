import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import ProductoRouter from './router/consentimientosRouter.js'

class Server{

    private app: express.Express
    
    constructor(){
        this.app = express();
        this.config();
        this.routes();
        this.start();
    }

    private config(){
        this.app.use(cors({
            origin: '*',
            credentials: true
        }));
        this.app.use(express.json());
        this.app.use(morgan('dev'));
    }
    
    private routes(){
        this.app.use('/api',ProductoRouter.router)
        this.app.get('/', (req, res) => {
            res.status(200).send({ message: 'API is running' });
        });
    }

    private start(){
        const port =  "80";
        const host = "localhost";
        if(host) {
            this.app.listen(parseInt(port), host, ()=>{
                console.log(`Listen on http://${host}:${port}/`);
            });
        } else {
            this.app.listen(parseInt(port), ()=>{
                console.log(`Listen on ${port}`);
            });
        }
    }
}

new Server();