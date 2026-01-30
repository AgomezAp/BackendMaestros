var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Maestro } from '../models/maestros.js';
import { User } from '../models/user.js';
export const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { nombre, apellido, correo, contrasena } = req.body;
    const emailDomain = correo.split('@')[1];
    if (emailDomain !== 'andrespublicidadtg.com') {
        return res.status(400).json({
            msg: 'Correo no valido',
        });
    }
    // Verificar si el usuario ya existe
    const userOne = yield User.findOne({ where: { correo: correo } });
    if (userOne) {
        return res.status(400).json({
            msg: `El usuario ya existe con el email: ${correo}`,
        });
    }
    const passwordHash = yield bcrypt.hash(contrasena, 10);
    try {
        const newUser = yield User.create({
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
export const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { correo, contrasena } = req.body;
    const user = yield User.findOne({
        where: { correo },
    });
    if (!user) {
        return res.status(400).json({
            msg: `El usuario no existe con el email: ${correo}`,
        });
    }
    const contrasenaValida = yield bcrypt.compare(contrasena, user.contrasena);
    if (!contrasenaValida) {
        return res.status(400).json({
            msg: "Contraseña incorrecta",
        });
    }
    const token = jwt.sign({
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
export const restablecerContrasena = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { correo, nuevaContrasena } = req.body;
    try {
        const user = yield User.findOne({ where: { correo } });
        if (!user) {
            return res.status(404).json({ msg: "Usario no encontrado" });
        }
        const passwordHash = yield bcrypt.hash(nuevaContrasena, 10);
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
export const eliminarUsuarioId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { Uid } = req.params;
    try {
        const user = yield User.findByPk(Number(Uid));
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
export const obtenerMaestrosPorIdUsuario = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { Uid } = req.params;
    try {
        const user = yield User.findByPk(Number(Uid), {
            include: [{ model: Maestro, as: 'maestros' }]
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
