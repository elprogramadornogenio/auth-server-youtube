import { Request, Response } from "express";
import { Usuario } from '../models/usuario';
import { IUsuario } from '../interfaces/usuario';
import { generate } from 'generate-password';
import bycript from "bcrypt";
import JwtGenerate from "../helpers/jwt";
import Email from "../helpers/email";
import ImagenCloudinary from "../helpers/cloudinary";

export default class Usuarios {
    private static _instance: Usuarios;

    public static get instance() {
        return this._instance || (this._instance = new Usuarios());
    }

    public async crearUsuario(req: Request, res: Response) {

        const { usuario, email, password, nombre, apellido } = req.body;

        try {
            // Usuario existe
            const usuarioCuenta = await Usuario.findOne({ usuario });

            if (usuarioCuenta) {
                return res.status(400).json({
                    ok: false,
                    msg: `El usuario ${usuario} ya existe`
                });
            }
            // Email existe

            const usuarioEmail = await Usuario.findOne({ email });

            if (usuarioEmail) {
                return res.status(400).json({
                    ok: false,
                    msg: `El email ${email} ya existe`
                });
            }

            // Podemos crear el usuario

            const iusuario: IUsuario = {
                usuario,
                email,
                password,
                nombre,
                apellido
            }

            const dbUsuario = new Usuario(iusuario);

            // Cifrar password bycript

            const salt = bycript.genSaltSync();

            dbUsuario.password = bycript.hashSync(password, salt);

            // Token para registarse

            const token = await JwtGenerate.instance.generarJWT(dbUsuario.id, nombre, apellido);

            await dbUsuario.save();


            // Enviar imagen por defecto al usuario cloudinary
            let imagen = '';

            if (!dbUsuario.imagen) {
                imagen = 'https://res.cloudinary.com/djrgoresy/image/upload/v1674228220/no-profile-photo_youtube.jpg';
            }
            // Respuesta
            return res.status(201).json({
                ok: true,
                uid: dbUsuario.id,
                usuario,
                email,
                nombre,
                apellido,
                imagen,
                token
            })


        } catch (error) {
            return res.status(500).json({
                ok: true,
                msg: `Error en el funcionamiento del servidor`
            });
        }

    }

    public async loginUsuario(req: Request, res: Response) {

        const { usuario, password } = req.body;

        try {
            const dbUser = await Usuario.findOne({ usuario });

            if (!dbUser) {
                return res.status(400).json({
                    ok: false,
                    msg: `El usuario no existe`
                })
            }

            const validPassword = bycript.compareSync(password, dbUser.password);

            if (!validPassword) {
                return res.status(400).json({
                    ok: false,
                    msg: `El password es incorrecto`
                })
            }

            const token = await JwtGenerate.instance.generarJWT(dbUser.id, dbUser.nombre, dbUser.apellido);

            let imagen = '';

            if (!dbUser.imagen) {
                imagen = 'https://res.cloudinary.com/djrgoresy/image/upload/v1674228220/no-profile-photo_youtube.jpg';
            } else {
                imagen = dbUser.imagen;
            }

            return res.status(200).json({
                ok: true,
                uid: dbUser.id,
                nombre: dbUser.nombre,
                apellido: dbUser.apellido,
                email: dbUser.email,
                usuario: dbUser.usuario,
                imagen,
                token
            });
        } catch (error) {
            return res.status(500).json({
                ok: true,
                msg: `Error en el funcionamiento del servidor`
            });
        }
    }

    public async recuperarPassword(req: Request, res: Response) {

        const { usuario, email } = req.body;

        try {
            const dbUser = await Usuario.findOne({ usuario });
            if (!dbUser) {
                return res.status(400).json({
                    ok: false,
                    msg: `El correo no existe`
                })
            }

            if (email != dbUser.email) {
                return res.status(400).json({
                    ok: false,
                    msg: `El email es incorrecto`
                })
            }
            // Crear contraseña nueva
            const passwordNew = generate({
                length: 6,
                numbers: true,
                uppercase: false
            });

            const _id = dbUser.id;

            // Cifrar la nueva contraseña

            const salt = bycript.genSaltSync();

            const iuser: IUsuario = {
                nombre: dbUser.nombre,
                apellido: dbUser.apellido,
                email: dbUser.email,
                usuario: dbUser.usuario,
                password: bycript.hashSync(passwordNew, salt)
            }

            const dbUsuario = await Usuario.updateOne({ _id }, {
                $set: iuser
            });

            if (!dbUsuario) {
                return res.status(400).json({
                    ok: false,
                    msg: `El usuario no se pudo actualizar`
                });
            }

            //Enviar correo
            Email.instance.enviarEmail(email, usuario, passwordNew);

            return res.status(200).json({
                ok: true,
                msg: `Correo enviado a: ${email} satisfactoriamente`
            });

        } catch (error) {
            return res.status(500).json({
                ok: true,
                msg: `Error en el funcionamiento del servidor`
            });
        }

    }

