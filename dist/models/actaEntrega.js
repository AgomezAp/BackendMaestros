"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActaEntrega = void 0;
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../database/connection"));
const user_1 = require("./user");
/**
 * Modelo ActaEntrega - Registro de préstamos de dispositivos
 * Un acta puede contener múltiples dispositivos
 */
class ActaEntrega extends sequelize_1.Model {
}
exports.ActaEntrega = ActaEntrega;
ActaEntrega.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    numeroActa: {
        type: sequelize_1.DataTypes.STRING,
        unique: true,
        allowNull: false,
        comment: 'Número único del acta de entrega'
    },
    nombreReceptor: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        comment: 'Nombre completo de quien recibe los dispositivos'
    },
    cedulaReceptor: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        comment: 'Cédula/Identificación del receptor'
    },
    cargoReceptor: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        comment: 'Cargo de la persona que recibe'
    },
    telefonoReceptor: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    correoReceptor: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    firmaReceptor: {
        type: sequelize_1.DataTypes.TEXT('long'),
        allowNull: false,
        comment: 'Firma digital en formato Base64'
    },
    fechaEntrega: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: sequelize_1.DataTypes.NOW,
        comment: 'Fecha y hora de la entrega'
    },
    fechaDevolucionEsperada: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: true,
        comment: 'Fecha esperada de devolución'
    },
    fechaDevolucionReal: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
        comment: 'Fecha real de devolución completa'
    },
    estado: {
        type: sequelize_1.DataTypes.ENUM('activa', 'devuelta_parcial', 'devuelta_completa', 'vencida'),
        defaultValue: 'activa',
        comment: 'Estado del acta de entrega'
    },
    observacionesEntrega: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
        comment: 'Observaciones al momento de la entrega'
    },
    observacionesDevolucion: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
        comment: 'Observaciones al momento de la devolución'
    },
    Uid: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        comment: 'Usuario que creó el acta'
    }
}, {
    sequelize: connection_1.default,
    modelName: 'ActaEntrega',
    tableName: 'actas_entrega',
    timestamps: true,
});
// Relación con Usuario
user_1.User.hasMany(ActaEntrega, { foreignKey: 'Uid', as: 'actas' });
ActaEntrega.belongsTo(user_1.User, { foreignKey: 'Uid', as: 'usuario' });
