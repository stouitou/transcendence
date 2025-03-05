import { FastifyInstance } from "fastify";

export const oauthCallbackGoogle = async (app: FastifyInstance, accessToken: string, refreshToken: string, profile: any, done: Function) => {
  //console.log("🔓 Google OAuth Callback", profile);
  try {
    const user = await  app.authService.createUserWithOauthProvider(profile, "google");
    //console.log("🔓 Google OAuth Callback", user);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
};