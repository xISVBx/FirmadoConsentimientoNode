import express, { Request, Response, NextFunction } from "express";
import morgan from "morgan";
import cors from "cors";
import AirTableRouter from "./router/routes/airTableRouter.js";
import ConsentimientoRouter from "./router/routes/consentimientosRouter.js";
import ErrorRouter from "./router/routes/errorRouter.js";
import dotenv from "dotenv";
import { swaggerDocs, swaggerUi } from "./common/utils/swagger.js";
import { v4 as uuidv4 } from "uuid";
import { getDb } from "./infraestructure/persistence/context/sqlite.js";
import { ResponseGeneric } from "./common/models/response.js";

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      requestStartTime?: number;
    }
  }
}

// Creamos la función "configurable" que genera el middleware
function logRequestToDatabase(
  options: { blacklist?: string[]; ignoreMethods?: string[] } = {}
) {
  return async function (req: Request, res: Response, next: NextFunction) {
    // Si se pasa la opción blacklist, verificar si la URL está en la lista negra
    const urlIsBlacklisted = options.blacklist?.includes(req.originalUrl);
    const methodIsBlacklisted = options.ignoreMethods?.includes(req.method);

    // Si la URL o el método están en la lista negra, omitir el registro
    if (urlIsBlacklisted || methodIsBlacklisted) {
      return next(); // No registrar, solo pasa al siguiente middleware
    }

    // Si no está en la lista negra, registrar la solicitud en la base de datos
    const requestId = uuidv4();
    const startTime = Date.now();

    req.requestId = requestId;
    req.requestStartTime = startTime;

    // Registrar en la base de datos
    const db = await getDb();
    await db.run(
      "INSERT INTO requests (id, method, url, start_time, request_params) VALUES (?, ?, ?, ?, ?)",
      [
        requestId,
        req.method,
        req.originalUrl,
        new Date(startTime).toISOString(),
        JSON.stringify(req.body),
      ]
    );

    // Cuando la respuesta finalice, actualizamos la duración y el estado de la respuesta
    res.on("finish", async () => {
      const duration = Date.now() - startTime;
      const responseStatus = res.statusCode;

      await db.run(
        "UPDATE requests SET duration = ?, response_status = ? WHERE id = ?",
        [duration, responseStatus, requestId]
      );
    });

    next();
  };
}

class Server {
  private app: express.Express;

  constructor() {
    this.app = express();
    this.config().then(() => {
      this.routes();
      this.start();
    });
  }

  // Lista negra de rutas o métodos
  private blacklist: string[] = ["/api/error"];

  private async setupDatabase() {
    const db = await getDb();
    await db.exec(`CREATE TABLE IF NOT EXISTS requests (
            id TEXT PRIMARY KEY,
            method TEXT,
            url TEXT,
            start_time TEXT,
            duration INTEGER,
            response_status INTEGER,
            request_params TEXT
        )`);
    await db.exec(`CREATE TABLE IF NOT EXISTS errors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            request_id TEXT,
            message TEXT,
            stack TEXT
        )`);
    await db.exec(
      `CREATE INDEX IF NOT EXISTS idx_start_time ON requests(start_time)`
    );
  }

  private async config() {
    dotenv.config();
    await this.setupDatabase();

    //'https://www.jecopainsurance.com'
    
        this.app.use(cors({
            origin: ['https://www.jecopainsurance.com', 'https://app.jecopainsurance.com'],
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
            credentials: true,
        }));
    //this.app.use(cors()); // Esto maneja las preflight requests CORS

    this.app.use(express.json());
    this.app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
    this.app.get("/docs.json", (req, res) => {
      res.setHeader("Content-Type", "application/json");
      res.send(swaggerDocs);
    });

    this.app.use(
      logRequestToDatabase({
        blacklist: ["/api/error"],
      })
    );

    this.app.use(morgan("dev"));
  }

  private routes() {
    this.app.use("/api", ConsentimientoRouter.router);
    this.app.use("/api", ErrorRouter.router);
    this.app.use("/api", AirTableRouter.router);
    this.app.get("/api", (req, res) => {
      res.status(200).send({ message: "API is running" });
    });
  }

  private errorHandler = async (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const errorDetails = {
      request_id: req.requestId,
      message: err.message,
      stack: err.stack,
    };

    await getDb().then((db) => {
      db.run(
        "INSERT INTO errors (request_id, message, stack) VALUES (?, ?, ?)",
        [req.requestId, errorDetails.message, errorDetails.stack]
      );
    });

    res
      .status(err.status || 500)
      .send(ResponseGeneric.Error(err.message || "Algo salió mal!"));
  };

  private start() {
    this.app.use(this.errorHandler);
    const port = process.env.PORT || 3000;

    this.app.listen(parseInt(port as string), () => {
      console.log(`Listening on http://:${port}/`);
    });
  }
}

new Server();
