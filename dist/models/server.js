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
const express_1 = __importDefault(require("express"));
const connection_1 = __importDefault(require("../database/connection"));
const maestros_1 = __importDefault(require("../routes/maestros"));
const user_1 = __importDefault(require("../routes/user"));
const maestroBorrado_1 = require("./maestroBorrado");
const maestros_2 = require("./maestros");
const movimientoMaestro_1 = require("./movimientoMaestro");
const user_2 = require("./user");
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
        this.app.use((0, cors_1.default)({
            origin: '*', // Permite todas las solicitudes de origen cruzado
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // Métodos permitidos
            allowedHeaders: ['Content-Type', 'Authorization']
        }));
        this.app.use((req, res, next) => {
            res.setTimeout(60000, () => {
                console.log('Request has timed out.');
                res.status(408).send('Request has timed out.');
            });
            next();
        });
    }
    routes() {
        this.app.use(user_1.default);
        this.app.use(maestros_1.default);
    }
    DbConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            // Conexión a la base de datos
            try {
                /* {force: true}{alter: true} */
                yield connection_1.default.authenticate();
                yield user_2.User.sync({ alter: true });
                yield maestros_2.Maestro.sync({ alter: true });
                yield movimientoMaestro_1.MovimientoMaestro.sync({ alter: true });
                yield maestroBorrado_1.maestroBorrado.sync({ alter: true });
                console.log("Conexión a la base de datos exitosa");
            }
            catch (error) {
                console.log("Error al conectar a la base de datos", error);
            }
        });
    }
}
exports.default = Server;
