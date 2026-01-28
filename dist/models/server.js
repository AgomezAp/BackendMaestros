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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const path_1 = __importDefault(require("path"));
const connection_1 = __importDefault(require("../database/connection"));
const maestros_1 = __importDefault(require("../routes/maestros"));
const user_1 = __importDefault(require("../routes/user"));
const analista_1 = __importDefault(require("../routes/analista"));
const dispositivo_1 = __importDefault(require("../routes/dispositivo"));
const actaEntrega_1 = __importDefault(require("../routes/actaEntrega"));
const firmaExterna_1 = __importDefault(require("../routes/firmaExterna"));
const actaDevolucion_1 = __importDefault(require("../routes/actaDevolucion"));
const maestroBorrado_1 = require("./maestroBorrado");
const maestros_2 = require("./maestros");
const movimientoMaestro_1 = require("./movimientoMaestro");
const user_2 = require("./user");
const analista_2 = require("./analista");
const dispositivo_2 = require("./dispositivo");
const actaEntrega_2 = require("./actaEntrega");
const detalleActa_1 = require("./detalleActa");
const movimientoDispositivo_1 = require("./movimientoDispositivo");
const tokenFirma_1 = require("./tokenFirma");
const actaDevolucion_2 = require("./actaDevolucion");
const detalleDevolucion_1 = require("./detalleDevolucion");
const tokenDevolucion_1 = require("./tokenDevolucion");
dotenv_1.default.config();
class Server {
    constructor() {
        this.app = (0, express_1.default)();
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
        this.app.use(express_1.default.json());
        // Configurar helmet para permitir imágenes
        this.app.use((0, helmet_1.default)({
            crossOriginResourcePolicy: { policy: "cross-origin" },
            crossOriginEmbedderPolicy: false,
        }));
        this.app.use((0, cors_1.default)({
            origin: "*", // Permite todas las solicitudes de origen cruzado
            methods: ["GET", "POST", "PUT", "DELETE", "PATCH"], // Métodos permitidos
            allowedHeaders: ["Content-Type", "Authorization"],
        }));
        // Servir archivos estáticos de uploads
        this.app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../../uploads')));
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
        this.app.use(user_1.default);
        this.app.use(maestros_1.default);
        this.app.use(analista_1.default);
        this.app.use('/api/dispositivos', dispositivo_1.default);
        this.app.use('/api/actas', actaEntrega_1.default);
        this.app.use('/api/firma', firmaExterna_1.default);
        this.app.use('/api/actas-devolucion', actaDevolucion_1.default);
    }
    DbConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            // Conexión a la base de datos
            try {
                /* {force: true}{alter: true} */
                yield connection_1.default.authenticate();
                // Migración: Cambiar 'prestado' a 'entregado' en el ENUM de estado
                yield this.migrateEstadoEnum();
                yield user_2.User.sync();
                yield analista_2.Analista.sync();
                yield maestros_2.Maestro.sync();
                yield movimientoMaestro_1.MovimientoMaestro.sync();
                yield maestroBorrado_1.maestroBorrado.sync();
                // Nuevos modelos de inventario
                yield dispositivo_2.Dispositivo.sync();
                yield actaEntrega_2.ActaEntrega.sync();
                yield detalleActa_1.DetalleActa.sync();
                yield movimientoDispositivo_1.MovimientoDispositivo.sync();
                yield tokenFirma_1.TokenFirma.sync();
                // Modelos de devolución
                yield actaDevolucion_2.ActaDevolucion.sync();
                yield detalleDevolucion_1.DetalleDevolucion.sync();
                yield tokenDevolucion_1.TokenDevolucion.sync();
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
                const [results] = yield connection_1.default.query(`
        SELECT enumlabel 
        FROM pg_enum 
        WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'enum_dispositivos_estado')
      `);
                const labels = results.map(r => r.enumlabel);
                if (labels.includes('prestado') && !labels.includes('entregado')) {
                    console.log('Migrando estado: prestado -> entregado...');
                    // Actualizar los registros que tienen 'prestado'
                    yield connection_1.default.query(`
          UPDATE dispositivos SET estado = 'disponible' WHERE estado = 'prestado';
        `);
                    // Renombrar el valor del ENUM
                    yield connection_1.default.query(`
          ALTER TYPE "enum_dispositivos_estado" RENAME VALUE 'prestado' TO 'entregado';
        `);
                    console.log('Migración de estado completada');
                }
                // Agregar 'reservado' si no existe
                if (!labels.includes('reservado')) {
                    console.log('Agregando estado: reservado...');
                    yield connection_1.default.query(`
          ALTER TYPE "enum_dispositivos_estado" ADD VALUE IF NOT EXISTS 'reservado';
        `);
                    console.log('Estado reservado agregado');
                }
                // Verificar y agregar nuevos estados de acta si es necesario
                const [actaResults] = yield connection_1.default.query(`
        SELECT enumlabel 
        FROM pg_enum 
        WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'enum_actas_entrega_estado')
      `);
                const actaLabels = actaResults.map(r => r.enumlabel);
                if (!actaLabels.includes('pendiente_firma')) {
                    console.log('Agregando estados de acta: pendiente_firma, rechazada...');
                    yield connection_1.default.query(`
          ALTER TYPE "enum_actas_entrega_estado" ADD VALUE IF NOT EXISTS 'pendiente_firma';
        `);
                    yield connection_1.default.query(`
          ALTER TYPE "enum_actas_entrega_estado" ADD VALUE IF NOT EXISTS 'rechazada';
        `);
                    console.log('Estados de acta agregados');
                }
                // Verificar y agregar nuevos tipos de movimiento
                const [movResults] = yield connection_1.default.query(`
        SELECT enumlabel 
        FROM pg_enum 
        WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'enum_movimientos_dispositivo_tipoMovimiento')
      `);
                const movLabels = movResults.map(r => r.enumlabel);
                if (!movLabels.includes('reserva')) {
                    console.log('Agregando tipos de movimiento: reserva, firma_entrega...');
                    yield connection_1.default.query(`
          ALTER TYPE "enum_movimientos_dispositivo_tipoMovimiento" ADD VALUE IF NOT EXISTS 'reserva';
        `);
                    yield connection_1.default.query(`
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
exports.default = Server;
