import { Router } from "express";
import Usuarios from "../controllers/Usuario";
import ValidarJwt from "../middleware/validarJwt";
import { check } from "express-validator/src/middlewares/validation-chain-builders";
import ValidarCampos from "../middleware/validarCampos";
import ValidarAutenticacion from "../middleware/validarAutenticacion";

const routerUsuario = Router();

// Crear Usuario
//http://localhost:5000/registrar

routerUsuario.post('/registrar',[
    check('usuario', 'El usuario es obligatorio').not().isEmpty(),
    check('email', 'El email es obligatorio').isEmail(),
    check('password', 'El password es obligatorio').isLength({min:6}),
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('apellido', 'El apellido es obligatorio').not().isEmpty(),
    ValidarCampos.instance.validarCampos
], Usuarios.instance.crearUsuario);

//http://localhost:5000/login

routerUsuario.post('/login',[
    check('usuario', 'El usuario es obligatorio').not().isEmpty(),
    check('password', 'El password es obligatorio').isLength({min:6}),
    ValidarCampos.instance.validarCampos
], Usuarios.instance.loginUsuario);

//http://localhost:5000/RecuperarPassword

routerUsuario.post('/RecuperarPassword',[
    check('usuario', 'El usuario es obligatorio').not().isEmpty(),
    check('email', 'El email es obligatorio').isEmail(),
    ValidarCampos.instance.validarCampos
], Usuarios.instance.recuperarPassword);

//http://localhost:5000/editar

routerUsuario.post('/editar',[
    check('_id', 'El id es obligatorio').isMongoId(),
    check('usuario', 'El usuario es obligatorio').not().isEmpty(),
    check('email', 'El email es obligatorio').isEmail(),
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('apellido', 'El apellido es obligatorio').not().isEmpty(),
    ValidarAutenticacion.instance.validarAutenticacion,
    ValidarCampos.instance.validarCampos
], Usuarios.instance.editarUsuario);

//http://localhost:5000/editarImagen/63cab4042a0048b12d0617f8
routerUsuario.post('/editarImagen/:_id',[
    ValidarAutenticacion.instance.validarAutenticacion
], Usuarios.instance.actualizarImagenPerfil);

//http://localhost:5000/cambiarPassword
routerUsuario.post('/cambiarPassword',[
    check('_id', 'El id es obligatorio').isMongoId(),
    check('newPassword', 'El nuevo password es obligatorio').isLength({min:6}),
    check('password', 'El password es obligatorio').isLength({min:6}),
    ValidarAutenticacion.instance.validarAutenticacion,
    ValidarCampos.instance.validarCampos
], Usuarios.instance.cambiarPassword);

//http://localhost:5000/revalidarToken
routerUsuario.post('/revalidarToken', [
    ValidarJwt.instance.validarJwt
] ,Usuarios.instance.revalidarToken);

export default routerUsuario;