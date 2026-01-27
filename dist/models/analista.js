"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Analista = void 0;
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../database/connection"));
class Analista extends sequelize_1.Model {
}
exports.Analista = Analista;
Analista.init({
    Aid: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nombre: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    apellido: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    cedula: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    telefono: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    correo: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    cargo: {
        type: sequelize_1.DataTypes.STRING,
        defaultValue: 'Analista',
    },
    activo: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: true,
    },
}, {
    sequelize: connection_1.default,
    modelName: 'Analista',
    tableName: 'analistas',
    timestamps: false,
});
