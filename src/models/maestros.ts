import {
  DataTypes,
  Model,
} from 'sequelize';

import sequelize from '../database/connection';
import { User } from './user';

export class Maestro extends Model {
  public Mid!: number;
  public NombreMaestro!: string;
  public nombre!: string;
  public apellido!: string;
  public correo!: string;
  public cedula!: string;
  public firma!: string;
  public descripcion!: string;
  public Uid!: number;
  public estado!: string;
  public region!: string;
  public marca!: string;
  public modelo!: string;
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
    apellido: {
      type: DataTypes.STRING,
    },
    NombreMaestro: {
      type: DataTypes.STRING,
    },
    correo: {
      type: DataTypes.STRING,
    },
    cedula: {
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
  },
  {
    sequelize,
    modelName: 'Maestro',
    timestamps: false,
  }
);
User.hasMany(Maestro, {foreignKey: "Uid",as: "maestros"});
Maestro.belongsTo(User, {foreignKey: "Uid",as: "usuarios"});
