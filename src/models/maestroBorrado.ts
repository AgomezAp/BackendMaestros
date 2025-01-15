import {
  DataTypes,
  Model,
} from 'sequelize';

import sequelize from '../database/connection';
import { User } from './user';

export class maestroBorrado extends Model {
  public Mid!: number;
  public NombreMaestro!: string;
  public nombre!: string;
  public firma!: string;
  public estado!: string;
  public descripcion!: string;
  public Uid!: number;
  public region!: string;
  public marca!: string;
  public modelo!: string;
  public imei!: string;
  public fecha!: Date;
  public tipoMovimiento!: string;
}

maestroBorrado.init(
  {
    Mid: {
      type: DataTypes.INTEGER,

      autoIncrement: true,

      primaryKey: true,
    },

    nombre: {
      type: DataTypes.STRING,

      allowNull: false,
    },


    NombreMaestro: {
      type: DataTypes.STRING,

      allowNull: false, 
    },

    firma: {
      type: DataTypes.TEXT("long"),
      allowNull: false,
    },

    descripcion: {
      type: DataTypes.TEXT("long"),

      allowNull: false,
    },
    Uid: {
      type: DataTypes.INTEGER,
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
    fecha: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },

  {
    sequelize,

    modelName: "MaestroBorrado",
  }
);
User.hasMany(maestroBorrado, {foreignKey: "Uid",as: "maestroBorrado"});
maestroBorrado.belongsTo(User, {foreignKey: "Uid",as: "usuarios"});
