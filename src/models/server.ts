import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

import sequelize from '../database/connection';
import RMaestros from '../routes/maestros';
import RUser from '../routes/user';
import { maestroBorrado } from './maestroBorrado';
import { Maestro } from './maestros';
import { MovimientoMaestro } from './movimientoMaestro';
import { User } from './user';

class Server {
  private app: Application;
  private port?: string;

  constructor() {
    this.app = express();
    this.port = process.env.PORT;
    this.middlewares();
    this.listen();
    this.DbConnection();
    this.routes();
    
  }

  listen() {
    this.app.listen(this.port, () => {
      console.log(`Server corriendo en el puerto ${this.port}`);
    });
  }
  middlewares() {
    this.app.use(express.json())
    this.app.use(helmet());
    this.app.use(cors({
        origin: '*', // Permite todas las solicitudes de origen cruzado
        methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH'], // Métodos permitidos
        allowedHeaders: ['Content-Type', 'Authorization']
    }));
    this.app.use((req, res, next) => {
        res.setTimeout(60000, () => { // 2 minutos
            console.log('Request has timed out.');
            res.status(408).send('Request has timed out.');
        });
        next();
    });

    this.app.use(cookieParser());

    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: 100, // Limita cada IP a 100 peticiones por ventana de 15 minutos
      message: 'Demasiadas peticiones desde esta IP, por favor intenta de nuevo después de 15 minutos'
    });
    this.app.use(limiter);

    // Protección contra CSRF

    this.app.use((req, res, next) => {
      res.setTimeout(60000, () => { // 1 minuto
        console.log('Request has timed out.');
        res.status(408).send('Request has timed out.');
      });
      next();
    });

  }
  routes() {
    this.app.use(RUser);
    this.app.use(RMaestros);
  }
  
  async DbConnection() {
    // Conexión a la base de datos
    
    try {
        /* {force: true}{alter: true} */
      await sequelize.authenticate();
      await User.sync({alter: true});
      await Maestro.sync({alter: true});
      await MovimientoMaestro.sync({alter: true});
      await maestroBorrado.sync({alter: true});
      console.log("Conexión a la base de datos exitosa");
    } catch (error) {
      console.log("Error al conectar a la base de datos", error);
    }
  }
}

export default Server;