    public async editarUsuario(req: Request, res: Response) {
        const { _id, nombre, apellido, usuario, email } = req.body;

        try {
            // usuario nuevo ya existe
            const dbUser = await Usuario.findOne({ usuario });
            if (dbUser && dbUser._id.toString() != _id) {
                return res.status(400).json({
                    ok: false,
                    msg: `El usuario ${usuario} ya existe`
                });
            }
            // email nuevo ya existe
            const dbEmail = await Usuario.findOne({ email });
            if (dbEmail && dbEmail._id.toString() != _id) {
                return res.status(400).json({
                    ok: false,
                    msg: `El email ${email} ya existe`
                });
            }
            // actualizar la cuenta
            const dbUsuario = await Usuario.findById({ _id });

            if (!dbUsuario) {
                return res.status(400).json({
                    ok: false,
                    msg: `El usuario con id ${_id} no existe`
                });
            }

            const iusuario: IUsuario = {
                nombre,
                apellido,
                usuario,
                email,
                password: dbUsuario.password
            }

            const resUsuario = await Usuario.updateOne({ _id }, {
                $set: iusuario
            })

            if (!resUsuario) {
                return res.status(400).json({
                    ok: false,
                    msg: `El usuario con id ${_id} no se pudo actualizar`
                });
            }

            return res.status(200).json({
                ok: true,
                msg: `El usuario con id ${_id} sí se pudo actualizar`
            })


        } catch (error) {
            return res.status(500).json({
                ok: true,
                msg: `Error en el funcionamiento del servidor`
            });
        }
    }

    public async actualizarImagenPerfil(req: Request | any, res: Response) {

        const { _id } = req.params;

        if (!req.files || Object.keys(req.files).length === 0 || !req.files.imagen) {
            return res.status(400).json({
                msg: `La imagen no se ha enviado correctamente`
            })
        }

        const dbUsuario = await Usuario.findById({ _id });

        if (!dbUsuario) {
            return res.status(400).json({
                msg: `No existe el usuario con id: ${_id}`
            })
        }

        if (dbUsuario.imagen) {
            const nombreArr = dbUsuario.imagen.split('/');
            const nombre = nombreArr[nombreArr.length - 1];
            const [public_id] = nombre.split('.');
            ImagenCloudinary.instance.clodinary.uploader.destroy(public_id);

        }

        try {
            const { tempFilePath } = req.files.imagen;
            const { secure_url } = await ImagenCloudinary.instance.clodinary.uploader.upload(tempFilePath);
            dbUsuario.imagen = secure_url;
            dbUsuario.save();

            return res.status(200).json({
                ok: true,
                imagen: dbUsuario.imagen
            });
        } catch (error) {
            return res.status(500).json({
                ok: true,
                msg: `Error en el conectarse con cloudinary`
            });
        }

    }

    public async cambiarPassword(req: Request, res: Response) {
        const { _id, password, newPassword } = req.body;

        try {
            // agregar el password nuevo != password anterior
            const dbUsuario = await Usuario.findById({ _id });
            if (!dbUsuario) {
                return res.status(400).json({
                    msg: `No existe el usuario con id: ${_id}`
                });
            }
            const validPassword = bycript.compareSync(password, dbUsuario.password);
            if (!validPassword) {

                return res.status(400).json({
                    ok: false,
                    msg: `El password es incorrecto`
                });

            }

            const validNewPassword = bycript.compareSync(newPassword, dbUsuario.password);

            if (validNewPassword) {
                return res.status(400).json({
                    ok: false,
                    msg: `El password nuevo es igual al password anterior`
                });
            }

            const salt = bycript.genSaltSync();
            dbUsuario.password = bycript.hashSync(newPassword, salt);

            dbUsuario.save();

            return res.status(200).json({
                ok: true,
                msg: `El usuario ${dbUsuario.usuario} ha cambiado de contraseña`
            });
        } catch (error) {
            return res.status(500).json({
                ok: true,
                msg: `Error conectarse con el servidor`
            });
        }
    }

    public  async revalidarToken(req: Request | any, res: Response){
        
        const {uid, nombre, apellido} = req;
        console.log("información", uid, nombre, apellido);
        if(!uid || !nombre || !apellido){
            return res.status(400).json({
                ok: false,
                msg: `El token no es correcto`
            });
        }

        const token = await  JwtGenerate.instance.generarJWT(uid, nombre, apellido);

        return res.status(200).json({
            ok: true,
            uid,
            nombre,
            apellido,
            token
        });
    }


}