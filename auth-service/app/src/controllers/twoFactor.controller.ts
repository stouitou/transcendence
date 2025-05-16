import  UserRepository  from "../repository/User.repository";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { BaseController } from "./BaseController";


/**
 * Contrôleur d'authentification 2FA

 */
export class TwoFactorController extends BaseController {
  private UserRepository: UserRepository;

  constructor(app: FastifyInstance) {
      super(app);
      this.UserRepository = new UserRepository();

		if (!this.app.twoFactorAuthService) {
			console.error("🔴 twoFactorAuthService is not initialized");
		  } else {
			console.log("🟢 twoFactorAuthService is initialized");
		  }
		    this.verify2FA = this.verify2FA.bind(this);
        this.generate2FAQRcode = this.generate2FAQRcode.bind(this);
        this.enable2FA = this.enable2FA.bind(this);
        this.disable2FA = this.disable2FA.bind(this);
        this.getStatus2FA = this.getStatus2FA.bind(this);
	  }
  async getStatus2FA(req: FastifyRequest, reply: FastifyReply) {
    try {
      console.log("[getStatus2FA] --start--")
      const authToken = req.cookies.authToken;
      //2- Vérifier si le token d'authentification est présent
      if (!authToken) {
        console.log("[getStatus2FA] 2FA QR code no authToken")
        return reply.status(401).send({ error: "Unauthorized" });
      }
      // Vérifier le token pour l'authentification
      const decoded = this.app.jwt.verify(authToken, "ACCESS_TOKEN_PUBLIC_KEY") as {id: number};
      const user = await this.UserRepository.getById(decoded.id);
      if (!user) {
        return reply.status(401).send({ error: "Unauthorized" });
      }
      //3- Vérifier si l'utilisateur a déjà un secret pour l'authentification à deux facteurs
      const {authProviders} = user;
      if (!authProviders || authProviders.length === 0) {
        return reply.status(400).send({ error: "User has no authProviders" });
      }
      const authProvider = authProviders[0];
      if (!authProvider) {
        return reply.status(400).send({ error: "User has no authProviders" });
      }
      const {provider, provider_id, two_factor_auth, two_factor_auth_method } = authProvider;
      const twaFAStatus = {
        provider,
        provider_id,
        two_factor_auth,
        two_factor_auth_method,
      };
     return reply.status(200).send({ ...twaFAStatus });
    } catch (error) {
      console.error("🔴[enable2FA] error", error);
      return reply.status(500).send({ error: "Internal server error" });
    }
    
  }

  /**
   * Activer l'authentification à deux facteurs
   * pour l'authentification par application mobile
   * ou par email
   * neccessite de verifier si l'utilisateur a un authToken
   *
   * @param req
   * @param reply
   * @returns
   */
  async enable2FA(req: FastifyRequest, reply: FastifyReply) {
    try {
      console.log("[🔐enable2FA] --start--")
      const { method } = req.body as { method: "totp" | "email" };
      //1- Vérifier si la méthode est présente
      if (!method) {
        return reply.status(400).send({ error: "Method is required" });
      }
      const authToken = req.cookies.authToken;
      //2- Vérifier si le token d'authentification est présent
      if (!authToken) {
        console.log("[🔐enable2FA] 2FA QR code no authToken")
        return reply.status(401).send({ error: "Unauthorized" });
      }
      // Vérifier le token temporaire pour l'authentification à deux facteurs
      const decoded = this.app.jwt.verify(authToken, "ACCESS_TOKEN_PUBLIC_KEY") as {id: number};
      const user = await this.UserRepository.getById(decoded.id);
      if (!user) {
        return reply.status(401).send({ error: "Unauthorized" });
      }
      //3- Vérifier si l'utilisateur a déjà un secret pour l'authentification à deux facteurs
      const {authProviders} = user;
      if (!authProviders || authProviders.length === 0) {
        return reply.status(400).send({ error: "User has no authProviders" });
      }
      const authProvider = authProviders[0];
      if (!authProvider) {
        return reply.status(400).send({ error: "User has no authProviders" });
      }
      const { provider_id, two_factor_auth } = authProvider;
/*       if (two_factor_auth) {
        return reply.status(400).send({ error: "User already has 2FA enabled" });
      } */
      
      //4- Activer l'authentification à deux facteurs
     const result = await this.app.twoFactorAuthService.enable2FA(provider_id, method);
     console.log("[🔐enable2FA] success")
     return reply.status(200).send({ message: "2FA enabled" });
    } catch (error) {
      console.error("🔴[enable2FA] error", error);
      return reply.status(500).send({ error: "Internal server error" });
    }
  }

