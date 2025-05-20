
import { FastifyReply, FastifyRequest } from "fastify";
import nodemailer from "nodemailer";
const USER_FROM = process.env.MAIL_USER || "noreply@invalidMailNoSet.fr";

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  secure: true, //false, // true for 465, false for other ports
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
 },
/* service: "gmail",
  auth: {
    type: "OAuth2",
    user:  process.env.GOOGLE_MAIL,
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
	accessToken: process.env.GOOGLE_ACCESS_TOKEN,
  }  */
});

export const sendResetPasswordEmail = async (to:string, url:string) => {
  try {
		const mailOptions = {
		  from: `Transcendence<${USER_FROM}>`,
			to: to,
			subject: 'Reinitialisation de mot de passe',
      text: `Voici votre lien de réinitialisation de mot de passe : ${url}`,
			html: `<p>Voici votre lien de réinitialisation de mot de passe : <a href="${url}">${url}</a></p>`,
		};
		const info = await transporter.sendMail(mailOptions)
		console.log('📤 Message envoyé:', info.messageId);
	}
	catch (err) {
		console.log(err);
		throw {
			status: 500,
			message: "Error sending email"}
		}
}

//@TODO :test a delete
export const sendMail = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
	const code = Math.floor(100000 + Math.random() * 900000);
	  const mailOptions = {
		  from: `Transcendence<${USER_FROM}>`,
    to: "brigui.nizar@gmail.com",
    subject: 'Votre code de connexion',
    text: `Voici votre code de sécurité : ${code}`,
    html: `<p>Voici votre code de sécurité : <b>${code}</b></p>`,
  };
   const info = await transporter.sendMail(mailOptions);

  console.log('📤 Message envoyé:', info.messageId);
  console.log('📨 Voir le message:', info);
    return reply.send({status: 200,});
  } catch (err) {
    console.log(err);
    return reply.send({
	  status: 500,
	  message: "Error sending email",
	  error: err,
	});
  }
};

export const send2FAEmail = async (to:string,code:string) => {
	try {
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
		throw {
			status: 500,
			message: "Error sending email"}
		}
}
