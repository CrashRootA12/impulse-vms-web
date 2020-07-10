const nodemailer = require('nodemailer');
class ImpulseMailer {
    constructor() {
        this.mailOptions = "" // Initialize
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            secure:true,
            auth: {
                user: '',
                pass: ''
            }
        }) 
        console.log("Mailer Ready")
    }
    prepareMail(reciever,user_id,password) {
        this.mailOptions = {
            from: 'ImpulseVMS<admin@impulsevms.app>',
            to: reciever,
            subject: 'Your Impulse VMS User ID and Login Details',
            html: ``,
            replyTo: '',
            inReplyTo: ''
        }
        return this.mailOptions
    }
    sendMail() {
        this.transporter.sendMail(this.mailOptions,function (err,info) {
            if (err) console.error(err)
            else console.log(info)
        })
    }
}
module.exports = {
    ImpulseMailer:ImpulseMailer
}
