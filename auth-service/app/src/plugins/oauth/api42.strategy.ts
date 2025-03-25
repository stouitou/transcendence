import { FastifyInstance } from "fastify";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { oauthCallbackApi42 } from "./api42";
import { Authenticator } from "@fastify/passport";

export function registerGoogleStrategy(app: FastifyInstance,fastifyPassport: Authenticator) {
  const clientID = process.env.API42_CLIENT_ID;
  if (!clientID) {
    throw new Error("API42_CLIENT_ID is not defined");
  }
  
  const clientSecret = process.env.API42_CLIENT_SECRET;
  if (!clientSecret) {
    throw new Error("API42_CLIENT_SECRET is not defined");
  }
  
  const callbackURL = process.env.API42_CALLBACK_URL;
  if (!callbackURL) {
    throw new Error("API42_CALLBACK_URL is not defined");
  }

  fastifyPassport.use(
    new GoogleStrategy(
      {
        clientID,
        clientSecret,
        callbackURL,
      },
      (accessToken, refreshToken, profile, done) => oauthCallbackApi42(app, accessToken, refreshToken, profile, done)
  ));
}