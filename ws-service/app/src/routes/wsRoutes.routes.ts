import { FastifyInstance } from "fastify";
import { WebSocket } from "@fastify/websocket"

import { FastifyRequest } from "fastify/types/request";
import  {WsController}  from "../controllers/ws.controller";
import  {WsGameController}  from "../controllers/ws.game.controller";



//@TODO pour tester les hooks

async function wsRoutes(app: FastifyInstance) {
  const wsController = new WsController();
  const wsGameController = new WsGameController();


  app.addHook('onRequest', async (request, reply) => {
    const authToken = request.cookies.authToken;
    if (authToken && !request.headers.authorization) {
      request.headers.authorization = `Bearer ${authToken}`;
    }
    //1- Récupération du token dans le header  
    const authHeader = request.headers.authorization;
  //  const authHeader = "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywibmFtZSI6IiIsInJvbGUiOiJ1c2VyIiwibGV2ZWwiOjEsImF2YXRhciI6IiIsImNyZWF0ZWRfYXQiOiIyMDI1LTAzLTE0VDExOjQ5OjIwLjQ0MVoiLCJ1cGRhdGVkX2F0IjoiMjAyNS0wMy0xNFQxMTo0OToyMC40NDFaIiwiaWF0IjoxNzQxOTU5NjMwLCJleHAiOjE3NDE5NTk2OTB9.aE9IIldOzuRFNna9qDBmgOmvaBbDu1qYNkImLDy2-_rkllXfAbW0ejqrJyneJ1GlbojmBOFdhkz63dlYTI4zZ18XJzVKijnypuj_Tf3DWcrrbgUUQXvKhreFIeoo7a9kLYFsa4TjdYXOeV_pHfcdH--l7s7PAnXp0kRrHCwc605N82qDTzyAISyYvieL5cfEWak4lwIDLhpzpqdQw0k07Ois6U4xeR6CMy4Qc6IpKHk1h5Jy4LDjIy7dnwvBwldAeeoXuKRiwGhPZ1WFWhYwqh7y9WTtSNrObi7evTntdVwb8GxRwLHAqMFoGcjjWwjBzEPNqOUFFERtTaNFr-LXXYHIbpzWQQ2hN7D_8QUh26cy47PniueBZ4KeXGCF0A0IrqdQ0FRMZdeyij4kAELP8OcDlV9yOEqYvOf45wSh4mRZzfbrY14Iiqw9aEYwNtQmRRIT85Elm8JferFXil3nlTsJGTKpMjCdskOAMLoFYt3RK6OZNKmrMdWnBnllgqgEPlBR8ZJ72bSUyCYJF6BKFTSQLw0cC8Tff6WfGVbpbGRpDB9grvqBzVIp_LZxERvRSFB2IpTgfd9fOP-3HwHobQzOPVwbMcXWBaFVnvJxuJWiOMnpUgEBhOP89zF9nhabEXEf3aUsG9lrrm1eno0r6RQWmsSJR9jVzl9ii5p3Zs8";
  //  console.log("🔗 userRoutes onRequest authHeader : ",authHeader)
    try {
      //2- Vérification de la présence du token
      if (!authHeader) {
        //2-1 Si le token n'est pas présent, utilisateur non authentifié
        request.authenticatedUser = undefined;
        return 
      }

      //3- Appel du service d'authentification pour vérifier le token
   //   const res = await fetch('http://auth_services:3000/internal/auth/me', {
      const res = await fetch('http://user-management-service:3000/api/users/me', {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
          'cookie': request.headers.cookie?? "",
        }
      });
      //4- Vérification de la réponse
      const data = await res.json();
      //4-1 Si la réponse n'est pas ok, utilisateur non authentifié
      if (!res.ok) {
        console.error("not ok")
        request.authenticatedUser = undefined;
        return 
      }
      //4-2 Si la réponse est ok, on verifie si l'utilisateur a des authProviders
      if (data && data.authProviders) {//@TODO : à revoir 
        //4-2-1 Si l'utilisateur a des authProviders, on les
        //supprime pour des raisons de sécurité
       delete data.authProviders;
      }
      //5- Ajout de l'utilisateur " authentifié, et netoyé" à la requête
      request.authenticatedUser = data
    } catch (error) {
      console.error("🟥 WsRoutes onRequest error",error)
      return reply.code(error.status).send({ error: error.message });
    }
  })

  app.get('/', { websocket: true }, wsController.ws);
  app.get('/wspong', { websocket: true }, wsGameController.ws);
  app.get('/broadcast', wsController.broadcastMessage);
  
}




 const connectedClients:Set<WebSocket> = new Set();
/* export const sendGeneralNotification = function (type, payload) {
  fastify.websocketServer.clients.forEach((client) => {
    client.send(JSON.stringify({ type, payload }));
  });
}; */
async function wsRoutes2(app: FastifyInstance) {
  app.get('/', { websocket: true }, (connection:WebSocket, req:FastifyRequest) =>{
    console.log('req headers',req.headers)
    console.log('req cookie',req.cookies)


    // bound to fastify server
    console.log('Client connected')
      connectedClients.add(connection);
      connectedClients.forEach((client) => {
        console.log('Client connected')
        client.send(JSON.stringify({ client:connectedClients.size, payload:"ok" }));
    });
    connection.on("message", (message:any) => {
      console.log("WebSocket - message:", message.toString());
      connectedClients.forEach((client) => {
        console.log('Client connected')
        client.send(JSON.stringify({ client:connectedClients.size, payload:"ok", message:message.toString() }));
    });
    });
    
    connection.on("close", () => {
      console.log("WebSocket - close");
      connectedClients.delete(connection);
      connectedClients.forEach((client) => {
        console.log('Client connected')
        client.send(JSON.stringify({ client:connectedClients.size, payload:"ok" }));
    });
    });
  connection.send('hi from server');
   /*  connection.socket.on("message", (msg) => {
      const ack = JSON.stringify({
        REQUEST: `${msg}`,
        SERVER_TIMESTAMP: Date.now(),
      });
      connection.socket.send(ack);
    }); */
   // 
   /*  console.log('Client connected')
    connection.socket.on("message", (message) => {
      console.log("WebSocket - message:", message.toString());
    });
  
    connection.socket.on("close", () => {
      console.log("WebSocket - close");
      connectedClients.delete(connection.socket);
    });
  
    connection.socket.on("error", (error) => {
      console.log("WebSocket - error:", error);
    });
  
    connection.socket.on("end", () => {
      console.log("Web Socket - end");
     // connection.socket.end();
    }
    );
    connection.socket.on("ping", () => {
      console.log("Web Socket - ping");
    }
    );
    connection.socket.on("pong", () => {
      console.log("Web Socket - pong");
    }); */
  })
  app.get('/broadcast', async (req, reply) => {
    connectedClients.forEach((client) => {
        console.log('Client connected')
        client.send(JSON.stringify({ client:connectedClients.size, payload:"ok" }));
    });
    return 'Messages sent';
  });
}

export default wsRoutes;
