import { FastifyRequest, FastifyReply } from 'fastify';
import { WaitingPlayers, wsService } from '../services/ws.service';
import { WebSocket } from "@fastify/websocket"
import {  LobyFactory } from '../services/LobyFactory';
import { Player } from '../models/gameClass/Player';

export class WsController {
  constructor() { }
    async ws(socket:WebSocket, req:FastifyRequest) {
        //debug env var
      //  console.log("WebSocket - [WsController]  process.env:", process.env);
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
     //4 - notify all clients for loby
    LobyFactory.broadcastCreatedLobyMessage(wsService.clients);


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
          else if (message.type === "gameCreate" && message.gameId && Array.isArray(message.config.players)) {
           
            if (!id) {
              console.error("⚠️ User not authenticated");
              socket.send(JSON.stringify({ error: "User not authenticated" }));
              return;
            }

          const loby = LobyFactory.createLoby()
          const setPlayers:WaitingPlayers[] = message.config.players.map((player:any,index:number) => ({
          id: null,
          name: player.display_name,
          avatar: player.avatar,
          state: "subscribe",//player.state,
          isInGame: false,
          isIA: player.is_IA,
          userId: player.user?? -1,//@TODO a verifier
        }));
          loby.config.setMode(message.config.mode)
          .setFormat(message.config.format)
          .setType(message.config.type)
          .setIsAllowedRegistration(message.config.isallowedRegistration)
          .setMaxPlayers(message.config.max_players);
          loby.playerManager.setPlayers(setPlayers)
          LobyFactory.broadcastCreatedLobyMessage(wsService.clients);
          socket.send(JSON.stringify({ type:"SUCCESCREATEGAME", lobyId:loby.lobyId }));

            return;
          }
          else if (message.type === "lobyJoined" && message.lobyId) {
            if (!id) {
              console.error("⚠️ User not authenticated");
              socket.send(JSON.stringify({ error: "User not authenticated" }));
              return;
            }
            //le joueur rejoint le loby
            const game = LobyFactory.getLobyById(message.lobyId);
            //1-a :  on recupere la game
            if (!game) {
              console.error("⚠️ Game not found");
             // socket.send(JSON.stringify({ type:"startGame", format:message.format,gameId:message.pongId, state: "notfound" }));
              return;
            }
            //1-b : on verifie si la game type == "remote"
            //anciennement via game.config.<key>
            if (game.config.type !== "remote") {
            //if (game.config.type !== "remote") {
              console.error("⚠️ Game not remote");
              return;
            }
            //1-c : on verifie si la game state == "open"
            if (game.config.state !== "open") {
              console.error("⚠️ Game not open");
              return;
            }
            const waitingPlayers = { 
              userId:id,
              id: id, 
              name: message.name, 
              avatar: message.avatar
              ,state:"joined",
              isInGame:false,
              isIA:false,
              
            };
            const players = new Player(waitingPlayers);
            game.playerManager.addPlayerToWaitingList(players);
            LobyFactory.broadcastCreatedLobyMessage(wsService.clients);

          }
          else if (message.type === "gameJoined" && message.lobyId) {
            //le joueur rejoint la partie,
            //1-a :  on recupere le loby
         const game = LobyFactory.getLobyById(message.lobyId);
            if (!game) {
              console.error("⚠️ Game not found");
             // socket.send(JSON.stringify({ type:"startGame", format:message.format,gameId:message.pongId, state: "notfound" }));
              return;
            }
            //1-b : on verifie si la game type == "remote"
            if (game.config.type !== "remote") {
              console.error("⚠️ Game not remote");
              return;
            }
            //1-c : on verifie si la game state == "open"//@TODO peut etre close registration
            if (game.config.state !== "open") {
              console.error("⚠️ Game not open");
              return;
            }

            if (game.playerManager.addPlayerFromWaitingList(id)) {
              console.log("Player added from waiting list");
               LobyFactory.broadcastCreatedLobyMessage(wsService.clients);
              return;
            }
            console.error("Player not added from waiting list");
            console.log(`Player ${userId} not in waiting list players`);
  
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

export interface Players {
  id?: number;
  type: string;
  is_IA:boolean;
  avatar?:string;
  display_name?:string;
  score:number;
  user:  number | null;//ou User donc u objet
}