export interface AuthProvider  {
  id?: number;
  provider: string; // "local" | "google" | "github"
  provider_id: string; //"test@mail.com" | "123456789" | "123456789"
  user_id?:number; //ma clé étrangère
  password?: string; //hash du mot de passe
};

export class AuthProvider {
	constructor(authProvider:any) {
    this.id = authProvider.id ?? 0;
    this.provider = authProvider.provider ?? "";
    this.provider_id = authProvider.provider_id ?? "";
    this.user_id = authProvider.user_id ?? 0;
    this.password = authProvider.password ?? "";
  }
  id?: number;
  provider: string; // "local" | "google" | "github"
  provider_id: string; //"
  user_id?:number; //ma clé étrangère
  password?: string; //hash du mot de passe
}
