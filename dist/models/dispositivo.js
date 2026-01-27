"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Dispositivo = void 0;
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../database/connection"));
const user_1 = require("./user");
/**
 * Modelo Dispositivo - Inventario principal de equipos
 * Estados: disponible, entregado, dañado, perdido, obsoleto
 */
class Dispositivo extends sequelize_1.Model {
}
exports.Dispositivo = Dispositivo;
Dispositivo.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nombre: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        comment: 'Nombre identificador del dispositivo'
    },
    categoria: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        comment: 'Tipo: celular, tablet, computador, cargador, accesorio, otro'
    },
    marca: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    modelo: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    serial: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        unique: true,
        comment: 'Número de serie único'
    },
    imei: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        comment: 'IMEI para celulares y tablets'
    },
    color: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    descripcion: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
        comment: 'Descripción detallada del dispositivo'
    },
    estado: {
        type: sequelize_1.DataTypes.ENUM('disponible', 'entregado', 'dañado', 'perdido', 'obsoleto'),
        defaultValue: 'disponible',
        comment: 'Estado actual del dispositivo en el inventario'
    },
    condicion: {
        type: sequelize_1.DataTypes.ENUM('nuevo', 'bueno', 'regular', 'malo'),
        defaultValue: 'bueno',
        comment: 'Condición física del dispositivo'
    },
    ubicacion: {
        type: sequelize_1.DataTypes.STRING,
        defaultValue: 'Almacén Principal',
        comment: 'Ubicación física del dispositivo'
    },
    fotos: {
        type: sequelize_1.DataTypes.TEXT('long'),
        allowNull: true,
        comment: 'JSON array con URLs de fotos del dispositivo'
    },
    fechaIngreso: {
        type: sequelize_1.DataTypes.DATEONLY,
        defaultValue: sequelize_1.DataTypes.NOW,
        comment: 'Fecha de ingreso al inventario'
    },
    observaciones: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    Uid: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        comment: 'Usuario que registró el dispositivo'
    }
}, {
    sequelize: connection_1.default,
    modelName: 'Dispositivo',
    tableName: 'dispositivos',
    timestamps: true,
});
// Relación con Usuario
user_1.User.hasMany(Dispositivo, { foreignKey: 'Uid', as: 'dispositivos' });
Dispositivo.belongsTo(user_1.User, { foreignKey: 'Uid', as: 'usuario' });
