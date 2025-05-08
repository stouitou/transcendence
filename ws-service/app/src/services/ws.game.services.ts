
import { WebSocket } from "@fastify/websocket"
import {  WebbSocketGame } from "./ws.service";
export interface Player {
    id: number;
    name: string;
    position: { x: number; y: number ,up:boolean,down:boolean,speed:number, side:string};
    // Autres attributs du joueur
  }
  export  interface Pong {
    clientWidth: number;//
    clientHeight: number;
    ballWith: number;
    ballHeight: number;
    barWidth: number;
    barHeight: number;
  }
  export interface Ball {
    position: {
      top: number;
      left: number;
    };
    controls: {
      ballUp: boolean;
      ballDown: boolean;
      ballLeft: boolean;
      ballRight: boolean;
      ballSpeed: number;
    };
  }
  export interface GameState {
    id: string;
    players: Player[];
    ball: Ball;//{ x: number; y: number };
    pong: Pong;
    clients : Map<string, WebSocket>;
    // Autres attributs de l'état du jeu
  }
  
  // models/GameAction.ts
  export interface GameAction {
    playerId: number;
    type: 'MOVE' | 'OTHER_ACTION';
    payload: any; // Par exemple, { x: number; y: number } pour un mouvement
  }

/* // services/GameService.ts
import { GameState, Player } from '../models/GameState';
import { GameAction } from '../models/GameAction';
 */
const games =new Map<number, WebbSocketGame>();
const gameClients =new Map<string, WebSocket>();
export const GameService = {

/*   broadcastAll: (message: string) => {
    gameClients.forEach((client) => {
      client.send(message);
    });
  },
 */
  //oui
  addClientSocket: (clientId: string, socket: WebSocket) => {
    gameClients.set(clientId, socket);
    console.log(`✅ Utilisateur gameClients ${clientId} connecté`);
  },
/*   removeClientSocketById: (gameId: string) => {
    gameClients.delete(gameId);
    console.log(`❌ Utilisateur gameClients ${gameId} déconnecté`);
  }, */
  //oui
  removeClientSocket: (socket: WebSocket) => {
    gameClients.forEach((value, key) => {
      if (value === socket) {
        gameClients.delete(key);
        console.log(`❌ Utilisateur ${key} déconnecté`);
      }
    });
  },
  //oui
  getClienttIdBySocket: (socket: WebSocket) => {
    for (const [key, value] of gameClients.entries()) {
        if (value === socket) {
            return key; // Retourner la clé si le socket correspond
        }
    }
    return null; // Retourner null si aucune correspondance n'est trouvée
},
/*   getGamesByClientId: (clientId: string) => {
    const gamesArray: WebbSocketGame[] = [];
    games.forEach((game) => {
      const player = game.config.players.find((player) => player.userId === clientId);
      if (player) {
        gamesArray.push(game);
      }
    });
    return gamesArray;
  },
   */
  
/*   setPlayerState: (gameId: number, playerId: number,state:"waiting" | "playing" | "finished" | "joined" | "left" | "cancelled") => {
    const game = games.get(gameId);
    if (!game) {
      console.error(`Le jeu avec l'ID ${gameId} n'existe pas.`);
      //verification de tout les jeu existant
      const allGames = games.keys();
      console.log(`Jeux existant: ${Array.from(allGames).join(', ')}`);
      console.log(`Jeux games.get(69): ${games.get(69)}`);
      return;
    }
    const player = game.config.players.find(p => p.id === playerId);
    if (!player) {
      console.error(`Le joueur avec l'ID ${playerId} n'existe pas dans le jeu ${gameId}.`);
      return;
    }
    player.state = state;
    games.set(gameId, game);
  }, */

/*   removeGame: (gameId: number) => {
    if (games.has(gameId)) {
      games.delete(gameId);
      console.log(`Jeu ${gameId} supprimé avec succès.`);
    } else {
      console.error(`Le jeu avec l'ID ${gameId} n'existe pas.`);
    }
  }, */

  // Méthode pour créer une nouvelle partie
/*   createGame(gameId: number, game: any): void {
    try {
    // Vérifier si le jeu existe déjà
    if (games.has(gameId)) {
      console.error(`Le jeu avec l'ID ${gameId} existe déjà.`);
      return;
    }

    games.set(gameId, game);
    console.log(`GameService - Jeu ${gameId} créé avec succès. avec`, game);
    }
    catch (error) {
      console.error(`Erreur lors de la création du jeu ${gameId}:`, error);
    }
  }, */
/*   addPlayerGame(gameId: number, players:WaitingPlayers): void {
   // addWaitingPlayersToGame: (gameId: number, waitingPlayers:WaitingPlayers) => {
    
        if (games.has(gameId)) {
          const game = games.get(gameId)!;
          // Vérifier si le joueur est déjà dans la liste des joueurs en attente
          const playerExists = game.config.players.some((player) => player.userId === players.userId);
          if (playerExists) {
            console.log(`Player ${players.userId} already in players`);
            // Si le joueur existe déjà, on met a jour ses informations
            const playerIndex = game.config.players.findIndex((player) => player.userId === players.userId);
            game.config.players[playerIndex].state = players.state;
            game.config.players[playerIndex].avatar = players.avatar;
            game.config.players[playerIndex].name = players.name;
            game.config.players[playerIndex].id = players.id;
            return;
          }
          game.config.players.push(players);
          games.set(gameId, game);
        }else {
          console.log(`players  err`,players);
          console.error(`Game ${gameId} not found`);
          console.error(`Game ${gameId} games.has(gameId)`,games.has(gameId));
        }
      },
 */

  // Méthode pour obtenir l'état actuel du jeu
/*   getGameState(gameId: number): WebbSocketGame | null {
    return games.get(gameId) || null;
  },
 */
  // Méthode pour ajouter un client à une partie
 /*  addClient(gameId: number, userId: string, client: WebSocket): void {
    const game = games.get(gameId);
    if (!game) {
      console.error(`Le jeu avec l'ID ${gameId} n'existe pas.`);
      return;
    }
    game.clients.set(userId, client);
  }, */
/*   getClients(gameId: number): Map<string, WebSocket> | null {
    const game = games.get(gameId);
    if (!game) {
      console.error(`Le jeu avec l'ID ${gameId} n'existe pas.`);
      return null;
    }
    return game.clients;
  }, */
 /*  getGames(): GameState[] {
    const gamesArray: GameState[] = [];
    games.forEach((game) => {
      gamesArray.push(game);
    });
    return gamesArray;
  },
  getGamebyId: (id: number) => {
    if (games.has(id)) {
      return games.get(id);
    }
  }, */
 /*  broadcast: (gameId:string,message: string) => {

    // Envoyer le message à tous les clients du ayant rejoint kle jeu
    const game = games.get(gameId);
    if (!game) {
      console.error(`Le jeu avec l'ID ${gameId} n'existe pas.`);
      return;
    }
    const gamePlayers = game.config.players;
    gamePlayers.map((player) => {
      if (!player || player.state != "playing") {
        console.error(`Le joueur avec l'ID ${player.id} n'existe pas dans le jeu ${gameId}.`);
        return;
      }
      const client = gameClients.get(player.userId);
      if (client) {
        client.send(message);
      } else {
        console.error(`Le client avec l'ID ${player.userId} n'existe pas on n'a pas encore rejoint la partie.`);
      }
    });
},
sendToClient: (clientId: string, message: string) => {
  if (gameClients.has(clientId)) {
    const socket = gameClients.get(clientId)!;
    socket.send(message);
  }
} */
}

export default GameService;
