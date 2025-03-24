import { FastifyInstance } from "fastify";

export const oauthCallbackGithub = async (app: FastifyInstance, accessToken: string, refreshToken: string, profile: any, done: Function) => {
  try {
    //console.log("🔓 Github OAuth Callback");
    const user = await app.authService.createUserWithOauthProvider(profile, "github");
    //console.log("🔓 Github OAuth Callback", user);
     done(null, user);
  } catch (error) {
    done(error, null);
  }
};