"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActaDevolucion = void 0;
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../database/connection"));
/**
 * Modelo ActaDevolucion - Actas de devolución de equipos
 * Proceso independiente del acta de entrega
 */
class ActaDevolucion extends sequelize_1.Model {
}
exports.ActaDevolucion = ActaDevolucion;
ActaDevolucion.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    numeroActa: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        comment: 'Número único del acta de devolución'
    },
    nombreReceptor: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        comment: 'Nombre de quien recibe los equipos (sistemas)'
    },
    cedulaReceptor: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: true
    },
    cargoReceptor: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    telefonoReceptor: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: true
    },
    correoReceptor: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        comment: 'Correo para enviar solicitud de firma'
    },
    nombreEntrega: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        comment: 'Nombre de quien devuelve los equipos'
    },
    cedulaEntrega: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: true
    },
    cargoEntrega: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    correoEntrega: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    firmaEntrega: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
        comment: 'Firma digital de quien devuelve (base64)'
    },
    firmaReceptor: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
        comment: 'Firma digital de quien recibe (base64)'
    },
    fechaDevolucion: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW
    },
    estado: {
        type: sequelize_1.DataTypes.ENUM('pendiente_firma', 'completada', 'rechazada'),
        defaultValue: 'pendiente_firma'
    },
    observaciones: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true
    },
    Uid: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        comment: 'Usuario que creó el acta'
    }
}, {
    sequelize: connection_1.default,
    tableName: 'actas_devolucion',
    timestamps: true,
});
exports.default = ActaDevolucion;
