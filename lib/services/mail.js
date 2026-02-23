'use strict';

const Nodemailer = require('nodemailer');
const { Service } = require('@hapipal/schmervice');

module.exports = class MailService extends Service {

    get transporter() {

        if (!this._transporter) {
            this._transporter = Nodemailer.createTransport({
                host: process.env.MAIL_HOST,
                port: parseInt(process.env.MAIL_PORT) || 587,
                auth: {
                    user: process.env.MAIL_USER,
                    pass: process.env.MAIL_PASS
                }
            });
        }

        return this._transporter;
    }

    async send(to, subject, html, attachments = []) {

        const mailOptions = {
            from: process.env.MAIL_FROM || '"IUT Project" <noreply@iut-project.com>',
            to,
            subject,
            html,
            attachments
        };

        const info = await this.transporter.sendMail(mailOptions);
        console.log(`Mail envoyé à ${to} : ${info.messageId}`);
        return info;
    }
};
