"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MovimientoDispositivo = void 0;
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../database/connection"));
const dispositivo_1 = require("./dispositivo");
const user_1 = require("./user");
/**
 * Modelo MovimientoDispositivo - Historial/Trazabilidad completa
 * Registra todos los movimientos de cada dispositivo
 */
class MovimientoDispositivo extends sequelize_1.Model {
}
exports.MovimientoDispositivo = MovimientoDispositivo;
MovimientoDispositivo.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    dispositivoId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'dispositivos',
            key: 'id'
        },
        comment: 'ID del dispositivo'
    },
    tipoMovimiento: {
        type: sequelize_1.DataTypes.ENUM('ingreso', 'prestamo', 'devolucion', 'cambio_estado', 'actualizacion', 'baja'),
        allowNull: false,
        comment: 'Tipo de movimiento realizado'
    },
    estadoAnterior: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        comment: 'Estado antes del movimiento'
    },
    estadoNuevo: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        comment: 'Estado después del movimiento'
    },
    descripcion: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
        comment: 'Descripción detallada del movimiento'
    },
    actaId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID del acta relacionada (si aplica)'
    },
    fecha: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: sequelize_1.DataTypes.NOW,
        comment: 'Fecha y hora del movimiento'
    },
    Uid: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        comment: 'Usuario que realizó el movimiento'
    }
}, {
    sequelize: connection_1.default,
    modelName: 'MovimientoDispositivo',
    tableName: 'movimientos_dispositivo',
    timestamps: false,
});
// Relaciones
dispositivo_1.Dispositivo.hasMany(MovimientoDispositivo, { foreignKey: 'dispositivoId', as: 'movimientos' });
MovimientoDispositivo.belongsTo(dispositivo_1.Dispositivo, { foreignKey: 'dispositivoId', as: 'dispositivo' });
user_1.User.hasMany(MovimientoDispositivo, { foreignKey: 'Uid', as: 'movimientosRealizados' });
MovimientoDispositivo.belongsTo(user_1.User, { foreignKey: 'Uid', as: 'usuario' });
