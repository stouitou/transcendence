import { FastifyInstance } from "fastify";
import {UserController} from "../controllers/user.controller";
import { UserSchema } from '../schemas/user.schema';

import  loggerMiddleware  from "../middlewares/logger.middleware";
import  { AuthMiddleware } from "../middlewares/auth.middleware";
import { User } from "@src/models/User";
//@TODO pour tester les hooks


async function userRoutes(app: FastifyInstance) {
  
  //1- Création d'une instance de UserController
  const userController = new UserController();
  const authMiddleware = new AuthMiddleware(app);
  //2- Définition des Hooks
  app.addHook('onRequest',  (request, reply, done) => {    
    console.log("🔗 userRoutes onRequest")
    done()
      })
  app.addHook('preParsing', async (request) => {
    console.log("🔗 userRoutes preParsing")
    request.authenticatedUser = {
      id: 42,
      name: 'Jane Doe',
      role: 'user'
    }
  })
  //3- Définition des routes
  //3-a Routes pour quelques tests de middleware
  app.get('/me/is-admin',{schema: UserSchema.isAdmin}, async function (req, reply) {
    console.log("🔗 userRoutes /me/is-admin")
    return { isAdmin: req.authenticatedUser?.role === 'admin' || false }
  })
  app.get('/me/is-user',{schema: UserSchema.isUser}, async function (req, reply) {
    console.log("🔗 userRoutes /me/is-user")
    return { isUser: req.authenticatedUser?.role === 'user' || false }
  })
  app.get('/me',{preHandler: [authMiddleware.authMiddleware],schema: UserSchema.me}, async function (req, reply) {
    console.log("🔗 userRoutes /me")
    console.log("🔗 userRoutes /me req.authenticatedUser",req.authenticatedUser)
    return reply.code(200).send({ ... req.authenticatedUser })
  })



  app.get('/decode', /* {schema: UserSchema.bebugResponse}, */async (request, reply) => {
    try {
      //1- Récupération du token de l'en-tête de la requête
      const authHeader = request.headers.authorization;
      if (!authHeader) {
        //2- Si le token n'est pas présent, on retourne une erreur
      return reply.status(401).send({ error: "Accès interdit, token requis." });
      }
      //3- On extrait le token du header Authorization: Bearer <token>
      const token = authHeader.split(" ")[1];
      console.log("in authMiddleware: token", token);
      //4- On décode le token
      const decoded = app.jwt.verify(token, "ACCESS_TOKEN_PUBLIC_KEY");
      console.log("🔐 decoded", decoded)
      //5- On retourne le contenu du token
     return reply.code(200).send({ ...decoded });
    } catch (error) {
      return reply.status(401).send({ error: "Token invalide." });
    }

    /**
     * Will return:
     *
     * {
         "id": 11,
         "role": "user",
         "iat": 1740954958,
         "exp": 1740958558
        }
     */
  })



  app.get("/", {/* preHandler: [loggerMiddleware], *//* schema: UserSchema.getUsers */}, userController.getUsers);
  app.get("/:id",/*  {schema: UserSchema.getUserById} ,*/ userController.getUserById);
  app.put("/:id", {schema: UserSchema.updateUser}, userController.updateUser);
  app.delete("/:id",/*  {schema: UserSchema.deleteUser}, */ userController.deleteUser);
 // app.post("/query", {schema: UserSchema.requestQuery}, userController.requestQuery);
  //pour tester les users
  app.post("/", {schema: UserSchema.createUser }, userController.createUser);
}

export default userRoutes;
