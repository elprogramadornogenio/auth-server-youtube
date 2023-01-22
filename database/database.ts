import { DB_CNN } from "../global/enviorenment";
import mongoose from 'mongoose';

export default class Database {
    private static _instance: Database;
    private urlBase: string;

    constructor(){
        this.urlBase = DB_CNN;
    }

    public static get instance(){
        return this._instance || (this._instance = new Database());
    }

    public async dbConnection(){
        try {
            mongoose.set('strictQuery', false);
            await mongoose.connect(this.urlBase, {});
            console.log('base de datos conectada');
        } catch (error) {
            console.log(error);
            throw new Error("La base de datos no se ha podido conectar");
        }
        
    }
}
