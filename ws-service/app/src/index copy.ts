
import Fastify,{ FastifyRequest } from "fastify";
//import { server } from "./server"; 
/* import  {registerPlugins}  from "./plugins/fastifyRegisterPlugins"; */
import fastifyWebsocket, {WebSocket} from "@fastify/websocket";
//import userRoutes from "./routes/user.routes";

const fastify = Fastify({logger: false});
fastify.register(fastifyWebsocket/* , {
  options: {
    clientTracking: true
  } 
}*/);

 const connectedClients = new Set();
export const sendGeneralNotification = function (type, payload) {
  fastify.websocketServer.clients.forEach((client) => {
    client.send(JSON.stringify({ type, payload }));
  });
}; /* */

/* fastify.websocketServer.on("connection", (client) => {
    connectedClients.add(client);
     
 });*/

 fastify.register(async function(fastify) {
fastify.get('/ws', { websocket: true }, (connection, req) =>{
  console.log('req cookie',req.cookies)
  // bound to fastify server
  console.log('Client connected')
    connectedClients.add(connection);
    connectedClients.forEach((client) => {
      console.log('Client connected')
      client.send(JSON.stringify({ client:connectedClients.size, payload:"ok" }));
  });
  connection.on("message", (message) => {
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

fastify.get('/ws/broadcast', async (req, reply) => {
  connectedClients.forEach((client) => {
      console.log('Client connected')
      client.send(JSON.stringify({ client:connectedClients.size, payload:"ok" }));
  });
  return 'Messages sent';
});

});

const start = async () => {
  try {
    await fastify.listen({ port: 3000,host:"0.0.0.0" })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()