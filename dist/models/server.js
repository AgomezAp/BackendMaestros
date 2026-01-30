var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import path from 'path';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { fileURLToPath } from 'url';
// Obtener __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import sequelize from '../database/connection.js';
import RMaestros from '../routes/maestros.js';
import RUser from '../routes/user.js';
import RAnalista from '../routes/analista.js';
import RDispositivo from '../routes/dispositivo.js';
import RActaEntrega from '../routes/actaEntrega.js';
import RFirmaExterna from '../routes/firmaExterna.js';
import RActaDevolucion from '../routes/actaDevolucion.js';
import { maestroBorrado } from './maestroBorrado.js';
import { Maestro } from './maestros.js';
import { MovimientoMaestro } from './movimientoMaestro.js';
import { User } from './user.js';
import { Analista } from './analista.js';
import { Dispositivo } from './dispositivo.js';
import { ActaEntrega } from './actaEntrega.js';
import { DetalleActa } from './detalleActa.js';
import { MovimientoDispositivo } from './movimientoDispositivo.js';
import { TokenFirma } from './tokenFirma.js';
import { ActaDevolucion } from './actaDevolucion.js';
import { DetalleDevolucion } from './detalleDevolucion.js';
import { TokenDevolucion } from './tokenDevolucion.js';
dotenv.config();
// Variable global para el socket
let io;
// Función para obtener la instancia de Socket.IO
export const getIO = () => io;
class Server {
    constructor() {
        this.app = express();
        this.port = process.env.PORT;
        // Crear servidor HTTP
        this.httpServer = http.createServer(this.app);
        // Configurar Socket.IO
        this.io = new SocketIOServer(this.httpServer, {
            cors: {
                origin: "*",
                methods: ["GET", "POST", "PUT", "DELETE", "PATCH"]
            }
        });
        // Asignar a la variable global
        io = this.io;
        this.middlewares();
        this.setupSocketIO();
        this.listen();
        this.DbConnection();
        this.routes();
    }
    setupSocketIO() {
        this.io.on('connection', (socket) => {
            console.log('🔌 Cliente conectado:', socket.id);
            // Unirse a salas específicas
            socket.on('join', (room) => {
                socket.join(room);
                console.log(`   Socket ${socket.id} se unió a: ${room}`);
            });
            // Salir de salas
            socket.on('leave', (room) => {
                socket.leave(room);
                console.log(`   Socket ${socket.id} salió de: ${room}`);
            });
            socket.on('disconnect', () => {
                console.log('🔌 Cliente desconectado:', socket.id);
            });
        });
    }
    listen() {
        this.httpServer.listen(this.port, () => {
            console.log(`Server corriendo en el puerto ${this.port}`);
            console.log(`WebSocket habilitado en el puerto ${this.port}`);
        });
    }
    middlewares() {
        this.app.use(express.json());
        // Configurar helmet para permitir imágenes
        this.app.use(helmet({
            crossOriginResourcePolicy: { policy: "cross-origin" },
            crossOriginEmbedderPolicy: false,
        }));
        this.app.use(cors({
            origin: "*", // Permite todas las solicitudes de origen cruzado
            methods: ["GET", "POST", "PUT", "DELETE", "PATCH"], // Métodos permitidos
            allowedHeaders: ["Content-Type", "Authorization"],
        }));
        // Servir archivos estáticos de uploads
        this.app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));
        this.app.use((req, res, next) => {
            res.setTimeout(60000, () => {
                // 2 minutos
                console.log("Request has timed out.");
                res.status(408).send("Request has timed out.");
            });
            next();
        });
        /*  this.app.use(cookieParser());
     
         const limiter = rateLimit({
           windowMs: 15 * 60 * 1000, // 15 minutos
           max: 100, // Limita cada IP a 100 peticiones por ventana de 15 minutos
           message:
             "Demasiadas peticiones desde esta IP, por favor intenta de nuevo después de 15 minutos",
         });
         this.app.use(limiter);
     
         // Protección contra CSRF
     
         this.app.use((req, res, next) => {
           res.setTimeout(60000, () => {
             // 1 minuto
             console.log("Request has timed out.");
             res.status(408).send("Request has timed out.");
           });
           next();
         }); */
    }
    routes() {
        this.app.use(RUser);
        this.app.use(RMaestros);
        this.app.use(RAnalista);
        this.app.use('/api/dispositivos', RDispositivo);
        this.app.use('/api/actas', RActaEntrega);
        this.app.use('/api/firma', RFirmaExterna);
        this.app.use('/api/actas-devolucion', RActaDevolucion);
    }
    DbConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            // Conexión a la base de datos
            try {
                /* {force: true}{alter: true} */
                yield sequelize.authenticate();
                // Migración: Cambiar 'prestado' a 'entregado' en el ENUM de estado
                yield this.migrateEstadoEnum();
                yield User.sync();
                yield Analista.sync();
                yield Maestro.sync();
                yield MovimientoMaestro.sync();
                yield maestroBorrado.sync();
                // Nuevos modelos de inventario
                yield Dispositivo.sync();
                yield ActaEntrega.sync();
                yield DetalleActa.sync();
                yield MovimientoDispositivo.sync();
                yield TokenFirma.sync();
                // Modelos de devolución
                yield ActaDevolucion.sync();
                yield DetalleDevolucion.sync();
                yield TokenDevolucion.sync();
                console.log("Conexión a la base de datos exitosa");
            }
            catch (error) {
                console.log("Error al conectar a la base de datos", error);
            }
        });
    }
    /**
     * Migración para cambiar el ENUM de estado de 'prestado' a 'entregado'
     * y agregar nuevos valores de ENUM
     */
    migrateEstadoEnum() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                // Verificar si existe el valor 'prestado' y no existe 'entregado'
                const [results] = yield sequelize.query(`
        SELECT enumlabel 
        FROM pg_enum 
        WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'enum_dispositivos_estado')
      `);
                const labels = results.map(r => r.enumlabel);
                if (labels.includes('prestado') && !labels.includes('entregado')) {
                    console.log('Migrando estado: prestado -> entregado...');
                    // Actualizar los registros que tienen 'prestado'
                    yield sequelize.query(`
          UPDATE dispositivos SET estado = 'disponible' WHERE estado = 'prestado';
        `);
                    // Renombrar el valor del ENUM
                    yield sequelize.query(`
          ALTER TYPE "enum_dispositivos_estado" RENAME VALUE 'prestado' TO 'entregado';
        `);
                    console.log('Migración de estado completada');
                }
                // Agregar 'reservado' si no existe
                if (!labels.includes('reservado')) {
                    console.log('Agregando estado: reservado...');
                    yield sequelize.query(`
          ALTER TYPE "enum_dispositivos_estado" ADD VALUE IF NOT EXISTS 'reservado';
        `);
                    console.log('Estado reservado agregado');
                }
                // Verificar y agregar nuevos estados de acta si es necesario
                const [actaResults] = yield sequelize.query(`
        SELECT enumlabel 
        FROM pg_enum 
        WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'enum_actas_entrega_estado')
      `);
                const actaLabels = actaResults.map(r => r.enumlabel);
                if (!actaLabels.includes('pendiente_firma')) {
                    console.log('Agregando estados de acta: pendiente_firma, rechazada...');
                    yield sequelize.query(`
          ALTER TYPE "enum_actas_entrega_estado" ADD VALUE IF NOT EXISTS 'pendiente_firma';
        `);
                    yield sequelize.query(`
          ALTER TYPE "enum_actas_entrega_estado" ADD VALUE IF NOT EXISTS 'rechazada';
        `);
                    console.log('Estados de acta agregados');
                }
                // Verificar y agregar nuevos tipos de movimiento
                const [movResults] = yield sequelize.query(`
        SELECT enumlabel 
        FROM pg_enum 
        WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'enum_movimientos_dispositivo_tipoMovimiento')
      `);
                const movLabels = movResults.map(r => r.enumlabel);
                if (!movLabels.includes('reserva')) {
                    console.log('Agregando tipos de movimiento: reserva, firma_entrega...');
                    yield sequelize.query(`
          ALTER TYPE "enum_movimientos_dispositivo_tipoMovimiento" ADD VALUE IF NOT EXISTS 'reserva';
        `);
                    yield sequelize.query(`
          ALTER TYPE "enum_movimientos_dispositivo_tipoMovimiento" ADD VALUE IF NOT EXISTS 'firma_entrega';
        `);
                    console.log('Tipos de movimiento agregados');
                }
            }
            catch (error) {
                // Si falla, probablemente el ENUM no existe aún (primera vez)
                if (!((_a = error.message) === null || _a === void 0 ? void 0 : _a.includes('does not exist'))) {
                    console.log('Error en migración de ENUM (puede ser primera ejecución):', error.message);
                }
            }
        });
    }
}
export default Server;
