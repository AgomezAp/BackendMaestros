"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.obtenerMaestrosPorIdUsuario = exports.eliminarUsuarioId = exports.restablecerContrasena = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const maestros_1 = require("../models/maestros");
const user_1 = require("../models/user");
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { nombre, apellido, correo, contrasena } = req.body;
    const emailDomain = correo.split('@')[1];
    if (emailDomain !== 'andrespublicidadtg.com') {
        return res.status(400).json({
            msg: 'Correo no valido',
        });
    }
    // Verificar si el usuario ya existe
    const userOne = yield user_1.User.findOne({ where: { correo: correo } });
    if (userOne) {
        return res.status(400).json({
            msg: `El usuario ya existe con el email: ${correo}`,
        });
    }
    const passwordHash = yield bcrypt_1.default.hash(contrasena, 10);
    try {
        const newUser = yield user_1.User.create({
            nombre,
            apellido,
            correo,
            contrasena: passwordHash,
        });
        res.status(200).json({
            message: "Usuario registrado con éxito",
            user: newUser,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Problemas al registrar el usuario",
            message: err.message || err,
        });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { correo, contrasena } = req.body;
    const user = yield user_1.User.findOne({
        where: { correo },
    });
    if (!user) {
        return res.status(400).json({
            msg: `El usuario no existe con el email: ${correo}`,
        });
    }
    const contrasenaValida = yield bcrypt_1.default.compare(contrasena, user.contrasena);
    if (!contrasenaValida) {
        return res.status(400).json({
            msg: "Contraseña incorrecta",
        });
    }
    const token = jsonwebtoken_1.default.sign({
        Uid: user.Uid,
        correo: user.correo,
    }, process.env.SECRET_KEY || "DxVj971V5CxBQGB7hDqwOenbRbbH4mrS", {
        expiresIn: "365d", // 1 año
    });
    res.json({
        msg: "Usuario logeado con éxito",
        Uid: user.Uid,
        nombre: user.nombre,
        apellido: user.apellido,
        token,
    });
});
exports.login = login;
const restablecerContrasena = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { correo, nuevaContrasena } = req.body;
    try {
        const user = yield user_1.User.findOne({ where: { correo } });
        if (!user) {
            return res.status(404).json({ msg: "Usario no encontrado" });
        }
        const passwordHash = yield bcrypt_1.default.hash(nuevaContrasena, 10);
        user.contrasena = passwordHash;
        yield user.save();
        res.status(200).json({
            msg: "Contraseña restablecida con éxito",
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Problemas al restablecer la contraseña",
            message: err.message || err,
        });
    }
});
exports.restablecerContrasena = restablecerContrasena;
const eliminarUsuarioId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { Uid } = req.params;
    try {
        const user = yield user_1.User.findByPk(Number(Uid));
        if (!user) {
            return res.status(404).json({ msg: "Usuario no encontrado" });
        }
        yield user.destroy();
        res.status(200).json({ msg: "Usuario eliminado con éxito" });
    }
    catch (error) {
        res.status(500).json({ msg: "Error al eliminar el usuario", error });
    }
});
exports.eliminarUsuarioId = eliminarUsuarioId;
const obtenerMaestrosPorIdUsuario = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { Uid } = req.params;
    try {
        const user = yield user_1.User.findByPk(Number(Uid), {
            include: [{ model: maestros_1.Maestro, as: 'maestros' }]
        });
        if (!user) {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
        }
        res.status(200).json({ maestros: user.maestros });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al obtener los maestros del usuario', error });
    }
});
exports.obtenerMaestrosPorIdUsuario = obtenerMaestrosPorIdUsuario;
