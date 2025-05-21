import { FastifyInstance, FastifyRequest } from "fastify";
import {UpdateUserBody, UserController} from "../controllers/user.controller";
import { UserSchema } from '../schemas/user.schema';

import  { AuthMiddleware } from "../middlewares/auth.middleware";
import { reconstructAuthHeader } from "@src/middlewares/reconstructAuthHeader";
import { verifyAuth } from "@src/middlewares/verifyAuth";
import { verifyCSRF } from "@src/middlewares/verifyCSRF";
//import { AuthServiceController } from "@src/controllers/authService.controller";

import {
  get2FAStatus,
  enable2FA,
  disable2FA,
  generate2FAQrCode,
  get2FAStatusById,
  disable2FAById,
} from '../handlers/twoFA.handler';
/**
 * Ensemble des routes de l'API utilisateur actuellement connecté
 * @param app 
 */
async function userAdminRoutes(app: FastifyInstance) {
  
  //1- Création d'une instance de UserController
  const userController = new UserController();
  //2- Définition des Hooks
  /**
   * onRequest : Hook qui est exécuté avant que Fastify ne commence à traiter la requête.
   * Il est utile pour les tâches qui doivent être effectuées pour chaque requête.
   */
   // Middleware global pour reconstruire l'en-tête Authorization
  app.addHook('onRequest', reconstructAuthHeader);

// manipuler les donnees liees a l'utilisateur connecte
  //3- Définition des routes
  /* 
    recuperer les donnees du profil de l'utilisateur connecté
  */
  app.get('/',{ preHandler: [verifyAuth] }, userController.getUsers) /* async function (req, reply) {

  /*
   metre a jour les donnees de l'utilisateur connecté
   */
  app.put<{ Body: UpdateUserBody }>("/", { preHandler: [verifyAuth,verifyCSRF] },userController.updateMe);
  /* metre a jour l'avatar de l'utilisateur connecté*/
   app.post('/:id/upload-avatar', { //@TODO : à rename /avatar
  schema: {
    consumes: ['multipart/form-data'],
  },preHandler: [verifyAuth,verifyCSRF]
}, userController.updateUserAvatarById);
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
  app.put<{ Params: { id: string }, Body: UpdateUserBody&{role?:string} }>("/:id",{preHandler: [verifyAuth,verifyCSRF]},/*  {schema: UserSchema.updateUser} ;*/ userController.updateUser);
  app.delete<{ Params: { id: string }}>("/:id",{preHandler: [verifyAuth,verifyCSRF]},/*  {schema: UserSchema.deleteUser}, */ userController.deleteUser);
 // app.post("/query", {schema: UserSchema.requestQuery}, userController.requestQuery);
  //pour tester les users

  /**
   * gestion des games de l'utilisateur connecté
   */
  app.get("/games",{ preHandler: [verifyAuth] }, userController.getUserGames);
  app.get("/games/:id",/*  {schema: UserSchema.getUserById} ,*/ userController.getUserGameById);
  //app.get("/games/:id/stats",/*  {schema: UserSchema.getUserById} ,*/ userController.getUserGameStatsById);
  //app.put("/games/:id/stats",/*  {schema: UserSchema.getUserById} ,*/ userController.updateUserGameStatsById);

  /**
   * gestion des tournaments de l'utilisateur connecté
   */
  app.get("/tournaments",{ preHandler: [verifyAuth] },/*  {schema: UserSchema.getUserById} ,*/ userController.getUserTournaments);
  app.get("/tournaments/id/:id",/*  {schema: UserSchema.getUserById} ,*/ userController.getUserTournamentById);
//  app.get("/tournaments/id/:id/stats",/*  {schema: UserSchema.getUserById} ,*/ userController.getUserTournamentStatsById);
//  app.put("/tournaments/id/:id/stats",/*  {schema: UserSchema.getUserById} ,*/ userController.updateUserTournamentStatsById);
//  app.get("/tournaments/id/:id/rounds",/*  {schema: UserSchema.getUserById} ,*/ userController.getUserTournamentRoundsById);
//  app.get("/tournaments/id/:id/rounds/:roundId",/*  {schema: UserSchema.getUserById} ,*/ userController.getUserTournamentRoundById);
//  app.get("/tournaments/id/:id/rounds/:roundId/stats",/*  {schema: UserSchema.getUserById} ,*/ userController.getUserTournamentRoundStatsById);
  //app.post("/", {schema: UserSchema.createUser }, userController.createUser);


  // Vérifier le statut 2FA
  app.get('/:id/2fa/status', { preHandler: [verifyAuth] }, get2FAStatusById);
  // Activer le 2FA
  app.put('/2fa/enable', { preHandler: [verifyAuth] }, enable2FA);
  // Désactiver le 2FA
  app.put('/:id/2fa/disable', { preHandler: [verifyAuth] }, disable2FAById);
  // Générer un QR code pour le 2FA
  app.get('/2fa/qrcode', { preHandler: [verifyAuth] }, generate2FAQrCode);

}

export default userAdminRoutes;
