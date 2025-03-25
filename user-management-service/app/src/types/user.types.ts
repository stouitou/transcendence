import { Static } from '@sinclair/typebox';
import { UserSchema } from '../schemas/user.schema';

// 🔹 Définition des types basés sur le schéma
//export type CreateUserBody = Static<typeof UserSchema.createUser.body>;
//export type CreateUserResponse = Static<typeof UserSchema.createUser.response[201]>;
/* export type GetUserByIdParams = Static<typeof UserSchema.getUserById.params>;
export type GetUserByIdResponse = Static<typeof UserSchema.getUserById.response[200]>;
export type GetUsersResponse = Static<typeof UserSchema.getUsers.response[200]>;
 */
// 🔹 Définition d'un type User générique (peut être utilisé en dehors du schéma)
export type User = {
  id:        number;
  email?:     string;
  name?:      string;
  avatar?:    string;
  password?:  string;
  providers?:  AutProvider[];
  createdAt: Date;
  updatedAt: Date;
};

export type AutProvider = {
  id: string;
  provider: string;
  providerId: string;
  userId: number;
  user: User;
}