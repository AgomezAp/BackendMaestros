import {
  DataTypes,
  Model,
} from 'sequelize';

import sequelize from '../database/connection';
import { User } from './user';

export class Maestro extends Model {
  public Mid!: number;
  public nombre!: string;
  public apellido!: string;
  public correo!: string;
  public cedula!: string;
  public firma!: string;
  public descripcion!: string;
  public Uid!: number;
  public estado!: string;

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
      type: DataTypes.STRING,
    },

    Uid: {
      type: DataTypes.INTEGER
    },
    estado: {
      type: DataTypes.STRING,
      defaultValue: 'activo',
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
