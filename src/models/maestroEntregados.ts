import {
  DataTypes,
  Model,
} from 'sequelize';

import sequelize from '../database/connection';
import { User } from './user';

export class MaestroEntregado extends Model {
  public Mid!: number;
  public NombreMaestro!: string;
  public nombre!: string;
  public firma!: string;
  public descripcion!: string;
  public Uid!: number;
  public estado!: string;
  public region!: string;
  public marca!: string;
  public modelo!: string;
  public imei!: string;
  public fecha !: Date;
}

MaestroEntregado.init(
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
    },
    firma: {
      type: DataTypes.TEXT("long"),
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.TEXT("long"),
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
    fecha: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Maestro',
    timestamps: false,
  }
);
User.hasMany(MaestroEntregado, {foreignKey: "Uid",as: "maestros"});
MaestroEntregado.belongsTo(User, {foreignKey: "Uid",as: "usuarios"});
