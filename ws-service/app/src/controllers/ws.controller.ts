import { FastifyRequest, FastifyReply } from 'fastify';
import { wsService } from '@src/services/ws.service';
import { WebSocket } from "@fastify/websocket"
import { console } from 'inspector';


export class WsController {
  constructor() { }
    async ws(socket:WebSocket, req:FastifyRequest) {
      console.log('req headers',req.headers)
      //1- get userId from cookie
      //const userId = req.authenticatedUser?.name || `Guest-${Date.now()}`;
      const id = req.authenticatedUser?.id || null;
      const userId = req.authenticatedUser?.id?`User-${req.authenticatedUser?.id}` : `Guest-${Date.now()}`;
      
      //2- add client to wsService
      wsService.addClient(userId, socket);
      //3- send welcome message
      socket.send(JSON.stringify({ type:"welcome", client:wsService.clients.size, userId:`${userId}` }));

      //4- notify all clients      
     wsService.notifyIsOnline();
     wsService.notifyIsGames();



      /**
       * ACTIONS
       */
      //4- handle message
      socket.on("message", (data:any) => {
        console.log("WebSocket - message:", data.toString());
        /* wsService.handleMessage(userId, message); */
        try {
  
          const message = JSON.parse(data.toString());
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
           // 3️⃣ Si l'utilisateur envoie un message de connexion, on l'associe
          if (message.type === "authenticate" && message.userId) {
              wsService.updateClientId(userId, `User-${req.authenticatedUser?.id}`);//@TODO a ameliorer
          } 
          // 4️⃣ Si l'utilisateur envoie un message de type "private", on l'envoie à un utilisateur spécifique
          //ex : wscat -c wss://localhost:4433/ws -n 
          // {"type":"private","to":"User-1","message":"Hello"}
          else if (message.type === "private" && message.to) {
            console.log("🔒 Message privé de", userId, "à", message.to, ":", message.message);
              wsService.sendToClient(message.to, JSON.stringify({ type: "private", from: userId, message: message.message }));
          }
          else if (message.type === "gameCreate" && message.gameId) {
            const gameData = {gameId:message.gameId, state : "open", waitingPlayers:[{userId,id: id, name: message.name, avatar: message.avatar,state:"subscribe"}] };
            wsService.addGame(message.gameId, gameData);
            wsService.notifyIsGames();

          }
          else if (message.type === "gameJoined" && message.gameId) {
           /* { type: "gameJoined",  gameId: dataID , 
            waitingPlayers: {id: this.state.user?.id, name: this.state.user?.name, avatar: this.state.user?.avatar},
            state: "joined" }
            */
            const waitingPlayers = { userId,id: id, name: message.name, avatar: message.avatar,state:message.state };
            wsService.addWaitingPlayersToGame(Number(message.gameId), waitingPlayers);
            console.log("🔒games ",wsService.getGames());
            wsService.notifyIsGames();
          //  wsService.broadcast(JSON.stringify({ ...message  }));


          }
          else if (message.type === "logout"&& message.userId) {
            console.log("🔒logout from ", message.userId);
          //  wsService.removeClient(userId);
            const newUserId = `Guest-${Date.now()}`;
            wsService.updateClientId(message.userId, newUserId);
            wsService.notifyIsOnline();
            socket.send(JSON.stringify({ type:"welcome", client:wsService.clients.size, userId:`${newUserId}` }));

          }
          else if (message.type === "login" && message.userId && message.id) {
            console.log("🔒new action login user id: ", message.id);
            console.log("🔒 from ", message.userId);
          //  wsService.removeClient(userId);
            const newUserId = `User-${message.id}`;
            wsService.updateClientId(message.userId, newUserId);
            socket.send(JSON.stringify({ type:"welcome", client:wsService.clients.size, userId:`${newUserId}` }));
            wsService.notifyIsOnline();

          }
          else {
              wsService.handleMessage(userId, data);
          }
      } catch (error) {
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


