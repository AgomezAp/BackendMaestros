import { DataTypes, Model, } from 'sequelize';
import sequelize from '../database/connection.js';
export class User extends Model {
}
User.init({
    Uid: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nombre: {
        type: DataTypes.STRING,
    },
    apellido: {
        type: DataTypes.STRING,
    },
    correo: {
        type: DataTypes.STRING,
    },
    contrasena: {
        type: DataTypes.STRING,
    },
}, {
    sequelize,
    tableName: "users",
    timestamps: false,
});
