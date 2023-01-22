import express from 'express';
import cors from 'cors';
import { SERVER_PORT } from './global/enviorenment';
import Database from './database/database';
import routerUsuario from './routes/usuario.routes';
import bodyParser from 'body-parser';
import fileUpload from 'express-fileupload';

const app = express();

//Conexión a la base de datos
Database.instance.dbConnection();

// Programa pueda entender la estructura del body
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(cors({
    origin: true,
    credentials: true
}))



app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/',
    createParentPath: true,
    limits: {
        fileSize: 100000000 //10mb
    }
}))

app.use('/', routerUsuario);

app.listen(SERVER_PORT, ()=>{
    console.log(`El servidor esta funcionando en el puerto ${SERVER_PORT}`);
});