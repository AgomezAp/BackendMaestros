"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DetalleDevolucion = void 0;
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../database/connection"));
const actaDevolucion_1 = require("./actaDevolucion");
const dispositivo_1 = require("./dispositivo");
/**
 * Modelo DetalleDevolucion - Detalle de dispositivos en acta de devolución
 */
class DetalleDevolucion extends sequelize_1.Model {
}
exports.DetalleDevolucion = DetalleDevolucion;
DetalleDevolucion.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    actaDevolucionId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: actaDevolucion_1.ActaDevolucion,
            key: 'id'
        }
    },
    dispositivoId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: dispositivo_1.Dispositivo,
            key: 'id'
        }
    },
    estadoDevolucion: {
        type: sequelize_1.DataTypes.ENUM('disponible', 'dañado', 'perdido'),
        defaultValue: 'disponible',
        comment: 'Estado en que se devuelve el dispositivo'
    },
    condicionDevolucion: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        comment: 'Condición física del dispositivo al devolverlo'
    },
    fotosDevolucion: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
        comment: 'JSON array de URLs de fotos de la devolución'
    },
    observaciones: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true
    }
}, {
    sequelize: connection_1.default,
    tableName: 'detalles_devolucion',
    timestamps: true,
});
// Relaciones
actaDevolucion_1.ActaDevolucion.hasMany(DetalleDevolucion, { foreignKey: 'actaDevolucionId', as: 'detalles' });
DetalleDevolucion.belongsTo(actaDevolucion_1.ActaDevolucion, { foreignKey: 'actaDevolucionId', as: 'actaDevolucion' });
DetalleDevolucion.belongsTo(dispositivo_1.Dispositivo, { foreignKey: 'dispositivoId', as: 'dispositivo' });
dispositivo_1.Dispositivo.hasMany(DetalleDevolucion, { foreignKey: 'dispositivoId', as: 'detallesDevolucion' });
exports.default = DetalleDevolucion;
