import { ConfigOptions, v2 as cloudinary } from "cloudinary";
import { api_key, api_secret, cloud_name } from "../global/enviorenment";

export default class ImagenCloudinary {

    private static _instance: ImagenCloudinary;
    private _cloudinary: ConfigOptions;

    public static get instance(){
        return this._instance || (this._instance = new ImagenCloudinary());
    }

    constructor(){
        this._cloudinary = cloudinary.config({
            cloud_name,
            api_key,
            api_secret
        })
    }

    public get clodinary(){
        return cloudinary;
    }


}