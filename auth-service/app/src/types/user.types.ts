import { Static } from '@sinclair/typebox';
import { AuthSchema } from '../schemas/auth.schema';

// 🔹 Définition des types basés sur le schéma
export type RegisterBody = Static<typeof AuthSchema.register.body>;
export type RegisterResponse = Static<typeof AuthSchema.register.response[201]>;

export type LoginBody = Static<typeof AuthSchema.login.body>;
export type LoginResponse = Static<typeof AuthSchema.login.response[200]>;


// 🔹 Définition d'un type User générique (peut être utilisé en dehors du schéma)
export type User = {
  id:        number;
  email?:     string;
  name?:      string;
  avatar?:    string;
  password?:  string;
  providers?:  AutProvider[];
  created_at: Date;
  updated_at: Date;
};

export type AutProvider = {
  id: number;
  provider: string;
  providerId: string;
  userId: string;
  user: User;
}