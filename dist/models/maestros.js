"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Maestro = void 0;
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../database/connection"));
const user_1 = require("./user");
const analista_1 = require("./analista");
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
        comment: 'Nombre descriptivo del celular'
    },
    tipo: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        comment: 'Tipo de dispositivo: Smartphone, Tablet, Laptop, Desktop, Otro'
    },
    analistaAsignado: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        comment: 'Nombre del analista que tiene asignado el celular'
    },
    Aid: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID del analista asignado'
    },
    analistaRecibe: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        comment: 'Nombre de quien recibe el celular de vuelta'
    },
    firmaEntrega: {
        type: sequelize_1.DataTypes.TEXT("long"),
        allowNull: true,
    },
    firmaRecibe: {
        type: sequelize_1.DataTypes.TEXT("long"),
        allowNull: true,
    },
    descripcionEntrega: {
        type: sequelize_1.DataTypes.TEXT("long"),
        allowNull: true
    },
    descripcionRecibe: {
        type: sequelize_1.DataTypes.TEXT("long"),
        allowNull: true
    },
    fotosEntrega: {
        type: sequelize_1.DataTypes.TEXT("long"),
        allowNull: true,
        comment: 'JSON array con URLs de fotos del celular al entregar'
    },
    fotosRecibe: {
        type: sequelize_1.DataTypes.TEXT("long"),
        allowNull: true,
        comment: 'JSON array con URLs de fotos del celular al recibir'
    },
    Uid: {
        type: sequelize_1.DataTypes.INTEGER
    },
    estado: {
        type: sequelize_1.DataTypes.STRING,
        defaultValue: 'disponible',
        comment: 'disponible, en_uso, dañado'
    },
    almacen: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        defaultValue: 'Principal',
        comment: 'Almacén o ubicación del celular'
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
        comment: 'IMEI del celular'
    },
    stockMinimo: {
        type: sequelize_1.DataTypes.INTEGER,
        defaultValue: 5,
        comment: 'Stock mínimo para alertas'
    },
    fechaIngreso: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: true,
        comment: 'Fecha de ingreso al inventario'
    },
    fechaSalida: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: true,
        comment: 'Fecha de salida/entrega'
    },
}, {
    sequelize: connection_1.default,
    modelName: 'Maestro',
    timestamps: false,
});
user_1.User.hasMany(Maestro, { foreignKey: "Uid", as: "maestros" });
Maestro.belongsTo(user_1.User, { foreignKey: "Uid", as: "usuarios" });
analista_1.Analista.hasMany(Maestro, { foreignKey: "Aid", as: "celulares" });
Maestro.belongsTo(analista_1.Analista, { foreignKey: "Aid", as: "analista" });
