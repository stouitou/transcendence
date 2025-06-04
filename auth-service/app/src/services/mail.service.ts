
import { ServiceUnavailableError } from "../Errors/errors";
import nodemailer from "nodemailer";
const USER_FROM = process.env.MAIL_USER || "noreply@invalidMailNoSet.fr";

export const send2FAEmail = async (to:string,code:string) => {
	try {
		const transporter = nodemailer.createTransport({
			host: process.env.MAIL_HOST,
			secure: true, //false, // true for 465, false for other ports
			auth: {
				user: process.env.MAIL_USER,
				pass: process.env.MAIL_PASS,
			},
		});
		const mailOptions = {
		  from: `Transcendence<${USER_FROM}>`,
			to: to,
			subject: 'Votre code de connexion',
			text: `Voici votre code de sécurité : ${code}`,
			html: `<p>Voici votre code de sécurité : <b>${code}</b></p>`,
		};
		const info = await transporter.sendMail(mailOptions)
		console.log('📤 Message envoyé:', info.messageId);
	}
	catch (err) {
		console.log(err);
		throw new ServiceUnavailableError("Error sending email");
	}
}
