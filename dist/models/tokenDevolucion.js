"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenDevolucion = void 0;
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../database/connection"));
const actaDevolucion_1 = require("./actaDevolucion");
/**
 * Modelo TokenDevolucion - Tokens para firma externa de devolución
 */
class TokenDevolucion extends sequelize_1.Model {
}
exports.TokenDevolucion = TokenDevolucion;
TokenDevolucion.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    token: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    actaDevolucionId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: actaDevolucion_1.ActaDevolucion,
            key: 'id'
        }
    },
    correoDestinatario: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    estado: {
        type: sequelize_1.DataTypes.ENUM('pendiente', 'firmado', 'rechazado', 'cancelado'),
        defaultValue: 'pendiente'
    },
    motivoRechazo: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true
    },
    fechaEnvio: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: sequelize_1.DataTypes.NOW
    },
    fechaFirma: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true
    },
    ipFirma: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    userAgent: {
        type: sequelize_1.DataTypes.STRING(500),
        allowNull: true
    }
}, {
    sequelize: connection_1.default,
    tableName: 'tokens_devolucion',
    timestamps: true,
});
// Relaciones
TokenDevolucion.belongsTo(actaDevolucion_1.ActaDevolucion, { foreignKey: 'actaDevolucionId', as: 'actaDevolucion' });
actaDevolucion_1.ActaDevolucion.hasMany(TokenDevolucion, { foreignKey: 'actaDevolucionId', as: 'tokensFirma' });
exports.default = TokenDevolucion;
