import { FastifyInstance } from "fastify";
import FastifyPassport from "@fastify/passport";
import { AuthController } from "../controllers/auth.controller";
import { AuthSchema } from "../schemas/auth.schema";
import UserRepository from "@src/repository/User.repository";
import AuthProviderRepository from "@src/repository/AuthProvider.repository";
import { User } from "@src/models/User.models";
async function authRoutes(app: FastifyInstance) {

  const authController = new AuthController(app);
  // Routes base Auth
  app.post("/register", { schema: AuthSchema.register }, authController.register);
  app.post("/login", { schema: AuthSchema.login }, authController.login);
  app.get("/me", /* { schema: AuthSchema.profileMe }, */ authController.me);//@DEBUG
 // app.get("/logout", { schema: AuthSchema.logout }, authController.logout);
  
  // Routes OAuth
  app.get("/google",   { schema: AuthSchema.oauthProvider }, FastifyPassport.authenticate("google", { scope: ["email", "profile"] }));
  app.get("/github",   { schema: AuthSchema.oauthProvider }, FastifyPassport.authenticate("github", { scope: ["user:email"] }));
  app.get("/facebook", { schema: AuthSchema.oauthProvider }, FastifyPassport.authenticate("facebook", { scope: ["email"] }));

  // Callbacks OAuth
  app.get("/google/callback",
    {
      schema: AuthSchema.oauthCallback,
      preValidation:   FastifyPassport.authenticate('google', { failureRedirect: '/login' })
    },
    function (req, res) {
      console.log("🔗 google callback")
      res.send(req.user)}
  );

  app.get("/github/callback",
    { 
      schema: AuthSchema.oauthCallback,
      preValidation: FastifyPassport.authenticate('github', { authInfo: false ,failureRedirect : "/"})
    },
    (req, reply) => reply.send(req.user)
  );

  //no setup 
  app.get("/facebook/callback",
    {
      schema: AuthSchema.oauthCallback,
      preValidation: FastifyPassport.authenticate('facebook', { authInfo: false ,failureRedirect : "/"})
    },
    (req, reply) => reply.send(req.user)
  );

    // Route pour gérer le callback
  app.get('/42api/callback',
  {
    schema: AuthSchema.oauthCallback
  },
  async (request, reply) => {
    const { code } = request.query as { code: string };
    console.log("🔓 42 Callback");
    try {
      const { token } = await app.fortyTwoOAuth2.getAccessTokenFromAuthorizationCodeFlow(request);
      console.log("🔓 42 Callback Token:", token);
      const {access_token} = token;
      const jwtToken = await authController.oauthCallbackApi42(request, reply, access_token);
      return  reply.send({ token: jwtToken });
    } catch (err) {
      reply.send(err);
    }
  });
}

export default authRoutes;
