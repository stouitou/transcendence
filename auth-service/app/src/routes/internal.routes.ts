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

  app.get("/decodeToken", authController.decodeToken);
  app.get("/me", authController.me);
  app.put("updatePassword/me", authController.updateMePassword);
  app.get('/csrf', crsfController.generateCSRFToken);
  app.post('/validate-csrf',{preHandler:internal}, crsfController.validateCSRFToken);

  // Routes WsCrsf
  app.post('/validate-ws-csrf', crsfController.validateWsCSRFToken);

  app.get('/2fa/qrcode', twoFactorController.generate2FAQRcode);
  app.put('/2fa/enable', twoFactorController.enable2FA);
  app.put('/2fa/disable/me', twoFactorController.disable2FA);
  app.put('/2fa/disable/:id', twoFactorController.disable2FAById);
  app.get('/2fa/status/me', twoFactorController.getStatus2FA);
  app.get('/2fa/status/:id', twoFactorController.getStatus2FAById);
}

export default internalRoutes;
