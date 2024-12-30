"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MovimientoMaestro = void 0;
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../database/connection"));
class MovimientoMaestro extends sequelize_1.Model {
}
exports.MovimientoMaestro = MovimientoMaestro;
MovimientoMaestro.init({
    MMid: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    Mid: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    tipoMovimiento: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    fechaMovimiento: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
}, {
    sequelize: connection_1.default,
    modelName: 'MovimientoMaestro',
    timestamps: false,
});
