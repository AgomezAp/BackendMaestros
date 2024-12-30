"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../database/connection"));
class User extends sequelize_1.Model {
}
exports.User = User;
User.init({
    Uid: {
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
    contrasena: {
        type: sequelize_1.DataTypes.STRING,
    },
}, {
    sequelize: connection_1.default,
    tableName: "users",
    timestamps: false,
});