  /**
   * desactiver l'authentification à deux facteurs
   * pour l'authentification par application mobile
   * ou par email
   * neccessite de verifier si l'utilisateur a un authToken
   * @param req 
   * @param reply 
   * @returns 
   */
  async disable2FA(req: FastifyRequest, reply: FastifyReply) {
    try {
      console.log("[disable2FA] --start--")
      const authToken = req.cookies.authToken;
      //2- Vérifier si le token d'authentification est présent
      if (!authToken) {
        console.log("[🔐enable2FA] 2FA QR code no authToken")
        return reply.status(401).send({ error: "Unauthorized" });
      }
      // Vérifier le token pour l'authentification
      const decoded = this.app.jwt.verify(authToken, "ACCESS_TOKEN_PUBLIC_KEY") as {id: number};
      const user = await this.UserRepository.getById(decoded.id);
      if (!user) {
        return reply.status(401).send({ error: "Unauthorized" });
      }
      //3- Vérifier si l'utilisateur a déjà un secret pour l'authentification à deux facteurs
      const {authProviders} = user;
      if (!authProviders || authProviders.length === 0) {
        return reply.status(400).send({ error: "User has no authProviders" });
      }
      const authProvider = authProviders[0];
      if (!authProvider) {
        return reply.status(400).send({ error: "User has no authProviders" });
      }
      const { provider_id, two_factor_auth } = authProvider;
      if (!two_factor_auth) {
        return reply.status(400).send({ error: "User already has 2FA disable" });
      }
      
      //4- Activer l'authentification à deux facteurs
     const result = await this.app.twoFactorAuthService.disable2FA(provider_id);
     console.log("[disable2FA] success")
     return reply.status(200).send({ message: "2FA disable" });
    } catch (error) {
      console.error("🔴[enable2FA] error", error);
      return reply.status(500).send({ error: "Internal server error" });
    }
    
  }

  /**
   * Générer le QR code pour l'authentification à deux facteurs
   * pour l'authentification par application mobile
   * 
   * neccessite de verifier si l'utilisateur a un authToken
   * 
   * @param req 
   * @param reply 
   * @returns 
   */
  async generate2FAQRcode(req: FastifyRequest, reply: FastifyReply) {
    try {
      console.log("[🔐generate2FAQRcode] --start--")
      //1- Vérifier si le token d'authentification est présent
         const authToken = req.cookies.authToken;
        if (!authToken) {
          console.log("[🔐generate2FAQRcode] 2FA QR code no authToken")
          return reply.status(401).send({ error: "Unauthorized" });
        }
      //2- Vérifier le token temporaire pour l'authentification à deux facteurs
      const decoded = this.app.jwt.verify(authToken, "ACCESS_TOKEN_PUBLIC_KEY") as {id: number};
      const qrBuffer = await this.app.twoFactorAuthService.generate2FASecret(decoded.id);
      reply
        .header("Content-Type", "image/png")
        .header("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
        .header("Pragma", "no-cache")
        .header("Expires", "0")
        .header("Surrogate-Control", "no-store")
        .send(qrBuffer);
    } catch (error) {
      console.error("🔴[generate2FAQRcode] error", error);
      return reply.status(500).send({ error: "Internal server error" });
    }
  }
  
  /**
   * Vérifier le code de l'authentification à deux facteurs
   * pour l'authentification par email ou par application mobile
   * neccessite de verifier si l'utilisateur a un authToken2FA obtenu lors du login
   * 
   * @param req 
   * @param reply 
   * @returns 
   */

  async verify2FA(req: FastifyRequest, reply: FastifyReply) {
    try {
      console.log("🔐[verify2FA] --start--")
      const { code } = req.body as { code: string };
      //1- Vérifier si le code est présent
      if (!code) {
        return reply.status(400).send({ error: "Code is required" });
      }
      const authToken2FA = req.cookies.authToken2FA;
      //2- Vérifier si le token d'authentification est présent
      if (!authToken2FA) {
        console.log("[🔐verify2FA] 2FA QR code no authToken")
        return reply.status(401).send({ error: "[verify2FA] Unauthorized" });
      }
      // Vérifier le token temporaire pour l'authentification à deux facteurs
      const decoded = this.app.jwt.verify(authToken2FA, "ACCESS_TOKEN_PUBLIC_KEY") as {
          email: string;
          method: "totp" | "email";
        };
        const isValid = await this.app.twoFactorAuthService.verify2FACode(decoded.email, decoded.method, code);
        if (!isValid) {
            return reply.status(400).send({ error: "Invalid 2FA code" });
          }

      //reset le cookie
        // reply.clearCookie('authToken2FA');//@TODO
        // Authentifier l'utilisateur
        const params = {authProviders:{provider_id:decoded.email, provider:"local"}};
        const user = await this.UserRepository.getOneByParams(params);
        if (!user) {
          return reply.status(400).send({ error: "User not found" });
        }
        const token = this.app.authService.generateToken(user);
          // Définir le cookie avec le token
        reply.setCookie('authToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Utiliser 'secure' en production
            sameSite: 'strict',
            path: '/',
            maxAge: 3600 // 1 heure
        });
      return reply.status(201).send({ token: token });
    }
    catch (error) {
      console.error("🔴[verify2FA] error", error);
      return reply.status(500).send({ error: "Internal server error" });
    }
  }

}
