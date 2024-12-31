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
  public region!: string;
  public marca!: string;
  public modelo!: string;
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
      type: DataTypes.TEXT("long"),
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

    modelName: "MaestroBorrado",
  }
);
