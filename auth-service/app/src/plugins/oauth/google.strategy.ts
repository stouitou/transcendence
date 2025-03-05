import { FastifyInstance } from "fastify";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { oauthCallbackGoogle } from "./google";
import { Authenticator } from "@fastify/passport";

export function registerGoogleStrategy(app: FastifyInstance,fastifyPassport: Authenticator) {
  const clientID = process.env.GOOGLE_CLIENT_ID;
  if (!clientID) {
    throw new Error("GOOGLE_CLIENT_ID is not defined");
  }
  
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientSecret) {
    throw new Error("GOOGLE_CLIENT_SECRET is not defined");
  }
  
  const callbackURL = process.env.GOOGLE_CALLBACK_URL;
  if (!callbackURL) {
    throw new Error("GOOGLE_CALLBACK_URL is not defined");
  }

  fastifyPassport.use(
    new GoogleStrategy(
      {
        clientID,
        clientSecret,
        callbackURL,
      },
      (accessToken, refreshToken, profile, done) => oauthCallbackGoogle(app, accessToken, refreshToken, profile, done)
  ));
}