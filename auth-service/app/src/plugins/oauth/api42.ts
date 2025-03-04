import { FastifyInstance } from "fastify";

export const oauthCallbackApi42 = async (app: FastifyInstance, accessToken: string, refreshToken: string, profile: any, done: Function) => {
  //console.log("🔓 42 Api Callback", profile);
  try {
    const user = await  app.authService.createUserWithOauthProvider(profile, "42api");
    //console.log("🔓 42 Api  Callback", user);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
};