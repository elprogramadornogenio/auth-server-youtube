import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";

export default class ValidarCampos {
    private static _instance: ValidarCampos;

    public static get instance(){
        return this._instance || (this._instance = new ValidarCampos());
    }

    public validarCampos(req: Request, res: Response, next: NextFunction){
        const error = validationResult(req);

        if(!error.isEmpty()){
            return res.status(400).json({
                ok: false,
                errors: error.mapped()
            })
        }

        next();
    }

}