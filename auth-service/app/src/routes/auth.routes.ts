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
  app.post("/logout"/* , { schema: AuthSchema.login } */, authController.logout);
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
      const user = req.user as User & { token: string };
      const token = user.token ?? "";
      console.log("🔗 google callback")
      //res.send(req.user)
      res.setCookie('authToken', token, {
        httpOnly: true,
        secure: true,//process.env.NODE_ENV === 'production', // Utiliser 'secure' en production
        sameSite: 'strict',
        path: '/',
        maxAge: 3600 // 1 heure
    });
      
      res.redirect(`https://localhost:4433/uploads/index.html`);}
  );

  app.get("/github/callback",
    { 
      schema: AuthSchema.oauthCallback,
      preValidation: FastifyPassport.authenticate('github', { authInfo: false ,failureRedirect : "/"})
    },
    function (req, res) {
      const user = req.user as User & { token: string };
      const token = user.token ?? "";
      res.setCookie('authToken', token, {
        httpOnly: true,
        secure: true,//process.env.NODE_ENV === 'production', // Utiliser 'secure' en production
        sameSite: 'strict',
        path: '/',
        maxAge: 3600 // 1 heure
    });      
    res.redirect(`https://localhost:4433/uploads/index.html`);}
  );

  //no setup 
  app.get("/facebook/callback",
    {
      schema: AuthSchema.oauthCallback,
      preValidation: FastifyPassport.authenticate('facebook', { authInfo: false ,failureRedirect : "/"})
    },
    function (req, res) {
      const user = req.user as User & { token: string };
      const token = user.token ?? "";
      res.setCookie('authToken', token, {
        httpOnly: true,
        secure: true,//process.env.NODE_ENV === 'production', // Utiliser 'secure' en production
        sameSite: 'strict',
        path: '/',
        maxAge: 3600 // 1 heure
    });      
    res.redirect(`https://localhost:4433/uploads/index.html`);}
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
      const user = await authController.oauthCallbackApi42(request, reply, access_token); // @TODO change to Promise<string>
     // const user = req.user as User & { token: string };
      const authToken = (user as unknown as User & { token: string }).token ?? "";
        reply.setCookie('authToken', authToken as unknown as string, {
          httpOnly: true,
          secure: true,//process.env.NODE_ENV === 'production', // Utiliser 'secure' en production
          sameSite: 'strict',
          path: '/',
          maxAge: 3600 // 1 heure
      });      
      reply.redirect(`https://localhost:4433/uploads/index.html`);
    //  return  reply.send({ token: jwtToken });
    } catch (err) {
      reply.send(err);
    }
  });
}

export default authRoutes;
