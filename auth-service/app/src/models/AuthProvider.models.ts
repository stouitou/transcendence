export interface AuthProvider  {
  id?: number;
  provider: string; // "local" | "google" | "github"
  provider_id: string; //"test@mail.com" | "123456789" | "123456789"
  user_id?:number; //ma clé étrangère
  password?: string; //hash du mot de passe
  two_factor_auth?: boolean; //activation de l'authentification à deux facteurs
  two_factor_auth_secret?: string|null; //
  two_factor_auth_method?: string; //'totp' | 'email';
  otpExpiration?: Date|null; // date d'expiration du code de vérification par email
  otp?: string|null; // code de vérification par email
};

export class AuthProvider {
	constructor(authProvider:any) {
    this.id = authProvider.id ?? 0;
    this.provider = authProvider.provider ?? "";
    this.provider_id = authProvider.provider_id ?? "";
    this.user_id = authProvider.user_id ?? 0;
    this.password = authProvider.password ?? "";
    this.two_factor_auth = authProvider.two_factor_auth ?? false;
    this.two_factor_auth_secret = authProvider.two_factor_auth_secret ?? null;
    this.two_factor_auth_method = authProvider.two_factor_auth_method ?? null;
    this.otpExpiration = authProvider.otpExpiration ?? null;
    this.otp = authProvider.otp ?? null;
  }
  id?: number;
  provider: string; // "local" | "google" | "github"
  provider_id: string; //"
  user_id?:number; //ma clé étrangère
  password?: string; //hash du mot de passe
  two_factor_auth?: boolean; //activation de l'authentification à deux facteurs
  two_factor_auth_secret?: string|null; //
  two_factor_auth_method?: string; //'totp' | 'email';
  otpExpiration?: Date|null; // date d'expiration du code de vérification par email
  otp?: string|null; // code de vérification par email
}
