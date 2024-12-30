import {
  DataTypes,
  Model,
} from 'sequelize';

import sequelize from '../database/connection';

export class maestroBorrado extends Model {
  public Mid!: number;
  public nombre!: string;
  public apellido!: string;
  public correo!: string;
  public cedula!: string;
  public firma!: string;
  public estado!: string;
  public descripcion!: string;
  public Uid!: number;
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

    apellido: {
      type: DataTypes.STRING,

      allowNull: false,
    },

    correo: {
      type: DataTypes.STRING,

      allowNull: false,
    },

    cedula: {
      type: DataTypes.STRING,

      allowNull: false,
    },

    firma: {
      type: DataTypes.STRING,

      allowNull: false,
    },

    descripcion: {
      type: DataTypes.STRING,

      allowNull: false,
    },
    Uid: {
      type: DataTypes.INTEGER,
    },
    estado: {
      type: DataTypes.STRING,
      defaultValue: 'activo',
    },
  },

  {
    sequelize,

    modelName: "MaestroBorrado",
  }
);
