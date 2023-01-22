import { NextFunction, Request, Response } from "express";
import JwtGenerate from '../helpers/jwt';
import moment from "moment";

export default class ValidarAutenticacion {
    private static _instance: ValidarAutenticacion;

    public static get instance() {
        return this._instance || (this._instance = new ValidarAutenticacion());
    }

    public async validarAutenticacion(req: Request, res: Response, next: NextFunction) {
        try {
            // validar token
            const { authorization } = req.headers;

            if (!authorization) {
                return res.status(403).json({
                    msg: `No esta autenticado no tiene permiso para acceder a la información`
                })
            }

            const token = authorization.split(" ")[1];
            const { exp }: any = await JwtGenerate.instance.comprobarToken(token);
            if (exp <= moment().unix()){
                return res.status(401).json({
                    msg: `Token ha expirado`
                })
            }
            
            next();
            
        } catch (error) {
            return res.status(500).json({
                msg: `Error conectarse con el servidor`
            });
        }
    }
}