import { FastifyInstance } from "fastify";
import { AuthController } from "../controllers/auth.controller";
import { CrsfController } from "../controllers/crsf.controller";
import { internal } from "../middleware/internal";
import { TwoFactorController } from "../controllers/twoFactor.controller";

async function internalRoutes(app: FastifyInstance) {

  const authController = new AuthController(app);
  const crsfController = new CrsfController(app);
  const twoFactorController = new TwoFactorController(app);
  // Routes base Auth
 // app.post("/register", { schema: AuthSchema.register,preHandler:[isGuest,verifyCSRFToken] }, authController.register);
 // app.post("/login", { schema: AuthSchema.login,preHandler:[isGuest,verifyCSRFToken] }, authController.login);

  app.get("/decodeToken",{schema:{description:'decode AuthToken',tags:['Internal']}}, authController.decodeToken);
  app.get("/me",{schema:{description:'get User Authenticated Profile',tags:['Internal']}}, authController.me);
  app.put("updatePassword/me",{schema:{description:'update password',tags:['Internal']}}, authController.updateMePassword);
  app.get('/csrf',{schema:{description:'generate CSRF Token',tags:['Internal']}}, crsfController.generateCSRFToken);
  app.post('/validate-csrf',{schema:{description:'validate CSRF Token',tags:['Internal']}, preHandler:internal}, crsfController.validateCSRFToken);

  // Routes WsCrsf
  app.post('/validate-ws-csrf',{schema:{description:'validate CSRF Token',tags:['Internal']}}, crsfController.validateWsCSRFToken);

  app.get('/2fa/qrcode',{schema:{description:'generate 2FA QR code',tags:['Internal']}}, twoFactorController.generate2FAQRcode);
  app.put('/2fa/enable',{schema:{description:'enable 2FA',tags:['Internal']}}, twoFactorController.enable2FA);
  app.put('/2fa/disable/me',{schema:{description:'disable 2FA for current user',tags:['Internal']}}, twoFactorController.disable2FA);
  app.put('/2fa/disable/:id',{schema:{description:'disable 2FA for user by ID',tags:['Internal']}}, twoFactorController.disable2FAById);
  app.get('/2fa/status/me',{schema:{description:'get 2FA status for current user',tags:['Internal']}}, twoFactorController.getStatus2FA);
  app.get('/2fa/status/:id',{schema:{description:'get 2FA status for user by ID',tags:['Internal']}}, twoFactorController.getStatus2FAById);
}

export default internalRoutes;
