import { NextFunction, Request, Response } from "express";
import JwtGenerate from "../helpers/jwt";

export default class ValidarJwt {
    private static _intance: ValidarJwt;

    public static get instance() {
        return this._intance || (this._intance = new ValidarJwt());
    }

    constructor() { }

    public async validarJwt(req: Request | any, res: Response, next: NextFunction) {
        try {
            const { authorization } = req.headers;
            // Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI2M2NhYjQwNDJhMDA0OGIxMmQwNjE3ZjgiLCJub21icmUiOiJvY3VsdXMgMiIsImFwZWxsaWRvIjoiZWxlY3RybyBzb2Z0IiwiaWF0IjoxNjc0NDExNzM5LCJleHAiOjE2NzQ0OTgxMzl9.lVHpjrRSRmtti67qJu3DeKhAO5-rLChPXFr0zVQscHg
            if (!authorization) {
                return res.status(401).json({
                    msg: `error token no existe`
                });
            }
            "Bearer token"
            const token = authorization.split(" ")[1];

            const { uid, nombre, apellido }: any = await JwtGenerate.instance.comprobarToken(token);

            req.uid = uid;
            req.nombre = nombre;
            req.apellido = apellido;

        } catch (error) {
            return res.status(500).json({
                ok: true,
                msg: `Error conectarse con el servidor`
            });
        }
        next();

    }
}