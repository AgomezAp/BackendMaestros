import { DataTypes, Model, } from 'sequelize';
import sequelize from '../database/connection.js';
import { User } from './user.js';
export class MaestroEntregado extends Model {
}
MaestroEntregado.init({
    Mid: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nombre: {
        type: DataTypes.STRING,
    },
    NombreMaestro: {
        type: DataTypes.STRING,
    },
    maestroRecibido: {
        type: DataTypes.STRING,
        allowNull: true
    },
    firma: {
        type: DataTypes.TEXT("long"),
        allowNull: false,
    },
    descripcionEntrega: {
        type: DataTypes.TEXT("long"),
        allowNull: true
    },
    descripcionRecibe: {
        type: DataTypes.TEXT("long"),
        allowNull: true
    },
    Uid: {
        type: DataTypes.INTEGER
    },
    estado: {
        type: DataTypes.STRING,
        defaultValue: 'activo',
    },
    region: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    marca: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    modelo: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    imei: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    fecha: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
}, {
    sequelize,
    modelName: 'Maestro',
    timestamps: false,
});
User.hasMany(MaestroEntregado, { foreignKey: "Uid", as: "maestroEntregado" });
MaestroEntregado.belongsTo(User, { foreignKey: "Uid", as: "usuarios" });
