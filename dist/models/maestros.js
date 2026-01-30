import { DataTypes, Model, } from 'sequelize';
import sequelize from '../database/connection.js';
import { User } from './user.js';
import { Analista } from './analista.js';
export class Maestro extends Model {
}
Maestro.init({
    Mid: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nombre: {
        type: DataTypes.STRING,
        comment: 'Nombre descriptivo del celular'
    },
    tipo: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Tipo de dispositivo: Smartphone, Tablet, Laptop, Desktop, Otro'
    },
    analistaAsignado: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Nombre del analista que tiene asignado el celular'
    },
    Aid: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID del analista asignado'
    },
    analistaRecibe: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Nombre de quien recibe el celular de vuelta'
    },
    firmaEntrega: {
        type: DataTypes.TEXT("long"),
        allowNull: true,
    },
    firmaRecibe: {
        type: DataTypes.TEXT("long"),
        allowNull: true,
    },
    descripcionEntrega: {
        type: DataTypes.TEXT("long"),
        allowNull: true
    },
    descripcionRecibe: {
        type: DataTypes.TEXT("long"),
        allowNull: true
    },
    fotosEntrega: {
        type: DataTypes.TEXT("long"),
        allowNull: true,
        comment: 'JSON array con URLs de fotos del celular al entregar'
    },
    fotosRecibe: {
        type: DataTypes.TEXT("long"),
        allowNull: true,
        comment: 'JSON array con URLs de fotos del celular al recibir'
    },
    Uid: {
        type: DataTypes.INTEGER
    },
    estado: {
        type: DataTypes.STRING,
        defaultValue: 'disponible',
        comment: 'disponible, en_uso, dañado'
    },
    almacen: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'Principal',
        comment: 'Almacén o ubicación del celular'
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
        comment: 'IMEI del celular'
    },
    stockMinimo: {
        type: DataTypes.INTEGER,
        defaultValue: 5,
        comment: 'Stock mínimo para alertas'
    },
    fechaIngreso: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'Fecha de ingreso al inventario'
    },
    fechaSalida: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'Fecha de salida/entrega'
    },
}, {
    sequelize,
    modelName: 'Maestro',
    timestamps: false,
});
User.hasMany(Maestro, { foreignKey: "Uid", as: "maestros" });
Maestro.belongsTo(User, { foreignKey: "Uid", as: "usuarios" });
Analista.hasMany(Maestro, { foreignKey: "Aid", as: "celulares" });
Maestro.belongsTo(Analista, { foreignKey: "Aid", as: "analista" });
