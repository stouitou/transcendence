import { FastifyInstance } from "fastify";
import {UpdateUserBody, UserController} from "../controllers/user.controller";
import { reconstructAuthHeader } from "../middlewares/reconstructAuthHeader";
import { verifyAuth } from "../middlewares/verifyAuth";
import { verifyCSRF } from "../middlewares/verifyCSRF";

import {
  get2FAStatusById,
  disable2FAById,
} from '../handlers/twoFA.handler';
import { loggerMiddleware } from "../middlewares/logger.middleware";
import { AdminSchema } from "../schemas/admin.schema";
import { verifyIsAdmin } from "../middlewares/verifyIsAdmin";
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
  app.addHook('onRequest', loggerMiddleware);
   // Middleware global pour reconstruire l'en-tête Authorization
  app.addHook('onRequest', reconstructAuthHeader);

  //3- Définition des routes
  //  recuperer Touts les utilisateurs
  app.get('/',{schema: AdminSchema.getUsers, preHandler: [verifyAuth,verifyIsAdmin] }, userController.getUsers);
  //metre a jour les donnees de l'utilisateur par id
  app.put<{ Params: { id: string }, Body: UpdateUserBody&{role?:string} }>("/:id",{schema: AdminSchema.updateUserById, preHandler: [verifyAuth,verifyIsAdmin,verifyCSRF]}, userController.updateUser);
  app.post('/:id/upload-avatar', { schema: AdminSchema.updateUserAvatarById, preHandler: [verifyAuth,verifyIsAdmin,verifyCSRF] }, userController.updateUserAvatarById);
  app.delete<{ Params: { id: string }}>("/:id",{schema:AdminSchema.deleteUserById, preHandler: [verifyAuth,verifyIsAdmin,verifyCSRF]}, userController.deleteUser);
 
  // 2FA
  // Vérifier le statut 2FA
  app.get('/:id/2fa/status', {schema: AdminSchema.get2FAStatus, preHandler: [verifyAuth,verifyIsAdmin] }, get2FAStatusById);
  // Désactiver le 2FA
  app.put('/:id/2fa/disable', { schema: AdminSchema.disable2FA, preHandler: [verifyAuth,verifyIsAdmin] }, disable2FAById);


}

export default userAdminRoutes;
