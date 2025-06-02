import { FastifyInstance } from "fastify";

// exemple info ; ne sera pas forcement implementé
export async function managerRoutes(app: FastifyInstance) {

 
    app.get("/login",{schema:{description:'login',tags:['Manager']}}, async (request, reply) => {
      return { message: "Not implemented yet" };
    }); 
    app.get("/register",{schema:{description:'get JWT Token',tags:['Manager']}}, async (request, reply) => {
      return { message: "Not implemented yet" };
    });
    app.get("/refresh",{schema:{description:'refresh access JWT Token',tags:['Manager']}}, async (request, reply) => {
      return { message: "Not implemented yet" };
    });
    app.get("/logout",{schema:{description:'revoke JWT Token',tags:['Manager']}}, async (request, reply) => {
      return { message: "Not implemented yet" };
    });
    app.get("/logoutAll",{schema:{description:'revoke ALL JWT Token',tags:['Manager']}}, async (request, reply) => {
      return { message: "Not implemented yet" };
    });
    app.get("/me",{schema:{description:'get Manager profile',tags:['Manager']}}, async (request, reply) => {
      return { message: "Not implemented yet" };
    });
    app.get("/me/update",{schema:{description:'update Manager profile',tags:['Manager']}}, async (request, reply) => {
      return { message: "Not implemented yet" };
    });
  }
