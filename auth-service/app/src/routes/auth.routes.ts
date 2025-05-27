import { FastifyInstance } from "fastify";
import FastifyPassport from "@fastify/passport";
import { AuthController } from "../controllers/auth.controller";
import { AuthSchema } from "../schemas/auth.schema";
import { sendMail } from "../services/mail.service";
import { TwoFactorController } from "../controllers/twoFactor.controller";
import { CrsfController } from "../controllers/crsf.controller";
import { isGuest } from "../middleware/isGuest.middleware";
import { verifyCSRFToken } from "../middleware/verifyCRSFToken.middleware";
import { AuthHandlerCallback } from "../handlers/callback.handler";

async function authRoutes(app: FastifyInstance) {

  const authController = new AuthController(app);
  const twoFactorController = new TwoFactorController(app);
  const crsfController = new CrsfController(app);
  const handlerCallback = new AuthHandlerCallback(app);
  // Routes base Auth
  app.post("/register", { schema: AuthSchema.register,preHandler:[isGuest,verifyCSRFToken] }, authController.register);
  app.post("/login", { schema: AuthSchema.login,preHandler:[isGuest,verifyCSRFToken] }, authController.login);
  app.post("/logout", authController.logout);
 
  // Routes OAuth
  //demarre l'authentification avec le provider
  app.get("/google",   { schema: AuthSchema.oauthProvider }, FastifyPassport.authenticate("google", { scope: ["email", "profile"] }));
  app.get("/github",   { schema: AuthSchema.oauthProvider }, FastifyPassport.authenticate("github", { scope: ["user:email"] }));
  app.get("/facebook", { schema: AuthSchema.oauthProvider }, FastifyPassport.authenticate("facebook", { scope: ["email"] }));

  // Callbacks OAuth
  // Callback après l'authentification avec le provider
  app.get("/google/callback",
    {
      schema: AuthSchema.oauthCallback,
      preValidation:   FastifyPassport.authenticate('google', { failureRedirect: '/login' })
    },
    handlerCallback.googleHandlerCallback
  );

  app.get("/github/callback",
    { 
      schema: AuthSchema.oauthCallback,
      preValidation: FastifyPassport.authenticate('github', { authInfo: false ,failureRedirect : "/"})
    },
    handlerCallback.githubHandlerCallback
  );

  //no setup 
  app.get("/facebook/callback",
    {
      schema: AuthSchema.oauthCallback,
      preValidation: FastifyPassport.authenticate('facebook', { authInfo: false ,failureRedirect : "/"})
    },
    handlerCallback.facebookHandlerCallback
  );

  app.get('/42api/callback',
  {
    schema: AuthSchema.oauthCallback
  },
  handlerCallback.fortyTwoHandlerCallback
  );

  //Obtient un crsf token , celui-ci est stocké dans la session et transmis au frontend
  app.get('/csrf', crsfController.generateCSRFToken);

  // Routes WsCrsf
  app.get('/ws-csrf', crsfController.generateWsCSRFToken);
//  app.post('/validate-ws-csrf', crsfController.validateWsCSRFToken);

  app.get('/change-password', twoFactorController.changePassword);//a la demande de l'user-management-service

  // 2FA routes, verification du code de 2FA reçu
  app.post('/2fa/verify', twoFactorController.verify2FA);

  //@TODO en cous de test
  app.get('/testSendMail', sendMail);
  app.post('/login/forget-password', authController.loginForgetPassword);//generate reset password token
  app.post('/login/reset-password', authController.loginResetPassword);//set a new password 

}

export default authRoutes;
