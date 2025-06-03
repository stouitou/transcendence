import { NotFoundError, ValidationError } from "../Errors/errors";
import { AuthProvider } from "../models/AuthProvider.models";
import { User } from "../models/User.models";
import AuthProviderRepository from "../repository/AuthProvider.repository";
import UserRepository from "../repository/User.repository";
import { decrypt } from "../utils/crypto";
import { generateTOTPSecret, verifyTOTP } from "../utils/totp";
import { FastifyInstance } from "fastify";

import qrcode from "qrcode";
export class TwoFactorAuthService {
  private userRepository: UserRepository;
  private authProviderRepository: AuthProviderRepository;

 constructor(private app: FastifyInstance) {
    this.userRepository = new UserRepository();
    this.authProviderRepository = new AuthProviderRepository();
  }
  async generate2FASecret(userId: number) {
    const user = await this.userRepository.getById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const { otpauth } = await this.get2FASecret(user.authProviders[0].provider_id);
    if (!otpauth) {
      return Buffer.from([]); // Retourner une image vide si aucun secret n'est trouvé
    }

    return await qrcode.toBuffer(`${otpauth}`, { type: "png" });
  }
    async get2FASecret(email: string): Promise< {secret:string,otpauth:string| null } > {
	  //1- on verifie si l'utilisateur existe
	  if (!email) throw new ValidationError("Email is required", "email");
	  //2- on verifie si l'utilisateur a deja un secret
	  const user = await this.userRepository.getOneByParams({authProviders:{provider_id:email, provider:"local"}});
	  if (!user) throw new NotFoundError("User not found");
	  //3- on verifie si l'utilisateur a deja activé l'authentification à deux facteurs
	//  if (user.authProviders[0].two_factor_auth_secret) return {secret:user.authProviders[0].two_factor_auth_secret, otpauth:null};
	  //3- on genere le secret de l'authentification à deux facteurs
	  const {secret,otpauth} = generateTOTPSecret(user.authProviders[0].provider_id)//this.app.authService.generateTemp2FAToken(user.authProviders[0].provider_id);
  
	  console.log("[🔐AuthService]:  get2FASecret()  {secret,otpauth} = generateTOTPSecret : ",secret,otpauth)
	  //4- on enregistre le secret dans la base de données
	   const userUpdated = await  this.authProviderRepository.set2FASecret(user.authProviders[0].id!, secret);
  
	   console.log("🔐AuthService:  get2FASecret()  userWithAuthProvider updated : ",userUpdated)
	  return {secret,otpauth};
	}
	 async generate2FAEmailCode(user: User,isForce:boolean=false): Promise<{ otp:string, otpExpiration:Date }> {
		//1- on verifie si l'utilisateur existe
		if (!user) throw new NotFoundError("User not found");
		console.log("🔐AuthService:  generate2FAEmailCode()  user : ",user)
		//2- on verifie si l'utilisateur a activé l'authentification à deux facteurs
		if (!isForce && !user.authProviders[0].two_factor_auth) throw new Error("[generate2FAEmailCode] Two factor auth not enabled");
		//3- on verifie si l'utilisateur a deja un code de verification
		if (user.authProviders[0].otp && user.authProviders[0].otp !== "") {
			//4- on verifie si le code de verification est encore valide
			const now = new Date();
			const expiration = new Date(user.authProviders[0].otpExpiration?? 0);
			if (now < expiration) {
			  //5- on retourne le code de verification
			  const otpDecrypt = decrypt(user.authProviders[0].otp);
			  return { otp:otpDecrypt, otpExpiration: expiration };
			}
		}
			  //6- on genere un nouveau code de verification
		  const otp = Math.floor(100000 + Math.random() * 900000).toString();
		  const otpExpiration = new Date();
		  otpExpiration.setMinutes(otpExpiration.getMinutes() + 5);
		  //7- on enregistre le code de verification dans la base de donnees
		  const userUpdated = await this.authProviderRepository.set2FAEmailCode(user.authProviders[0].id!, otp, otpExpiration);
		  console.log("🔐AuthService:  generate2FAEmailCode()  userWithAuthProvider updated : ",userUpdated)
		  return { otp, otpExpiration};
	  }

/* 	   async verify2FACode(authProviders: AuthProvider|null, code: string): Promise<boolean> {
	   } */
	


