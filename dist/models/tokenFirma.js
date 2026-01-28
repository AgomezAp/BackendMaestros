"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenFirma = void 0;
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../database/connection"));
const actaEntrega_1 = require("./actaEntrega");
/**
 * Modelo TokenFirma - Tokens para firma externa por correo
 * Estados: pendiente, firmado, rechazado, cancelado
 */
class TokenFirma extends sequelize_1.Model {
}
exports.TokenFirma = TokenFirma;
TokenFirma.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    token: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        comment: 'Token único para acceso a firma'
    },
    actaId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: actaEntrega_1.ActaEntrega,
            key: 'id'
        },
        comment: 'ID del acta asociada'
    },
    correoReceptor: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        comment: 'Correo del receptor'
    },
    estado: {
        type: sequelize_1.DataTypes.ENUM('pendiente', 'firmado', 'rechazado', 'cancelado'),
        defaultValue: 'pendiente',
        comment: 'Estado del token de firma'
    },
    motivoRechazo: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
        comment: 'Motivo si el receptor rechaza/devuelve para corrección'
    },
    fechaEnvio: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: sequelize_1.DataTypes.NOW,
        comment: 'Fecha de envío del correo'
    },
    fechaFirma: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
        comment: 'Fecha en que se firmó'
    },
    ipFirma: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        comment: 'IP desde donde se firmó'
    },
    userAgent: {
        type: sequelize_1.DataTypes.STRING(500),
        allowNull: true,
        comment: 'Navegador/dispositivo usado para firmar'
    }
}, {
    sequelize: connection_1.default,
    tableName: 'tokens_firma',
    timestamps: true,
});
// Relaciones
TokenFirma.belongsTo(actaEntrega_1.ActaEntrega, { foreignKey: 'actaId', as: 'acta' });
actaEntrega_1.ActaEntrega.hasMany(TokenFirma, { foreignKey: 'actaId', as: 'tokensFirma' });
exports.default = TokenFirma;
