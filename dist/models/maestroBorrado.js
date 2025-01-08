"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.maestroBorrado = void 0;
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../database/connection"));
const user_1 = require("./user");
class maestroBorrado extends sequelize_1.Model {
}
exports.maestroBorrado = maestroBorrado;
maestroBorrado.init({
    Mid: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    nombre: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    apellido: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    correo: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    cedula: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    firma: {
        type: sequelize_1.DataTypes.TEXT("long"),
        allowNull: false,
    },
    descripcion: {
        type: sequelize_1.DataTypes.TEXT("long"),
        allowNull: false,
    },
    Uid: {
        type: sequelize_1.DataTypes.INTEGER,
    },
    estado: {
        type: sequelize_1.DataTypes.STRING,
        defaultValue: 'activo',
    },
    region: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    marca: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    modelo: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
}, {
    sequelize: connection_1.default,
    modelName: "MaestroBorrado",
});
user_1.User.hasMany(maestroBorrado, { foreignKey: "Uid", as: "maestroBorrado" });
maestroBorrado.belongsTo(user_1.User, { foreignKey: "Uid", as: "usuarios" });
