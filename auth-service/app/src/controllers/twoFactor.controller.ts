import  UserRepository  from "../repository/User.repository";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { BaseController } from "./BaseController";
import { generateCSRFToken } from "@src/utils/crypto";


/**
 * Contrôleur d'authentification 2FA

 */
export class TwoFactorController extends BaseController {
  private UserRepository: UserRepository;

  constructor(app: FastifyInstance) {
      super(app);
      this.UserRepository = new UserRepository();
			console.log("🟢 TwoFactorController is initialized");
		    this.verify2FA = this.verify2FA.bind(this);
        this.generate2FAQRcode = this.generate2FAQRcode.bind(this);
        this.enable2FA = this.enable2FA.bind(this);
        this.disable2FA = this.disable2FA.bind(this);
        this.disable2FAById = this.disable2FAById.bind(this);
        this.getStatus2FA = this.getStatus2FA.bind(this);
        this.getStatus2FAById = this.getStatus2FAById.bind(this);
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

    async getStatus2FAById(req: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (req.params as { id: number }).id;
      if (!userId) {
        return reply.status(400).send({ error: "User ID is required" });
      }
      console.log("[getStatus2FA] --start--")
      const authToken = req.cookies.authToken;
      //2- Vérifier si le token d'authentification est présent
      if (!authToken) {
        console.log("[getStatus2FA] 2FA QR code no authToken")
        return reply.status(401).send({ error: "Unauthorized" });
      }
      // Vérifier le token pour l'authentification
      const decoded = this.app.jwt.verify(authToken, "ACCESS_TOKEN_PUBLIC_KEY") as {id: number,role: string};
      //verifier le role de l'utilisateur
      if (decoded.role !== "admin") {
        return reply.status(401).send({ error: "Unauthorized" });
      }

      const user = await this.UserRepository.getById(userId);
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
      console.log("[🔐enable2FA] --req.session.csrfToken",req.session.csrfToken)
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


    async disable2FAById(req: FastifyRequest, reply: FastifyReply) {
    try {
       const userId = (req.params as { id: number }).id;
      if (!userId) {
        return reply.status(400).send({ error: "User ID is required" });
      }
      console.log("[disable2FA] --start--")
      const authToken = req.cookies.authToken;
      //2- Vérifier si le token d'authentification est présent
      if (!authToken) {
        console.log("[🔐enable2FA] 2FA QR code no authToken")
        return reply.status(401).send({ error: "Unauthorized" });
      }
      // Vérifier le token pour l'authentification
      const decoded = this.app.jwt.verify(authToken, "ACCESS_TOKEN_PUBLIC_KEY") as {id: number,role: string};
            //verifier le role de l'utilisateur
      if (decoded.role !== "admin") {
        return reply.status(401).send({ error: "Unauthorized" });
      }
      const user = await this.UserRepository.getById(userId);
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
      const { code, isforce = false } = req.body as { code: string; isforce?: boolean };
      if (!code || typeof code !== 'string' || code.length != 6) {
        return reply.status(400).send({ error: "Invalid or missing code" });
      }
      if (typeof isforce !== 'boolean') {
        return reply.status(400).send({ error: "Invalid isforce parameter" });
      }
      console.log("🔐[verify2FA] --req.session.csrfToken",req.session.csrfToken)
      console.log("🔐[verify2FA] --code : ",code,isforce)
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
      console.log("🔐[verify2FA] --authToken2FA : ",authToken2FA)
      const decoded = this.app.jwt.verify(authToken2FA, "ACCESS_TOKEN_PUBLIC_KEY") as {
          email: string;
          method: "totp" | "email";
        };
        console.log("🔐[verify2FA] --decoded : ",decoded, isforce)
        const isValid = await this.app.twoFactorAuthService.verify2FACode(decoded.email, decoded.method, code,isforce);
        console.log("🔐[verify2FA] --isValid : ",isValid)
          // Vérifier si le code est valide
        if (!isValid) {
            return reply.status(400).send({ error: "Invalid 2FA code" });
          }

      //reset le cookie
        // reply.clearCookie('authToken2FA');//@TODO
        // Authentifier l'utilisateur
        const params = {authProviders:{provider_id:decoded.email, provider:"local"}};
        const user = await this.UserRepository.getOneByParams(params);
        if (!user) {
          console.log("[verify2FA] user not found")
          return reply.status(400).send({ error: "User not found" });
        }
        const token = this.app.authService.generateToken(user);

        //effacer le token authToken2FA
        reply.clearCookie('authToken2FA');
          // Définir le cookie avec le token
     if (!isforce) {
        reply.setCookie('authToken', token, {
            httpOnly: true,
            secure: true,//process.env.NODE_ENV === 'production', // Utiliser 'secure' en production
            sameSite: 'strict',
            path: '/',
            maxAge:/*  isforce? 5*60 : */ 3600 //  isforce? 5 minutes : 1 heure
        });
      }

        //si force est true, on instancie la session
        if (isforce) {
          // Instancier la session avec user.id et un crsfToken
          req.session.userID = user.id;
          req.session.csrfToken = generateCSRFToken();
          req.session.csrfTokenExpiration = Date.now() +  60 * 1000;

          // Définir le cookie de reset de mot de passe
                  // 3- generer un token JWT forgot password
              const token = this.app.authService.generateToken(user);//@TODO
                //  console.log("🟢 token ",token)
                      // Définir le cookie avec le token
                    reply.setCookie('authForgetPasswordToken', token, {
                        httpOnly: true,
                        secure: true,
                        sameSite: 'strict',
                        path: '/',
                        maxAge: 350 //==> 5 minutes
                    });
        }
      return reply.status(201).send({ token: token });
    }
    catch (error) {
      console.error("🔴[verify2FA] error", error);
      return reply.status(500).send({ error: "Internal server error" });
    }
  }

  /**
   * changer le mot de passe de l'utilisateur
   * neccessite de verifier si l'utilisateur a un authToken
   * recoit l'ancien mot de passe et le nouveau mot de passe
   * @param req 
   * @param reply 
   */
  async changePassword(req: FastifyRequest, reply: FastifyReply) {
    try {
      console.log("[changePassword] --start--")
      const { oldPassword, newPassword } = req.body as { oldPassword: string; newPassword: string };
      //1- Vérifier si le mot de passe est présent
      if (!oldPassword || !newPassword) {
        return reply.status(400).send({ error: "Old password and new password are required" });
      }
      const authToken = req.cookies.authToken;
      //2- Vérifier si le token d'authentification est présent
      if (!authToken) {
        console.log("[changePassword] unauthorized")
        return reply.status(401).send({ error: "Unauthorized" });
      }      
      // Vérifier le token pour l'authentification
      const decoded = this.app.jwt.verify(authToken, "ACCESS_TOKEN_PUBLIC_KEY") as {id: number};
      const user = await this.UserRepository.getById(decoded.id);
      if (!user) {
        return reply.status(401).send({ error: "Unauthorized" });
      }

      //3- Vérifier si l'utilisateur a déjà un secret pour l'authentification à deux facteurs
      
    } catch (error) {
      console.error("🔴[changePassword] error", error);
      return reply.status(500).send({ error: "Internal server error" });
    }
  }


}