	  async verify2FAEmailCode(authProviders: AuthProvider|null, code: string,isForce:boolean=false): Promise<boolean> {
		//1- on verifie si l'utilisateur existe
		if (!authProviders) throw new NotFoundError("User not found");
		//2- on verifie si l'utilisateur a activé l'authentification à deux facteurs
		if (!isForce && !authProviders.two_factor_auth) throw new ValidationError("[verify2FAEmailCode]Two factor auth not enabled", "two_factor_auth");
		//3- on verifie si l'utilisateur a deja un code de verification
		if (!authProviders.otp) throw new NotFoundError("No OTP code found");
		//4- on verifie si le code de verification est encore valide
		const now = new Date();
		const expiration = new Date(authProviders.otpExpiration?? 0);
		if (now > expiration) throw new ValidationError("OTP code expired", "otp");
		//5- on verifie le code de verification
		const isValid = decrypt(authProviders.otp) === code;
		//on reset le code de verification
		await this.authProviderRepository.set2FAEmailCode(authProviders.id!, "", new Date());// on reset le code de verification
		return isValid;
	  }

	  async verify2FATOTPCode(authProviders: AuthProvider|null, code: string): Promise<boolean> {
		//1- on verifie si l'utilisateur existe
		if (!authProviders) throw new NotFoundError("User not found");
		//2- on verifie si l'utilisateur a activé l'authentification à deux facteurs
		if (!authProviders.two_factor_auth) throw new ValidationError("[verify2FATOTPCode] Two factor auth not enabled", "two_factor_auth");
		//3- on verifie si l'utilisateur a deja un code de verification
		console.log("🔐AuthService:  verify2FATOTPCode()  authProviders.two_factor_auth_secret : ",authProviders.two_factor_auth_secret)
		if (!authProviders.two_factor_auth_secret) throw new ValidationError("No two_factor_auth_secret code found", "two_factor_auth_secret");
			//4- on verifie le code de verification
		const isValid =verifyTOTP(code, authProviders.two_factor_auth_secret);
		return isValid;
	  }


  async verify2FACode(userEmail: string, method: "totp" | "email", code: string,isForce:boolean=false) {
    const authProvider = await this.authProviderRepository.getOneByParams({
      provider_id: userEmail,
      provider: "local",
    });
    if (!authProvider) {
		console.log("🔴 verify2FACode user not found", userEmail,method,isForce)
      throw new NotFoundError("User not found");
    }

    if (method === "totp") {     
      return await this.verify2FATOTPCode(authProvider, code);
    } else if (method === "email" || isForce) {
      return await this.verify2FAEmailCode(authProvider, code,isForce);
    }
    return false;
  }

  async enable2FA(userEmail: string,method: "totp" | "email") {
    const authProvider = await this.authProviderRepository.getOneByParams({
      provider_id: userEmail,
      provider: "local",
    });

    if (!authProvider) {
      throw new NotFoundError("User not found");
    }

    // Activez le 2FA pour l'utilisateur
	const update = {
		id : authProvider.id!,
		two_factor_auth : true,
		two_factor_auth_method : method,
		otp : null,
		otpExpiration : null,
	}
	console.log("🔐AuthService:  enable2FA()  userWithAuthProvider")
    await this.authProviderRepository.update(update);
	console.log("🔐AuthService:  enable2FA()  success")
  }

  async disable2FA(userEmail: string) {
    const authProvider = await this.authProviderRepository.getOneByParams({
      provider_id: userEmail,
      provider: "local",
    });

    if (!authProvider) {
      throw new ValidationError("User not found", "email");
    }

    // Désactivez le 2FA pour l'utilisateur
    	const update = {
		id : authProvider.id,
		two_factor_auth : false,
		two_factor_auth_method : "email",
		otp : null,
		otpExpiration : null,
	}
    await this.authProviderRepository.update(update);
  }
}