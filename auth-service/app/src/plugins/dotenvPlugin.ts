import fp from 'fastify-plugin';
import * as dotenv from 'dotenv';


declare module 'fastify' {
  interface FastifyInstance {
    env: any;
  }
}

dotenv.config();

// Vérifier si les variables d'environnement sont définies, sinon les définir avec des valeurs par défaut
if (!process.env.BACKEND_SERVER_URL || process.env.BACKEND_SERVER_URL.trim() === '') {
  process.env.BACKEND_SERVER_URL = 'https://localhost:4433';
}

const replacePlaceholderOrCreateDefault = (key: string, placeholder: string, value: string) => {
  if (process.env[key]?.includes(placeholder) && !key.includes("_SECRET")) {
    process.env[key] = process.env[key]?.replace(placeholder, value);
    console.log(`${key} mis à jour : ${process.env[key]}`);
  }
  if (process.env[key] == undefined) {
    process.env[key] = `YOUR_${key}`;
    console.log(`${key} absente du fichier .env;  Cree avec des valeurs par defaut`);
  }
};
replacePlaceholderOrCreateDefault('GOOGLE_CALLBACK_URL', 'BACKEND_SERVER_URL', process.env.BACKEND_SERVER_URL);
replacePlaceholderOrCreateDefault('API42_REDIRECT_URI', 'BACKEND_SERVER_URL', process.env.BACKEND_SERVER_URL);
replacePlaceholderOrCreateDefault('GITHUB_CALLBACK_URL', 'BACKEND_SERVER_URL', process.env.BACKEND_SERVER_URL);

//si le .env ne contien pas ces variables, on les ajoute
const createDefaultPasseportEnv = (key: string) => {
  if (process.env[`${key}_CLIENT_ID`] == undefined) {
    process.env[`${key}_CLIENT_ID`] = `YOUR_${key}_CLIENT_ID`;
    console.log(`${key}_CLIENT_ID absente du fichier .env;  Cree avec des valeurs par defaut`);
  }
  if (process.env[`${key}_CLIENT_SECRET`] == undefined) {
    process.env[`${key}_CLIENT_SECRET`] = `YOUR_${key}_CLIENT_SECRET`;
    console.log(`${key}_CLIENT_SECRET absente du fichier .env;  Cree avec des valeurs par defaut`);
  }
};

const providers = ['GOOGLE', 'GITHUB', 'API42'];
providers.forEach((provider) => {
  createDefaultPasseportEnv(provider);
});

if ( process.env.SQLITE_DATABASE_URL == undefined || process.env.SQLITE_DATABASE_URL.trim() === '') {
  process.env.SQLITE_DATABASE_URL = "http://database-services:3000/api/v2/database"
  console.log("SQLITE_DATABASE_URL non défini dans le fichier .env, Utilisation de la valeur par défaut.");
}

if ( process.env.MAIL_HOST == undefined || process.env.MAIL_HOST.trim() === '') {
  process.env.MAIL_HOST = "ssl0.ovh.net"
  console.log("MAIL_HOST non défini dans le fichier .env, Utilisation de la valeur par défaut.");
}

if ( process.env.MAIL_USER == undefined || process.env.MAIL_USER.trim() === '') {
  process.env.MAIL_USER = "noreply@doodydoo.fr"
  console.log("MAIL_USER non défini dans le fichier .env, Utilisation de la valeur par défaut.");
}
if ( process.env.MAIL_PASS == undefined || process.env.MAIL_PASS.trim() === '') {
  process.env.MAIL_PASS = "MailPasswordNotFound"
  console.log("MAIL_USER non défini dans le fichier .env, aucun mot de passe n'a été trouvé, les mail ne seront pas envoye!!!.");
}
export default fp(async (fastify, opts) => {
  fastify.decorate('env', process.env);
});