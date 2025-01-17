"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaestroEntregado = void 0;
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../database/connection"));
const user_1 = require("./user");
class MaestroEntregado extends sequelize_1.Model {
}
exports.MaestroEntregado = MaestroEntregado;
MaestroEntregado.init({
    Mid: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nombre: {
        type: sequelize_1.DataTypes.STRING,
    },
    NombreMaestro: {
        type: sequelize_1.DataTypes.STRING,
    },
    maestroRecibido: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    firma: {
        type: sequelize_1.DataTypes.TEXT("long"),
        allowNull: false,
    },
    descripcionEntrega: {
        type: sequelize_1.DataTypes.TEXT("long"),
        allowNull: true
    },
    descripcionRecibe: {
        type: sequelize_1.DataTypes.TEXT("long"),
        allowNull: true
    },
    Uid: {
        type: sequelize_1.DataTypes.INTEGER
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
    imei: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    fecha: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: true,
    },
}, {
    sequelize: connection_1.default,
    modelName: 'Maestro',
    timestamps: false,
});
user_1.User.hasMany(MaestroEntregado, { foreignKey: "Uid", as: "maestroEntregado" });
MaestroEntregado.belongsTo(user_1.User, { foreignKey: "Uid", as: "usuarios" });
