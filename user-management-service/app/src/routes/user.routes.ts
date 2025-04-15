import { FastifyInstance } from "fastify";
import {UserController} from "../controllers/user.controller";
import { UserSchema } from '../schemas/user.schema';

import  { AuthMiddleware } from "../middlewares/auth.middleware";

//@TODO pour tester les hooks


async function userRoutes(app: FastifyInstance) {
  
  //1- Création d'une instance de UserController
  const userController = new UserController();
  const authMiddleware = new AuthMiddleware(app);
  //2- Définition des Hooks
  /**
   * onRequest : Hook qui est exécuté avant que Fastify ne commence à traiter la requête.
   * Il est utile pour les tâches qui doivent être effectuées pour chaque requête.
   */
  app.addHook('onRequest', async (request, reply) => {
    const authToken = request.cookies.authToken;
    if (authToken && !request.headers.authorization) {
      request.headers.authorization = `Bearer ${authToken}`;
    }
    //1- Récupération du token dans le header  
    const authHeader = request.headers.authorization;
  //  const authHeader = "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywibmFtZSI6IiIsInJvbGUiOiJ1c2VyIiwibGV2ZWwiOjEsImF2YXRhciI6IiIsImNyZWF0ZWRfYXQiOiIyMDI1LTAzLTE0VDExOjQ5OjIwLjQ0MVoiLCJ1cGRhdGVkX2F0IjoiMjAyNS0wMy0xNFQxMTo0OToyMC40NDFaIiwiaWF0IjoxNzQxOTU5NjMwLCJleHAiOjE3NDE5NTk2OTB9.aE9IIldOzuRFNna9qDBmgOmvaBbDu1qYNkImLDy2-_rkllXfAbW0ejqrJyneJ1GlbojmBOFdhkz63dlYTI4zZ18XJzVKijnypuj_Tf3DWcrrbgUUQXvKhreFIeoo7a9kLYFsa4TjdYXOeV_pHfcdH--l7s7PAnXp0kRrHCwc605N82qDTzyAISyYvieL5cfEWak4lwIDLhpzpqdQw0k07Ois6U4xeR6CMy4Qc6IpKHk1h5Jy4LDjIy7dnwvBwldAeeoXuKRiwGhPZ1WFWhYwqh7y9WTtSNrObi7evTntdVwb8GxRwLHAqMFoGcjjWwjBzEPNqOUFFERtTaNFr-LXXYHIbpzWQQ2hN7D_8QUh26cy47PniueBZ4KeXGCF0A0IrqdQ0FRMZdeyij4kAELP8OcDlV9yOEqYvOf45wSh4mRZzfbrY14Iiqw9aEYwNtQmRRIT85Elm8JferFXil3nlTsJGTKpMjCdskOAMLoFYt3RK6OZNKmrMdWnBnllgqgEPlBR8ZJ72bSUyCYJF6BKFTSQLw0cC8Tff6WfGVbpbGRpDB9grvqBzVIp_LZxERvRSFB2IpTgfd9fOP-3HwHobQzOPVwbMcXWBaFVnvJxuJWiOMnpUgEBhOP89zF9nhabEXEf3aUsG9lrrm1eno0r6RQWmsSJR9jVzl9ii5p3Zs8";
    console.log("🔗 userRoutes onRequest authHeader : ",authHeader)
    try {
      //2- Vérification de la présence du token
      if (!authHeader) {
        //2-1 Si le token n'est pas présent, on retourne une erreur
        throw { status: 401, message: "Accès interdit, token requis." };
      }

      //3- Appel du service d'authentification pour vérifier le token
      const res = await fetch('http://auth_services:3000/api/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': authHeader
        }
      });
      //4- Vérification de la réponse
      const data = await res.json();
      //4-1 Si la réponse n'est pas ok, on retourne une erreur
      if (!res.ok) {
        console.error("not ok")
        throw { status: res.status, message: data.statusText }; //@TODO create custom error
      }
      //4-2 Si la réponse est ok, on verifie si l'utilisateur a des authProviders
      if (data && data.authProviders) {//@TODO : à revoir 
        //4-2-1 Si l'utilisateur a des authProviders, on les
        //supprime pour des raisons de sécurité
       delete data.authProviders;
       console.log("🟠 userRoutes onRequest hook remove authProviders from current user")
      }
      //5- Ajout de l'utilisateur " authentifié, et netoyé" à la requête
      request.authenticatedUser = data
    } catch (error) {
      //6- Gestion des erreurs
      console.error("🟥 userRoutes onRequest error",error)
      return reply.code(error.status).send({ error: error.message });
    }
  })

  /**
   * preParsing : Hook qui est exécuté avant que Fastify ne commence à analyser le corps de la requête.
   */   
  /* app.addHook('preParsing', async (request) => {
    console.log("🔗 userRoutes preParsing")
   
  }) */

  //3- Définition des routes
  app.get('/me',{/* preHandler: [authMiddleware.authMiddleware],schema: UserSchema.me */}, async function (req, reply) {
    console.log("🔗 userRoutes /me")
    //console.log("🔗 userRoutes /me req.authenticatedUser",req.authenticatedUser)
    return reply.code(200).send({ ... req.authenticatedUser })
  })



  app.get('/decode', /* {schema: UserSchema.bebugResponse}, */async (request, reply) => {
    console.log("🔗 userRoutes /decode")

    if (!request.authenticatedUser) {
      // Si le token n'est pas présent, on retourne une erreur
      return reply.status(401).send({ error: "Accès interdit, token requis." });
    }
    return reply.code(200).send({ ...request.authenticatedUser });
  })



  app.get("/", {/* preHandler: [loggerMiddleware], *//* schema: UserSchema.getUsers */}, userController.getUsers);
  app.get("/:id",/*  {schema: UserSchema.getUserById} ,*/ userController.getUserById);
  app.get("/:id/stats",/*  {schema: UserSchema.getUserById} ,*/ userController.getUserStatsById);
  app.put("/:id/stats",/*  {schema: UserSchema.getUserById} ,*/ userController.updateStatsById);
  app.put("/me",/*  {schema: UserSchema.updateUser}, */ userController.updateMe);
  app.put("/me/addFriend",/*  {schema: UserSchema.updateUser}, */ userController.addFriend);
  app.put("/me/removeFriend",/*  {schema: UserSchema.updateUser}, */ userController.removeFriend);
  app.put("/:id", {schema: UserSchema.updateUser}, userController.updateUser);
  app.delete("/:id",/*  {schema: UserSchema.deleteUser}, */ userController.deleteUser);
 // app.post("/query", {schema: UserSchema.requestQuery}, userController.requestQuery);
  //pour tester les users
  app.post("/", {schema: UserSchema.createUser }, userController.createUser);


 app.post('/upload-avatar', { //@TODO : à rename /me/upload-avatar
  schema: {
    consumes: ['multipart/form-data'],
/*    body: {
    type: 'object',
     // required: ['avatar'],
      properties: {
        // file that gets decoded to string
          file: { type: 'string', format: 'binary' }
      },
  }  */
/*     body: {
      type: 'object',
     // required: ['avatar'],
      properties: {
        // file that gets decoded to string
          avatar: { type: 'string', format: 'binary' }
      },
    } */
  }
}, userController.updateUserAvatar);
}

export default userRoutes;
