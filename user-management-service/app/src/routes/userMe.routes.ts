import { FastifyInstance } from "fastify";
import { UpdateUserBody, UserController } from "../controllers/user.controller";
import { reconstructAuthHeader } from "../middlewares/reconstructAuthHeader";
import { verifyAuth } from "../middlewares/verifyAuth";
import { verifyCSRF } from "../middlewares/verifyCSRF";

import {
  get2FAStatus,
  enable2FA,
  disable2FA,
  generate2FAQrCode,
} from '../handlers/twoFA.handler';
/**
 * Ensemble des routes de l'API utilisateur actuellement connecté
 * @param app 
 */
async function userMeRoutes(app: FastifyInstance) {
  
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
  app.get('/',{ preHandler: [verifyAuth] }, userController.getUserMe) /* async function (req, reply) {

  /*
   metre a jour les donnees de l'utilisateur connecté
   */
  app.put<{ Body: UpdateUserBody }>("/", { preHandler: [verifyAuth,verifyCSRF] },userController.updateMe);
  /* metre a jour l'avatar de l'utilisateur connecté*/
   app.post('/upload-avatar', { //@TODO : à rename /avatar
  schema: {
    consumes: ['multipart/form-data'],
  },preHandler: [verifyAuth,verifyCSRF]
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
  app.get<{ Params: { id: string; }; }>("/users/:id",{ preHandler: [verifyAuth] },/*  {schema: UserSchema.getUserById} ,*/ userController.getUserMeById); 
  
/* 
   recuperer les stats de l'utilisateur connecté
  */

  app.get("/leaderboard",/*  {schema: UserSchema.getUserById} ,*/ userController.getUsersLeaderboard); 
  app.get("/stats/:id",/*  {schema: UserSchema.getUserById} ,*/ userController.getUserStatsById); 
  /* metre a jour les amis de l'utilisateur connecté*/
  app.put("/addFriend",/*  {schema: UserSchema.updateUser}, */ userController.addFriend);
  app.put<{ Body: { friendName: string; }; }>("/addFriendByUserName",{ preHandler: [verifyAuth] }, userController.addFriendByUserName);
  app.put<{ Body: { friendId: string; }; }>("/removeFriendById",{ preHandler: [verifyAuth] }, userController.removeFriend);
  app.put("/updatePassword",{ preHandler: [verifyAuth] },/*  {schema: UserSchema.updateUser}, */ userController.updateMePassword);

  //app.get("/", {/* preHandler: [loggerMiddleware], *//* schema: UserSchema.getUsers */}, userController.getUsers);
  //app.get("/:id",/*  {schema: UserSchema.getUserById} ,*/ userController.getUserById);
  app.get("/:id/stats",/*  {schema: UserSchema.getUserById} ,*/ userController.getUserStatsById);//@TODO remove
  //app.put("/:id/stats",/*  {schema: UserSchema.getUserById} ,*/ userController.updateStatsById);
  //app.put("/:id", {schema: UserSchema.updateUser}, userController.updateUser);
  //app.delete("/:id",/*  {schema: UserSchema.deleteUser}, */ userController.deleteUser);
 // app.post("/query", {schema: UserSchema.requestQuery}, userController.requestQuery);
  //pour tester les users

  /**
   * gestion des games de l'utilisateur connecté
   */
  app.get("/games",{ preHandler: [verifyAuth] }, userController.getUserGames);
  app.get<{ Params: { id: string; }; }>("/games/:id",{ preHandler: [verifyAuth] }, userController.getUserGamesByPlayerId);
 // app.get("/games/:id",/*  {schema: UserSchema.getUserById} ,*/ userController.getUserGameById);
  //app.get("/games/:id/stats",/*  {schema: UserSchema.getUserById} ,*/ userController.getUserGameStatsById);
  //app.put("/games/:id/stats",/*  {schema: UserSchema.getUserById} ,*/ userController.updateUserGameStatsById);

  /**
   * gestion des tournaments de l'utilisateur connecté
   */
  app.get("/tournaments",{ preHandler: [verifyAuth] },/*  {schema: UserSchema.getUserById} ,*/ userController.getUserTournaments);
  app.get<{ Params: { id: string; }; }>("/tournaments/:id",{ preHandler: [verifyAuth] },/*  {schema: UserSchema.getUserById} ,*/ userController.getUserTournamentsByUserId);
//  app.get("/tournaments/id/:id",/*  {schema: UserSchema.getUserById} ,*/ userController.getUserTournamentById);
//  app.get("/tournaments/id/:id/stats",/*  {schema: UserSchema.getUserById} ,*/ userController.getUserTournamentStatsById);
//  app.put("/tournaments/id/:id/stats",/*  {schema: UserSchema.getUserById} ,*/ userController.updateUserTournamentStatsById);
//  app.get("/tournaments/id/:id/rounds",/*  {schema: UserSchema.getUserById} ,*/ userController.getUserTournamentRoundsById);
//  app.get("/tournaments/id/:id/rounds/:roundId",/*  {schema: UserSchema.getUserById} ,*/ userController.getUserTournamentRoundById);
//  app.get("/tournaments/id/:id/rounds/:roundId/stats",/*  {schema: UserSchema.getUserById} ,*/ userController.getUserTournamentRoundStatsById);
  //app.post("/", {schema: UserSchema.createUser }, userController.createUser);


  // Vérifier le statut 2FA
  app.get('/2fa/status', { preHandler: [verifyAuth] }, get2FAStatus);
  // Activer le 2FA
  app.put('/2fa/enable', { preHandler: [verifyAuth] }, enable2FA);
  // Désactiver le 2FA
  app.put('/2fa/disable', { preHandler: [verifyAuth] }, disable2FA);
  // Générer un QR code pour le 2FA
  app.get('/2fa/qrcode', { preHandler: [verifyAuth] }, generate2FAQrCode);

}

export default userMeRoutes;
