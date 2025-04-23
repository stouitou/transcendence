
import { WebSocket } from "@fastify/websocket"
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
const games =new Map<string, GameState>();
const gameClients =new Map<string, WebSocket>();
export const GameService = {

  addClientSocket: (clientId: string, socket: WebSocket) => {
    gameClients.set(clientId, socket);
    console.log(`✅ Utilisateur ${clientId} connecté`);
  },
  removeClientSocketById: (gameId: string) => {
    gameClients.delete(gameId);
    console.log(`❌ Utilisateur ${gameId} déconnecté`);
  },
  removeClientSocket: (socket: WebSocket) => {
    gameClients.forEach((value, key) => {
      if (value === socket) {
        gameClients.delete(key);
        console.log(`❌ Utilisateur ${key} déconnecté`);
      }
    });
  },


  // Méthode pour créer une nouvelle partie
  createGame(gameId: string, initialPlayers: Player[]): void {
    // Vérifier si le jeu existe déjà
    if (games.has(gameId)) {
      console.error(`Le jeu avec l'ID ${gameId} existe déjà.`);
      return;
    }
    const newGame: GameState = {
      id: gameId,
      players: initialPlayers,
      clients : new Map(),
      ball: {
        position: { top: 0, left: 0 },
        controls: {
          ballUp: false,
          ballDown: false,
          ballLeft: false,
          ballRight: false,
          ballSpeed: 1,
        },
      },
      pong: {
        clientWidth: 1060,
        clientHeight: 730,
        ballWith: 40,
        ballHeight: 40,
        barWidth: 20,
        barHeight: 80
      }
    };
    games.set(gameId, newGame);
  },
  addPlayerGame(gameId: string, initialPlayers: Player[]): void {
    // Vérifier si le jeu existe déjà
    if (games.has(gameId)) {
      const players = games.get(gameId)?.players;
      if (players) {
        // Vérifier si le joueur existe déjà
        const playerExists = players.some((player) => player.id === initialPlayers[0].id);
        if (playerExists) {
          console.error(`Le joueur avec l'ID ${initialPlayers[0].id} existe déjà dans le jeu ${gameId}.`);
          return;
        }
        games.get(gameId)?.players.push(...initialPlayers);
      }
      return;
    }
  },

clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
},

  moveBall(gameId:string) {
    if (!games.has(gameId)) {
      console.error(`Le jeu avec l'ID ${gameId} n'existe pas.`);
      return;
    }
    const game = games.get(gameId);
    if (!game) {
      console.error(`Le jeu avec l'ID ${gameId} n'existe pas.`);
      return;
    }
    const { ball, pong } = game;
    // const ball = this.shadowRoot!.querySelector('.ball') as HTMLElement;
     const verticalPosition = ball.position.top;
     const horizontalPosition = ball.position.left;
    // const pong = this.shadowRoot!.querySelector('.pong') as HTMLElement;
     const viewportWidth = pong.clientWidth;
     const viewportHeight = pong.clientHeight;
   
     const newVerticalPosition = ball.controls.ballUp
         ? this.clamp(verticalPosition - ball.controls.ballSpeed, 0, viewportHeight - pong.ballHeight)
         : this.clamp(verticalPosition + ball.controls.ballSpeed, 0, viewportHeight - pong.ballHeight);
   
     const newHorizontalPosition = ball.controls.ballRight
         ? this.clamp(horizontalPosition + ball.controls.ballSpeed, 0, viewportWidth - pong.ballWith)
         : this.clamp(horizontalPosition - ball.controls.ballSpeed, 0, viewportWidth - pong.ballWith);
   
     ball.position.top = newVerticalPosition;
     ball.position.left = newHorizontalPosition;

     //update ball position
     games.set(gameId, {...game,ball:ball});
     
   },
   moveBar(gameId:string, playerId:number) {
    if (!games.has(gameId)) {
      console.error(`Le jeu avec l'ID ${gameId} n'existe pas.`);
      return;
    }
    const game = games.get(gameId);
    if (!game) {
      console.error(`Le jeu avec l'ID ${gameId} n'existe pas.`);
      return;
    }
    const { pong, players } = game;
    const player = players.find(p => p.id === playerId);
    if (!player) {
      console.error(`Le joueur avec l'ID ${playerId} n'existe pas.`);
      return;
    }
    const verticalPosition = player.position.y;
  //const pong = this.shadowRoot!.querySelector('.pong') as HTMLElement;
    const min = 0;
    const max = pong.clientHeight - pong.barHeight;
  
    const newPosition = player.position.up
        ? this.clamp(verticalPosition - player.position.speed, min, max)
        : player.position.down
            ? this.clamp(verticalPosition +player.position.speed, min, max)
            : verticalPosition;
  
            player.position.y = newPosition;
    //update player position
    players.forEach((p) => {
      if (p.id === playerId) {
        p.position.y = player.position.y;
      }
    }
    );
  },
  updateGame(game:GameState) {
  
    this.moveBall(game.id);
    game.players.forEach((player) => {
      //move player
      this.moveBar(game.id, player.id);
      }
    )  
    this.changeControl(game.id);
  },
  changeControl(gameId:string) {
    const game = games.get(gameId);
    if (!game) {
      console.error(`Le jeu avec l'ID ${gameId} n'existe pas.`);
      return;
    }
    const { ball, pong,players } = game;
    const newVerticalPosition = ball.position.top;
    const newHorizontalPosition = ball.position.left;
    const viewportWidth = pong.clientWidth;
    const viewportHeight = pong.clientHeight;

    if (newVerticalPosition === 0) {
        ball.controls.ballUp = false;
    }

    if (newVerticalPosition === viewportHeight - pong.ballHeight) {
      ball.controls.ballUp = true;
    }

    if (newHorizontalPosition === 0) {
      ball.controls.ballRight = true;
    //    this.controls.score.right += 1;
/*   ball.position.top = viewportHeight / 2;
  ball.position.left = viewportWidth / 2; */
     //   this.sendScore();
    }

    if (newHorizontalPosition === viewportWidth - pong.ballWith) {
      ball.controls.ballRight = false;
      //  this.controls.score.left += 1;
/*       ball.position.top = viewportHeight / 2;
      ball.position.left = viewportWidth / 2; */
       // this.sendScore();
    }
    players.forEach((player) => {

      if (this.hasCollision(ball, player, pong)) {
        ball.controls.ballRight = false;
        ball.controls.ballUp = player.position.up
              ? true
              : player.position.down
                  ? false
                  : ball.controls.ballUp;
      }
    }
  )

  /*   if (this.hasCollision(ball, this.shadowRoot!.querySelector('.bar.left') as HTMLElement)) {
        this.controls.ballRight = true;
        this.controls.ballUp = this.controls.leftPlayerUp
            ? true
            : this.controls.leftPlayerDown
                ? false
                : this.controls.ballUp;
    } */
},

