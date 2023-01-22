import { sign, verify } from 'jsonwebtoken';
import { SECRET_JWT } from '../global/enviorenment';
import { Response } from 'express';


export default class JwtGenerate {
    private static _instance: JwtGenerate;

    public static get instance(){
        return this._instance || (this._instance = new JwtGenerate());
    }

    public generarJWT(uid: string, nombre: string, apellido: string){
        const payload = {uid, nombre, apellido};

        return new Promise((resolve, reject)=>{
            sign(payload, SECRET_JWT, {
                expiresIn: '24h'
            }, (error, token)=>{
                if(error){
                    console.log(error);
                    reject(error);
                } else {
                    resolve(token);
                }
            });
        });
    }

    public async comprobarToken(token: string){
        return new Promise((resolve, reject)=>{
            verify(token, SECRET_JWT, (err, decoded)=>{
                if(err){
                    reject(err);
                } else {
                    resolve(decoded);
                }
            });
        });
    }
}