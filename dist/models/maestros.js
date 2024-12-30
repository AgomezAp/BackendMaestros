"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Maestro = void 0;
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../database/connection"));
const user_1 = require("./user");
class Maestro extends sequelize_1.Model {
}
exports.Maestro = Maestro;
Maestro.init({
    Mid: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nombre: {
        type: sequelize_1.DataTypes.STRING,
    },
    apellido: {
        type: sequelize_1.DataTypes.STRING,
    },
    correo: {
        type: sequelize_1.DataTypes.STRING,
    },
    cedula: {
        type: sequelize_1.DataTypes.STRING,
    },
    firma: {
        type: sequelize_1.DataTypes.TEXT("long"),
        allowNull: false,
    },
    descripcion: {
        type: sequelize_1.DataTypes.STRING,
    },
    Uid: {
        type: sequelize_1.DataTypes.INTEGER
    },
    estado: {
        type: sequelize_1.DataTypes.STRING,
        defaultValue: 'activo',
    },
}, {
    sequelize: connection_1.default,
    modelName: 'Maestro',
    timestamps: false,
});
user_1.User.hasMany(Maestro, { foreignKey: "Uid", as: "maestros" });
Maestro.belongsTo(user_1.User, { foreignKey: "Uid", as: "usuarios" });
