"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DetalleActa = void 0;
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../database/connection"));
const actaEntrega_1 = require("./actaEntrega");
const dispositivo_1 = require("./dispositivo");
/**
 * Modelo DetalleActa - Relación entre Actas y Dispositivos
 * Permite múltiples dispositivos por acta con estado individual
 */
class DetalleActa extends sequelize_1.Model {
}
exports.DetalleActa = DetalleActa;
DetalleActa.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    actaId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'actas_entrega',
            key: 'id'
        },
        comment: 'ID del acta de entrega'
    },
    dispositivoId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'dispositivos',
            key: 'id'
        },
        comment: 'ID del dispositivo entregado'
    },
    estadoEntrega: {
        type: sequelize_1.DataTypes.STRING,
        defaultValue: 'bueno',
        comment: 'Estado del dispositivo al momento de entregarlo'
    },
    condicionEntrega: {
        type: sequelize_1.DataTypes.ENUM('nuevo', 'bueno', 'regular', 'malo'),
        defaultValue: 'bueno',
        comment: 'Condición física al entregar'
    },
    fotosEntrega: {
        type: sequelize_1.DataTypes.TEXT('long'),
        allowNull: true,
        comment: 'JSON array con URLs de fotos al entregar'
    },
    observacionesEntrega: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    devuelto: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Indica si el dispositivo fue devuelto'
    },
    fechaDevolucion: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
        comment: 'Fecha de devolución del dispositivo'
    },
    estadoDevolucion: {
        type: sequelize_1.DataTypes.ENUM('disponible', 'dañado', 'perdido'),
        allowNull: true,
        comment: 'Estado al devolver: disponible (vuelve al stock), dañado, perdido'
    },
    condicionDevolucion: {
        type: sequelize_1.DataTypes.ENUM('nuevo', 'bueno', 'regular', 'malo'),
        allowNull: true,
        comment: 'Condición física al devolver'
    },
    fotosDevolucion: {
        type: sequelize_1.DataTypes.TEXT('long'),
        allowNull: true,
        comment: 'JSON array con URLs de fotos al devolver'
    },
    observacionesDevolucion: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    }
}, {
    sequelize: connection_1.default,
    modelName: 'DetalleActa',
    tableName: 'detalles_acta',
    timestamps: true,
});
// Relaciones
actaEntrega_1.ActaEntrega.hasMany(DetalleActa, { foreignKey: 'actaId', as: 'detalles' });
DetalleActa.belongsTo(actaEntrega_1.ActaEntrega, { foreignKey: 'actaId', as: 'acta' });
dispositivo_1.Dispositivo.hasMany(DetalleActa, { foreignKey: 'dispositivoId', as: 'entregas' });
DetalleActa.belongsTo(dispositivo_1.Dispositivo, { foreignKey: 'dispositivoId', as: 'dispositivo' });
