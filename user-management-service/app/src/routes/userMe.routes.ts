import { FastifyInstance } from "fastify";
import {UserController} from "../controllers/user.controller";
import { UserSchema } from '../schemas/user.schema';

import  { AuthMiddleware } from "../middlewares/auth.middleware";


/**
 * Ensemble des routes de l'API utilisateur actuellement connecté
 * @param app 
 */
async function userMeRoutes(app: FastifyInstance) {
  
  //1- Création d'une instance de UserController
  const userController = new UserController();
  const authMiddleware = new AuthMiddleware(app);
  //2- Définition des Hooks
  /**
   * onRequest : Hook qui est exécuté avant que Fastify ne commence à traiter la requête.
   * Il est utile pour les tâches qui doivent être effectuées pour chaque requête.
   */
  app.addHook('onRequest', async (request, reply) => {
    const startTime = Date.now(); // Démarrer le chronomètre
   
    const authToken = request.cookies.authToken;
    if (authToken && !request.headers.authorization) {
      request.headers.authorization = `Bearer ${authToken}`;
    }
    let endTime = Date.now(); // Arrêter le chronomètre
    console.log(`⏱️ Hook onRequest [check authToken] exécuté en ${endTime - startTime} ms`);
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

    let endTime = Date.now(); // Arrêter le chronomètre
    console.log(`⏱️ Hook onRequest [await res.json()] exécuté en ${endTime - startTime} ms`);
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

    let endTime = Date.now(); // Arrêter le chronomètre
    console.log(`⏱️ Hook onRequest [delete data.authProviders;] exécuté en ${endTime - startTime} ms`);
      }
      //5- Ajout de l'utilisateur " authentifié, et netoyé" à la requête
      request.authenticatedUser = data
    } catch (error) {
      //6- Gestion des erreurs
      console.error("🟥 userRoutes onRequest error",error)
      return reply.code(error.status).send({ error: error.message });
    }finally {
      const endTime = Date.now(); // Arrêter le chronomètre
      console.log(`⏱️ Hook onRequest exécuté en ${endTime - startTime} ms`);
    }
  })

  /**
   * preParsing : Hook qui est exécuté avant que Fastify ne commence à analyser le corps de la requête.
   */   
  /* app.addHook('preParsing', async (request) => {
    console.log("🔗 userRoutes preParsing")
   
  }) */

  

// manipuler les donnees liees a l'utilisateur connecte
  //3- Définition des routes
  /* 
    recuperer les donnees de l'utilisateur connecté contenues dans le token
  */
  app.get('/',{/* preHandler: [authMiddleware.authMiddleware],schema: UserSchema.me */}, async function (req, reply) {
    console.log("🔗 userRoutes /me")
    //console.log("🔗 userRoutes /me req.authenticatedUser",req.authenticatedUser)
    return reply.code(200).send({ ... req.authenticatedUser })
  })
  /*
   metre a jour les donnees de l'utilisateur connecté
   */
  app.put("/",/*  {schema: UserSchema.updateUser}, */ userController.updateMe);
  /* metre a jour l'avatar de l'utilisateur connecté*/
   app.post('/upload-avatar', { //@TODO : à rename /avatar
  schema: {
    consumes: ['multipart/form-data'],
  }
}, userController.updateUserAvatar);
  /* 
   recuperer les amis de l'utilisateur connecté
  */
//  app.get("/friends",/*  {schema: UserSchema.getUserById} ,*/ userController.getUserFriendsById);
  /* recuperer les demandes d'amis de l'utilisateur connecté*/
//  app.get("/friendRequests",/*  {schema: UserSchema.getUserById} ,*/ userController.getUserFriendRequestsById);
  /* recuperer les invitations de l'utilisateur connecté*/
//  app.get("/invitations",/*  {schema: UserSchema.getUserById} ,*/ userController.getUserInvitationsById);
  /* recuperer les invitations de l'utilisateur connecté*/
//  app.get("/invitations/:id",/*  {schema: UserSchema.getUserById} ,*/ userController.getUserInvitationById);
  /* 
   recuperer les stats de l'utilisateur connecté
  */
  app.get("/stats",/*  {schema: UserSchema.getUserById} ,*/ userController.getUserStatsById);
  /* metre a jour les amis de l'utilisateur connecté*/
  app.put("/addFriend",/*  {schema: UserSchema.updateUser}, */ userController.addFriend);
  app.put("/removeFriend",/*  {schema: UserSchema.updateUser}, */ userController.removeFriend);

  //app.get("/", {/* preHandler: [loggerMiddleware], *//* schema: UserSchema.getUsers */}, userController.getUsers);
  //app.get("/:id",/*  {schema: UserSchema.getUserById} ,*/ userController.getUserById);
  app.get("/:id/stats",/*  {schema: UserSchema.getUserById} ,*/ userController.getUserStatsById);
  //app.put("/:id/stats",/*  {schema: UserSchema.getUserById} ,*/ userController.updateStatsById);
  //app.put("/:id", {schema: UserSchema.updateUser}, userController.updateUser);
  //app.delete("/:id",/*  {schema: UserSchema.deleteUser}, */ userController.deleteUser);
 // app.post("/query", {schema: UserSchema.requestQuery}, userController.requestQuery);
  //pour tester les users

  /**
   * gestion des games de l'utilisateur connecté
   */
  app.get("/games", userController.getUserGames);
  app.get("/games/:id",/*  {schema: UserSchema.getUserById} ,*/ userController.getUserGameById);
  //app.get("/games/:id/stats",/*  {schema: UserSchema.getUserById} ,*/ userController.getUserGameStatsById);
  //app.put("/games/:id/stats",/*  {schema: UserSchema.getUserById} ,*/ userController.updateUserGameStatsById);

  /**
   * gestion des tournaments de l'utilisateur connecté
   */
  app.get("/tournaments",/*  {schema: UserSchema.getUserById} ,*/ userController.getUserTournaments);
  app.get("/tournaments/id/:id",/*  {schema: UserSchema.getUserById} ,*/ userController.getUserTournamentById);
//  app.get("/tournaments/id/:id/stats",/*  {schema: UserSchema.getUserById} ,*/ userController.getUserTournamentStatsById);
//  app.put("/tournaments/id/:id/stats",/*  {schema: UserSchema.getUserById} ,*/ userController.updateUserTournamentStatsById);
//  app.get("/tournaments/id/:id/rounds",/*  {schema: UserSchema.getUserById} ,*/ userController.getUserTournamentRoundsById);
//  app.get("/tournaments/id/:id/rounds/:roundId",/*  {schema: UserSchema.getUserById} ,*/ userController.getUserTournamentRoundById);
//  app.get("/tournaments/id/:id/rounds/:roundId/stats",/*  {schema: UserSchema.getUserById} ,*/ userController.getUserTournamentRoundStatsById);
  //app.post("/", {schema: UserSchema.createUser }, userController.createUser);



}

export default userMeRoutes;
