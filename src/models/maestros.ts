import {
  DataTypes,
  Model,
} from 'sequelize';

import sequelize from '../database/connection';
import { User } from './user';

export class Maestro extends Model {
  public Mid!: number;
  public NombreMaestro!: string;
  public maestroRecibido!: string;
  public nombre!: string;
  public firmaEntrega!: string;
  public firmaRecibe!: string;
  public descripcionEntrega!: string;
  public descripcionRecibe!: string;
  public Uid!: number;
  public estado!: string;
  public region!: string;
  public marca!: string;
  public modelo!: string;
  public imei!: string;
  public fechaRecibe !: Date;
  public fechaEntrega !: Date;

}

Maestro.init(
  {
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
      allowNull: true
    },
    maestroRecibido:{
      type: DataTypes.STRING,
      allowNull: true
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
    Uid: {
      type: DataTypes.INTEGER
    },
    estado: {
      type: DataTypes.STRING,
      defaultValue: 'activo',
    },
    region: { // Nuevo campo región
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
    fechaRecibe: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    fechaEntrega: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Maestro',
    timestamps: false,
  }
);
User.hasMany(Maestro, {foreignKey: "Uid",as: "maestros"});
Maestro.belongsTo(User, {foreignKey: "Uid",as: "usuarios"});
