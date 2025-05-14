import jwt from "jsonwebtoken"
import fp from 'fastify-plugin';
import  { FastifyPluginAsync, FastifyInstance, FastifyPluginOptions } from 'fastify'

//create class JWT
export class JWT {
  private secret: { private: string, public: string }
  constructor(secret: { private: string, public: string }) {
    this.secret = secret
  }
  sign(payload: any, options?: jwt.SignOptions): string {
    return jwt.sign(payload, this.secret.private, {
      ...options,
      algorithm: "RS256",
    });
  }
  verify(token: string, keyName: "ACCESS_TOKEN_PUBLIC_KEY" | "REFRESH_TOKEN_PUBLIC_KEY"): any {
  //  console.log("🔐 token", this.decode(token,{}))
    const decoded = this.decode(token,{})//jwt.decode(token, { complete: true }) as { [key: string]: any }
    if (!decoded) {
      throw new Error("Invalid token")
    }

          /**
       * debug token info
       * 
       */
    //      const iatDate = new Date(decoded.iat * 1000);
    //      const expDate = new Date(decoded.exp * 1000);
    //      console.log("class JWT::verify()");
    //      console.log("Issued At:", iatDate);
    //      console.log("Expires At:", expDate);
    if (keyName === "ACCESS_TOKEN_PUBLIC_KEY") {
      return jwt.verify(token, this.secret.public, { algorithms: ['RS256'] })
    }else if (keyName === "REFRESH_TOKEN_PUBLIC_KEY") {
      return jwt.verify(token, this.secret.private, { algorithms: ['RS256'] })
    }
  }
  decode(token: string, options: jwt.DecodeOptions): any {
    console.log("🔴🔴class JWT()::decode")
    return jwt.decode(token, options)
  }
  getPulicKey(): string {
    return this.secret.public
  }
}



















import { readFileSync } from 'node:fs'
declare module 'fastify' {
 export interface FastifyRequest {
    jwt: JWT
  }
}
//@TODO cree un volume pour les certs
const jwtPlugin: FastifyPluginAsync = async (fastify: FastifyInstance, options: FastifyPluginOptions): Promise<void> => { 
  const secret = {
    private: readFileSync(`/app/src/certs/privateECDSA.key`, 'utf8'),
    public: readFileSync(`/app/src/certs/publicECDSA.key`, 'utf8')
  }
  const FJWT = new JWT(secret);
  fastify.decorate('jwt', FJWT)
}
export default fp(jwtPlugin)