hasCollision(ball: Ball, player: Player,pong:Pong): boolean {
  const side = player.position.side; // left or right
  const ballRect = {
    x: ball.position.left,
    y: ball.position.top,
    width: pong.ballWith,
    height: pong.ballHeight,
  };
  const playerRect = {
    x: side === 'left' ? (0) : pong.clientWidth - (pong.barWidth + 20),
    y: player.position.y,
    width: pong.barWidth,
    height: pong.barHeight,
  };
  // Vérifier la collision entre la balle et le joueur 

  if (ballRect.x > playerRect.x + playerRect.width) return false;
  if (ballRect.x + ballRect.width < playerRect.x) return false;
  if (ballRect.y > playerRect.y + playerRect.height) return false;
  if (ballRect.y + ballRect.height < playerRect.y) return false;
  return true;
}, 



  // Méthode pour traiter une action de jeu
  handleGameAction(gameId: string, action: GameAction): GameState | null {
    const game = games.get(gameId);
    if (!game) return null;

    switch (action.type) {
      case 'MOVE':
        this.movePlayer(game, action.playerId, action.payload);
        break;
     /*  case 'BALL':
        this.moveBall(game, action.playerId, action.payload);
        break; */
    }

    return game;
  },

  // Méthode pour déplacer un joueur
   movePlayer(game: GameState, playerId: number, position: { x: number; y: number ,up:boolean
  ,down:boolean,speed:number,side:string
   }): void {
    const player = game.players.find(p => p.id === playerId);
    if (player) {
      player.position = position;
    }
  },



  // Méthode pour obtenir l'état actuel du jeu
  getGameState(gameId: string): GameState | null {
    return games.get(gameId) || null;
  },

  // Méthode pour ajouter un client à une partie
  addClient(gameId: string, userId: string, client: WebSocket): void {
    const game = games.get(gameId);
    if (!game) {
      console.error(`Le jeu avec l'ID ${gameId} n'existe pas.`);
      return;
    }
    game.clients.set(userId, client);
  },
  getClients(gameId: string): Map<string, WebSocket> | null {
    const game = games.get(gameId);
    if (!game) {
      console.error(`Le jeu avec l'ID ${gameId} n'existe pas.`);
      return null;
    }
    return game.clients;
  },
  getGames(): GameState[] {
    const gamesArray: GameState[] = [];
    games.forEach((game) => {
      gamesArray.push(game);
    });
    return gamesArray;
  },
  broadcast: (gameId:string,message: string) => {
    const game = games.get(gameId);
    if (!game) {
      console.error(`Le jeu avec l'ID ${gameId} n'existe pas.`);
      return;
    }
    const clients = game.clients;
    if (!clients) {
      console.error(`Le jeu avec l'ID ${gameId} n'a pas de clients.`);
      return;
    }
    clients.forEach((socket) => {
        socket.send(message);
    });
},
sendToClient: (clientId: string, message: string) => {
  if (gameClients.has(clientId)) {
    const socket = gameClients.get(clientId)!;
    socket.send(message);
  }
}
}

export default GameService;
