import { FastifyInstance } from "fastify";
import { GameController } from "../controllers/game.controller";



async function dockerRoutes(app: FastifyInstance) {
  
  //1- Création d'une instance de UserController
  const gameController = new GameController();


  app.get("/", {/* preHandler: [loggerMiddleware], *//* schema: UserSchema.getGames */}, gameController.getGames);
  app.get("/:id",/*  {schema: UserSchema.getGameById} ,*/ gameController.getGameById);
  app.put("/:id"/* , {schema: UserSchema.updateUser} */, gameController.updateGame);
  app.delete("/:id",/*  {schema: UserSchema.deleteGame}, */ gameController.deleteGame);
 // app.post("/query", {schema: UserSchema.requestQuery}, gameController.requestQuery);
  //pour tester les users
  //app.post("/"/* , {schema: UserSchema.createGame } */, gameController.createGame);
  // exemple de route pour créer un jeu avec des paramètres
  //  "/local/classic/normal
  //  "/remote/classic/normal"
  //  "/remote/tournament/normal"
  app.post("/:type/:format"/* , {schema: UserSchema.createGame } */, gameController.createGameDocker);
  app.put("/remote/:format/id/:id"/* , {schema: UserSchema.createGame } */, gameController.joinGameById);

}

export default dockerRoutes;
