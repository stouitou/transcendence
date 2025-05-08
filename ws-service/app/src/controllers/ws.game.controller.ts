import { FastifyRequest, FastifyReply } from 'fastify';
import { wsService } from '../services/ws.service';
import { WebSocket } from "@fastify/websocket"
import gameService from '../services/ws.game.services';
import { LobyFactory } from '../services/LobyFactory';
import { LobbyPhase } from '../types/gameUtils.type';

export class WsGameController {
  constructor() { }
    async ws(socket:WebSocket, req:FastifyRequest) {
      //1- get userId from cookie
      //const userId = req.authenticatedUser?.name || `Guest-${Date.now()}`;
      const id = req.authenticatedUser?.id || null;
      const name = req.authenticatedUser?.name || null;
      if(!id) {
        console.error("⚠️ User not authenticated");
        socket.send(JSON.stringify({ error: "User not authenticated" }));
        return;
      }

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
             const loby = LobyFactory.getLobyById(message.pongId);
              if (!loby) {
                console.error("[joinPong] Loby not found");
                socket.send(JSON.stringify({ type:"startGame", format:message.format,pongId:message.pongId, state: "notfound" }));
                return;
              }
              loby.socketManager.updateSocket(id,socket);
              loby.playerManager.setPlayerIsInGame(id,true);//@TODO doublon?
              loby.start(id);
              break;
              //case "move": seulement pour le mode REMOTE
              case "move":
                console.log(`id :${id} move`,message);
                //@TODO a definir le roundNumber
                const gameMove =  LobyFactory.getLobyById(message.lobyId)?.matchManager.getCurrentMatch(message.pongId)//getMatch(message.pongId,0)
                if (!gameMove) {
                  console.error("[move] Loby not found");
                  socket.send(JSON.stringify({ type:"startGame", format:message.format,gameId:message.pongId, state: "notfound" }));
                  return;
                }
                gameMove.playerManager.updatePlayerAction(message.index,message.direction );
              break;
              //Local game Phase Manager
              case "UPDATESCORE":
                console.log(`id :${id} UPDATESCORE`,message);
                const LobyLocal =  LobyFactory.getLobyById(message.lobyId)
                if (!LobyLocal) {
                  console.error("[UPDATESCORE + loby] Loby not found");
                  socket.send(JSON.stringify({ type:"startGame", format:message.format,gameId:message.pongId, state: "notfound" }));
                  return;
                }
                const game = LobyLocal.matchManager.getCurrentMatch(message.gameId)   //getMatch(message.gameId)
                if (!game) {
                  console.error("[UPDATESCORE + game] game non found in Loby");
                  socket.send(JSON.stringify({ type:"startGame", format:message.format,gameId:message.gameId, state: "notfound" }));
                  return;
                }
                game.playerManager.setLocalScore(message.data);
                game.stop();
               // LobyLocal.phaseManager.setPhase(LobbyPhase.SavingResults)
              //  game.observer.isFinished = true;
                break
                //game.playerManager.updatePlayerScore(id,message.score);
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
        console.log("WebSocket - close",id);
        //le client a fermé sa fenetre de jeu
        //1- recuperer l'id du client
        const clientId = gameService.getClienttIdBySocket(socket);
        if (!clientId) {
          console.error("⚠️ Client non trouvé");
          return;
        }
        gameService.removeClientSocket(socket);
        //2- dans ses partie en cours, le joueur est deconnecté
/*         console.log("clientId",clientId);
        //console.log(" setPlayerStateLeft(clientId)",setPlayerStateLeft(clientId));
        const game = getMatchBySocket(socket);
        if (!game) {
          console.error("⚠️ Game not found");
          return;
        }
        game.setPlayerState("left", id);
        // retier le client de la liste des clients
        gameService.removeClientSocket(socket);
        if (game.players.every((player) => player.state === "left")) {
             removeMatch(game.id);
          console.log("Game removed");
        } */
      //  wsService.notifyIsOnline();
      });
    }

    async broadcastMessage(request: FastifyRequest, reply: FastifyReply) {
     /*  const { message } = request.body as { message: string }; */
     const message = `client size: ${wsService.clients.size}, Hello from broadcast`;
      wsService.broadcast(message);
      return reply.send({ message: 'Message broadcasted' });
    }
}
