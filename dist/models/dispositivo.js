import { DataTypes, Model } from 'sequelize';
import sequelize from '../database/connection.js';
import { User } from './user.js';
/**
 * Modelo Dispositivo - Inventario principal de equipos
 * Estados: disponible, reservado, entregado, dañado, perdido, obsoleto
 */
export class Dispositivo extends Model {
}
Dispositivo.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Nombre identificador del dispositivo'
    },
    categoria: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Tipo: celular, tablet, computador, cargador, accesorio, otro'
    },
    marca: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    modelo: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    serial: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
        comment: 'Número de serie único'
    },
    imei: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'IMEI para celulares y tablets'
    },
    color: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Descripción detallada del dispositivo'
    },
    estado: {
        type: DataTypes.ENUM('disponible', 'reservado', 'entregado', 'dañado', 'perdido', 'obsoleto'),
        defaultValue: 'disponible',
        comment: 'Estado actual del dispositivo en el inventario'
    },
    condicion: {
        type: DataTypes.ENUM('nuevo', 'bueno', 'regular', 'malo'),
        defaultValue: 'bueno',
        comment: 'Condición física del dispositivo'
    },
    ubicacion: {
        type: DataTypes.STRING,
        defaultValue: 'Almacén Principal',
        comment: 'Ubicación física del dispositivo'
    },
    fotos: {
        type: DataTypes.TEXT('long'),
        allowNull: true,
        comment: 'JSON array con URLs de fotos del dispositivo'
    },
    fechaIngreso: {
        type: DataTypes.DATEONLY,
        defaultValue: DataTypes.NOW,
        comment: 'Fecha de ingreso al inventario'
    },
    observaciones: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    Uid: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Usuario que registró el dispositivo'
    }
}, {
    sequelize,
    modelName: 'Dispositivo',
    tableName: 'dispositivos',
    timestamps: true,
});
// Relación con Usuario
User.hasMany(Dispositivo, { foreignKey: 'Uid', as: 'dispositivos' });
Dispositivo.belongsTo(User, { foreignKey: 'Uid', as: 'usuario' });
