import { FastifyRequest, FastifyReply } from 'fastify';
import { wsService } from '@src/services/ws.service';
import { WebSocket } from "@fastify/websocket"
import { console } from 'inspector';
import gameService from '@src/services/ws.game.services';
/* // Game loop — tourne 60 fois par seconde
setInterval(() => {
  //recuperer chaque game
  const games = gameService.getGames();
  //boucle sur chaque game
  games.forEach((game) => {
    gameService.updateGame(game);
    broadcastGameState(game.id);

  });
  
}, 1000 /60); // 60 FPS */

interface JoinPongPongMessage {
  type: "joinPong"
  pongId: string;
  format?: string; // "classic" | "tournament"
}
export class WsGameController {
  constructor() { }
    async ws(socket:WebSocket, req:FastifyRequest) {
     // console.log('req headers',req.headers)
      //1- get userId from cookie
      //const userId = req.authenticatedUser?.name || `Guest-${Date.now()}`;
      const id = req.authenticatedUser?.id || null;
      const name = req.authenticatedUser?.name || null;
      if(!id) {
        console.error("⚠️ User not authenticated");
        socket.send(JSON.stringify({ error: "User not authenticated" }));
        return;
      }
      const userId = req.authenticatedUser?.id?`User-${req.authenticatedUser?.id}` : `Guest-${Date.now()}`;
      
     //2- add client to gameClients Socket list
     gameService.addClientSocket(id.toString(), socket);
      //3- send welcome message
      socket.send(JSON.stringify({ type:"welcometogame", userId:`${id}`, name:`${name}`, message: "Welcome to the game" }));
      socket.send(JSON.stringify({ type:"me", userId:`${id}`, name:`${name}` }));




      /**
       * ACTIONS
       */
      //4- handle message
      //4- handle message
      socket.on("message", (data:any) => {
        console.log("WebSocket game - message:", data.toString());
        /* wsService.handleMessage(userId, message); */
        try {
  
          const message = JSON.parse(data.toString());
          console.log("message",message);
          if (typeof message !== "object" || message === null) {
            console.error("⚠️ Message invalide reçu :", message);
            socket.send(JSON.stringify({ error: "Message invalide" }));
            return;
        }
        // 2️⃣ Si l'utilisateur envoie un message de ping, on répond pong
          if (message.type === "ping") {
            socket.send(JSON.stringify({ type: "pong" }));
            return;
          }

          switch (message.type) {
            case "joinPong":
              console.log("joinPong ",message as {type:"joinPong",format:string, pongId:string});//format: "classic" | "tournament"
              //create or join game
              HandleMessage.handleMessageJoinPong(`${id}`, message as JoinPongPongMessage);
              const game = gameService.getGameState(message.pongId);
              if (!game) {
                console.error("Game not found");

              socket.send(JSON.stringify({ type:"startGame", format:message.format,gameId:message.pongId, state: "notfound" }));
                return;
              }
              socket.send(JSON.stringify({ type:"startGame", format:"classic", state: game }));
              break;
              //send game state to all players

            default:
              socket.send(JSON.stringify({ type:"default", data: message }));
             
            }
          
      } catch  (error) {
          console.error("🟥 WsRoutes socket.on message: error ",error)

          socket.send(JSON.stringify({ error: "Message invalide", message: error.message, data:data.toString() }));
          
      }
      });

      //5- handle close
      socket.on("close", () => {
        console.log("WebSocket - close");
        wsService.removeSocket(socket);
        wsService.notifyIsOnline();
      });
    }

    async broadcastMessage(request: FastifyRequest, reply: FastifyReply) {
     /*  const { message } = request.body as { message: string }; */
     const message = `client size: ${wsService.clients.size}, Hello from broadcast`;
      wsService.broadcast(message);
      return reply.send({ message: 'Message broadcasted' });
    }
}



class HandleMessage {
  constructor() { }
  static handleMessageJoinPong(id: string, data: JoinPongPongMessage) {
    console.log(`📩 Message reçu de ${id} :`, data.pongId,data.format, data.type);
   
    gameService.sendToClient(id, JSON.stringify({ type: "data", data: wsService.getGamebyId(Number(data.pongId)) }));
    // Handle the message here
  }
 static  handleMessageJoinGame(userId: string, data: {type:"joinGame",gameId:string}) {
    console.log(`🔒 User ${userId} joined game ${data.gameId}`);
    // Handle the message here
  }
}