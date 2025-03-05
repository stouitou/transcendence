import { FastifyInstance } from "fastify";
import { Authenticator } from "@fastify/passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import { oauthCallbackGithub } from "./github";

export function registerGithubStrategy(app: FastifyInstance,fastifyPassport: Authenticator) {
  const clientID = process.env.GITHUB_CLIENT_ID;
  if (!clientID) {
    throw new Error("GITHUB_CLIENT_ID is not defined");
  }
  
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  if (!clientSecret) {
    throw new Error("GITHUB_CLIENT_SECRET is not defined");
  }
  
  const callbackURL = process.env.GITHUB_CALLBACK_URL;
  if (!callbackURL) {
    throw new Error("GITHUB_CALLBACK_URL is not defined");
  }
 
  fastifyPassport.use(
    new GitHubStrategy(
      {
        clientID,
        clientSecret,
        callbackURL
      },
      (accessToken, refreshToken,results, profile, done) => oauthCallbackGithub(app, accessToken, refreshToken, profile, done)
  ));
}