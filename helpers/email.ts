//nhrrzwtmwyzarxhb
import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

export default class Email {
    private static _instance: Email;
    private transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo>;

    public static get instance(){
        return this._instance || (this._instance = new Email());
    }

    constructor(){
        this.transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: 'doctrinaomnia@gmail.com',
                pass: 'nhrrzwtmwyzarxhb'
            }
        });
    }

    public verificarEmail(){
        this.transporter.verify().then(()=>{
            console.log('Listo para enviar email')
        })
    }

    public async enviarEmail(email: string, usuario: string, passwordNew: string){
        return await this.transporter.sendMail({
            from: '"Recuperacion de contraseña "<doctrinaomnia@gmail.com>',
            to: email,
            subject: 'Recuperacion de contraseña',
            html: `<b>Su usuario es: ${usuario} y su contraseña será ${passwordNew} por favor cambie su contraseña</b>`
        })
    }
}