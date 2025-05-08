import { LitElement,  css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Ball/* , Direction */, InputManager, Paddle, Player, Pong, Position, Size } from '../entities/Pong';
/* import { Player } from '../entities/Player.js';
import { Match } from '../entities/Match.js';
import { createGameDatabase, updateStateGameDatabase } from '../utils/databaseGame.js';
import { Bot } from '../entities/Bot.js'; */
interface WaitingPlayers {
  userId: number,
  id: number | null,
  name: string | null,
  avatar: string | null,
  state: string | null,
  // state: "waiting" | "playing" | "finished" | "joined" | "left" | "cancelled",
  isInGame: boolean,
  isIA: boolean,
  position?: {
    x: number,
    y: number
  },
  size?: Size,// taille du paddle
  score?: number,
}
/* export interface WebSocketGameConfig {
	type : string,
	format : string,
	//gameType: string, // "pong" | "pong2" | "pong3"
	tournamentId: string | null,
	maxPlayers: number,
	isallowedRegistration: boolean, // for friendly game
	gameId: string,
	state: string, // "open","waiting" | "playing" | "finished"
	players: WaitingPlayers[],
} */

  export type Match = {
    id: string,
    lobyId: string,
    players: {id: number;
    name: string;
    avatar: string;
    state: string;
    isInGame: boolean;
    isIA: boolean;
    position: Position;
    size: Size;
    score: number;
    paddle: {
        position: Position;
        size: Size;
    };
  }[],
    ball: {position: Position},
    config: {
      type: string;
      format: string;
      tournamentId: string | null;
      maxPlayers: number;
      isallowedRegistration: boolean;
      gameId: string;
      state: string;
      players: WaitingPlayers[];
  }
  }
// Export 'game-component' as a tagname in HTML
@customElement('game-component-classic')
export class  classic extends LitElement {
  private VITE_BACKEND_SERVER_WS_URL = import.meta.env.VITE_BACKEND_SERVER_WS_URL || 'wss://localhost:4433/ws';

// LitElement automatically create a shadow DOM
  @property({ type: String }) gameContainerId: string = 'gameWrapper';
  @property({ type: Object }) data: {id: string} | null = null;

  /* ATTRIBUTES */
 // private _area!: HTMLDivElement;
  private _game: Pong | null = null;
  private wsMe?: { userId: string; name: string, index: number };

  private socket: WebSocket | null = null;
  private dataConfig?:Match;
  static  style = css`
    :host {
      position: relative;
      width: 100%;
      height: 100%;
    }
    html {
      margin: 0;
      padding: 0;
      border: 0;
      width: 100%;
      height: 100%;
    }
    canvas {
      background: black;
      display: block;
      margin: 0 auto;
      margin-top: 30px;
    }
  `;

  /* CONSTRUCTOR */
	constructor () {
    super();
  }
  set params (params: {id: string}) {
    this.data = params;
    console.log('params:', this.data);
  }

  /* LIFECYCLE */
  connectedCallback(): void {
    this.render();
    this.connectWebSocket()
    /*     .then(() => {
            console.log('WebSocket connected and setupGame received');
           // this.setupNewGame(); // Appeler setupGame après la connexion WebSocket
            if (this.dataConfig?.config.type === 'remote') {
            this._game.start();
            }else {
              this._game.startLocal(this.wsSendMessage.bind(this));
            }
        })
        .catch((error) => {
            console.error('Failed to connect WebSocket or retrieve data:', error);
        }); */
  }
  
  private setupNewGame () {
    //si un game est deja en cours
    if (this._game) {
      this._game.stop();
      this._game.clearPlayers();
      this._game = null;
    }
    // on recupere le canvas du jeu
    const canvas = this.querySelector('#game') as HTMLCanvasElement;
    if (!canvas) {
      throw new Error('Canvas not found');
    }
    canvas.style.backgroundColor = 'black';
    // on recupere le canvas de l'interface utilisateur
    const canvasUI = this.querySelector('#gameUI') as HTMLCanvasElement;
    if (!canvasUI) {
      throw new Error('canvasUI not found');
    }
    canvas.style.backgroundColor = 'black';
    // on initialise une nouvelle instance de Pong
    try {
      const ball = new Ball({ x: canvas.width/2, y: canvas.height/2 }, { width: 10, height: 10 }, { x: 10, y: 10 });
      this._game = new Pong(canvas,canvasUI);
      if (!this._game) {
        throw new Error('Game not found');
      }
      this._game.setBall(ball);
      this._game.setLobyId(this.data?.id||"");
      this._game.setGameId(this.dataConfig?.id||"");// set the gameId //@TODO rename it
        //initial setup
        //position and size of the paddles
       // const position:Position[] = [{ x: 20, y: 250 }, { x: 780, y: 250 }, { x: 400, y: 20 }, { x: 400, y: 580 }];
       // const size:Size[] = [{ width: 10, height: 100 }, { width: 10, height: 100 }, { width: 100, height: 10 }, { width: 100, height: 10 }];
        //construction des Player[]
        const players: Player[] = this.dataConfig?.players.map((player,index) => {
          const jsonData = {
            id: player.id,
            name: player.name,
            isRemote: this.dataConfig?.config.type === 'remote',
            isInGame: player.isInGame,
            isIA: player.isIA,  
            score: player.score,        
          }
          return new Player(jsonData,new Paddle(player.paddle.position!, player.paddle.size!),index)
        }
      ) as Player[];

      const inputs: InputManager[] = this.dataConfig?.players.map((player,index) => new InputManager(index,!player.isIA)) as InputManager[];
     
      this._game.addPlayers(players,inputs);
     /*  players.map((player, index) => {
        console.log('player:', index,player.id);
        this._game?.addPlayer(player, inputs[index]);
      }); */
    }
    catch (error) {
      console.error('Error setting up game: ', error);
    }
  }


  render () {
    this.innerHTML = `
    <div id="error"></div>
    <div id="gameHeroTree" width="800"">
      <h1 class="text-3xl font-bold text-center mb-6">Pong Game</h1>
      <p class="text-lg font-semibold">Waiting for players...</p>
    </div>
    <div id="gameHero" class="flex flex-col items-center justify-center min-w-[800px]">
      <h1 class="text-3xl font-bold text-center mb-6">Pong Game</h1>
      <p class="text-lg font-semibold">Waiting for players...</p>
    </div>
    <div id="gameWrapper">  
      <canvas id="gameUI" width="800" height="100"></canvas>
      <canvas id="game" width="800" height="600"></canvas> 
    </div>`;
    const pongdiv = this.querySelector('#gameWrapper')! as HTMLElement;
    pongdiv.style.width = `${1800}px`;
    pongdiv.style.height = `${600}px`;
    Pong.drawWaitingScreen(this.querySelector('#game') as HTMLCanvasElement);

  }

  /**
   * Connect to the WebSocket server for the game.
   * This method establishes a WebSocket connection to the server and handles incoming messages.
   */
  private connectWebSocket(): void {
    console.log('Connecting to WebSocket server...');
    console.log('WebSocket URL:', this.VITE_BACKEND_SERVER_WS_URL);

    this.socket = new WebSocket(`${this.VITE_BACKEND_SERVER_WS_URL}/wspong`);

    this.socket.onopen = () => {
      console.log('WebSocket game connection established');
      this.socket!.send(JSON.stringify({ type: 'joinPong', format: 'classic', pongId: this.data?.id }));
    };

    this.socket.onmessage = (event) => {
      if (event.data) {
        const message = JSON.parse(event.data);
        this.handleWebSocketMessage(message);
      }
    };

    this.socket.onclose = () => {
      console.log('WebSocket game connection closed');
      this.socket = null;
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }
  /**
   * Handles incoming WebSocket messages.
   */
  private handleWebSocketMessage(message: any): void {
    switch (message.type) {
      case 'waintingStart':
        console.log('waintingPlayers:', message);
        break;
      case 'me':
        console.log('me:', message);
        if (message.name) {
          this.wsMe = { userId: message.userId, name: message.name, index: 0 };
        }
        break;
      case 'SETUPNEWGAME':
        console.log('SETUPNEWGAME:', message);
        this.dataConfig = message.data as Match;
        if (!this.dataConfig) {
          console.error('No dataConfig found');
          return;
        }
        this.wsMe!.index = this.dataConfig.config.players.findIndex(
          (player) => player.userId === Number(this.wsMe?.userId)
        );
        this.setupNewGame();
        if (!this._game) {
          console.error('Game not found');
          return;
        }
        if (this.dataConfig.config.type === 'remote') {
          this.attachRemoteMovementListener();
          this._game.start();
        } else {
          const forceSTOP = this.dataConfig.config.state === 'finished' || this.dataConfig.config.state === 'cancelled';
          this._game.startLocal(this.wsSendMessage.bind(this), forceSTOP);
        }
        break;
      case 'startGame':
        console.log('startGame:', message);
        break;
      case 'state':
        console.log('state:', message);
        this._game?.updateGameState(message.game);
        break;
      case 'game-message':
        console.log('game-message:', message);
        if (message.action === 'left') {
          console.log('game-message - left:', message);
        } else if (message.action === 'finished') {
          console.log('game-message - finished:', message);
        }
        break;
      case 'MESSAGE':
        console.log('MESSAGE:', message);
        break;
      
      case 'PREPARE_MATCHES_STARTED_ROUND': //envoi des matches classe par round
        console.log('pong:', message);
        const div2 = this.querySelector('#gameHeroTree') as HTMLDivElement;
        if (div2) {
          div2.innerHTML = '';
          displayPrepareMatchesStartedTournament(div2,message.data);
        }
        setTimeout(() => {
          if (div2) {
            div2.innerHTML = '';
          }
        }
        , 5000);
        break;
      case 'PREPARE_MATCHES_STARTED_ROUND_GAME': //envoi du match qui va debuter dans 10secondes
        console.log('pong:', message);
        const div = this.querySelector('#gameHero') as HTMLDivElement;
        if (div) {
          div.innerHTML = '';
          displayPrepareMatchesStartedRoundGame(div,message.data);
        }
        setTimeout(() => {
          if (div) {
            div.innerHTML = '';
          }
        }
        , 5000);
        break;
      case 'error':
        console.error('WebSocket error:', message);
        break;
      default:
        console.log('Unknown message type:', message.type);
        console.log('Unknown message :', message);
        // affiche dans div error
        const errorDiv = this.querySelector('#error') as HTMLDivElement;
        if (errorDiv) {
           const div = document.createElement('div');
          div.innerHTML = `<div style="color: red;background-color:yellow">Error: <pre>${message}</pre></div>`;
          errorDiv.appendChild(div);
          setTimeout(() => {
            if (div) {
              div.remove();
            }
          }
          , 5000);
        }
        break;
    }
  }

//close on unmount
  disconnectedCallback() {
    console.log('WebSocket disconnectedCallback game connection closed');

    this._game?.clearPlayers();
    this.removeRemoteMovementListener();
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this._game?.stop();
  }


  handleKeyDown = (event: KeyboardEvent) => {
    const key = event.key;
    switch (key) {
      case 'ArrowLeft':
        this.sendMoveMessage("left");
        break;
      case 'ArrowRight':
        this.sendMoveMessage("right");
        break;
      case 'ArrowDown':
        this.sendMoveMessage("down");
        break;
      case 'ArrowUp':
        this.sendMoveMessage("up");
        break;
      default:
        console.log('Unknown key pressed:', key);
        break;
    }
  };
  handleKeyUp = (event: KeyboardEvent) => {
    const key = event.key;
    switch (key) {
      case 'ArrowLeft':
      case 'ArrowRight':
      case 'ArrowDown':
      case 'ArrowUp':
        this.sendMoveMessage();
        break;
      default:
        console.log('Unknown key pressed:', key);
        break;
    }
  }
  attachRemoteMovementListener () {
    // Listen for remote player movements
    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);
  }
  removeRemoteMovementListener () {
    // Remove the event listeners when not needed
    if (this.dataConfig && this.dataConfig.config.type === 'remote') {
      document.removeEventListener('keydown', this.handleKeyDown);
      document.removeEventListener('keyup', this.handleKeyUp);
    }
  }
  //send message to the server
  sendMoveMessage (direction: string|null = null) {
    const message = { 
      type: 'move',
      // lobyId: `${this.dataConfig?.lobyId}`,
       lobyId: `${this.data?.id}`,
        pongId: `${this.dataConfig?.id}`,        
        index: this.wsMe!.index,
       direction
      };

    if (this.socket) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
    }
  }

  wsSendMessage (data: any) {
    if (this.socket) {
      this.socket.send(JSON.stringify(data));
    } else {
      console.error('WebSocket is not connected');
    }
  }
}

// Save the component with a customize tagname
declare global {
  interface HTMLElementTagNameMap {
	  'game-component-classic': classic;
  }
}


//component affichage du PREPARE_MATCHES_STARTED_ROUND_GAME
type PREPARE_MATCHES_STARTED_ROUND_GAME = {
  
    id:string, //"9jqjw4k74ytmacj5nq4",
    players:
      {
        id: number,//352,
        userId: number,//-1,
        name: string,//"IA-4",
        avatar: string,//"https://localhost:4433/uploads/1-avatartest.jpg",
        score: number,//0,
        isInGame: boolean,//true,
        isIA: boolean,//true
      } [],
    gameHistoryId: number,//171,
    gameId: number,//171,
    winner: {
        id: number,//353,
        userId: number,//-1,
        name: string,//"IA-3",
        avatar: string,//"https://localhost:4433/uploads/1-avatartest.jpg",
        state: string,//"finished",
        isInGame: boolean,//true,
        isIA: boolean,//true,
        score: number,//5
      } | null,
    isFinished: boolean,//true
  }
  
const displayPrepareMatchesStartedRoundGame = (div: HTMLDivElement,data:PREPARE_MATCHES_STARTED_ROUND_GAME) => {
  const {players,winner} = data;
  div.innerHTML = `
  <div class="mx-auto text-center">
        <div class="game-card-container-background">

          <div class="game-card-container-row">
           <p class="text-3xl font-bold text-center mb-6">Game ID: #${data.id}</p>
          </div>

          
          <div class="game-card-container-row">
            <div class="flex flex-col items-center justify-center min-w-[220px]">
            ${players.map((player,i) =>
              i%2 === 0 ? `
              <div class="flex flex-col items-center justify-center min-w-[220px] py-4">
                  <img referrerPolicy="no-referrer"
                        src=${player.avatar}
                        alt="User Avatar"
                        class="w-24 h-24 mx-auto rounded-full border-4 border-gray-300 mb-4"
                    />
                        <h2 class="text-2xl font-semibold">${player.name}</h2>

                        <br>
                          <h3 class="text-lg font-semibold">Games Score</h3>
                          <p class="text-green-600 text-9xl">${player.score}</p>

              </div>`:``
          ).join('')}

              </div>
            <div class="flex flex-col items-center justify-center">
              <p class="text-blue-600 text-8xl px-3">VS</p>
            </div>


            <div class="flex flex-col items-center justify-center min-w-[220px]">
                ${players.map((player,i) => 
                  i%2 === 1 ? `
                  <div class="flex flex-col items-center justify-center min-w-[220px] py-4">
                      <img referrerPolicy="no-referrer"
                            src=${player.avatar}
                            alt="User Avatar"
                            class="w-24 h-24 mx-auto rounded-full border-4 border-gray-300 mb-4"
                        />
                            <h2 class="text-2xl font-semibold">${player.name}</h2>

                            <br>
                              <h3 class="text-lg font-semibold">Games Score</h3>
                              <p class="text-green-600 text-9xl">${player.score}</p>

                  </div>`:``
              ).join('')}

            </div>
          </div>
            <p>Winner: </p>
            <p class="text-3xl font-bold text-center mb-6 text-green-600">${winner?winner.name:''}</p>
        </div>
         
     </div>
 `;
}

type PREPARE_MATCHES_STARTED_ROUND={
  round:number,
  matches:PREPARE_MATCHES_STARTED_ROUND_GAME[]
}

const displayPrepareMatchesStartedTournament = (div: HTMLDivElement,data:PREPARE_MATCHES_STARTED_ROUND[]) => {
  div.innerHTML = `
  <div>
   <p>Click the links below to navigate:</p>
    ${data.map((round, index) => `
      <div class="flex flex-col">
            <p>Round ${index+1}</p>
            ${round.matches.map((match) =>  `
              <div class="flex flex-row">           
                  ${match.players.map((player) =>  `
                    <div class="flex flex-col">                
                        <div class="w-20">
                          <img referrerPolicy="no-referrer"
                                src=${player.avatar}
                                alt="User Avatar"
                                class="w-5 h-5 mx-auto rounded-full border-4 border-gray-300 mb-4"
                            />
                          </div>
                          <h2 class="text-xl font-semibold">${player.name}</h2>
                          <br>
                          <h3 class="text-lg font-semibold">Games Score</h3>
                          <p class="text-green-600 text-lg">${player.score}</p>
                    </div>`
                  ).join('')}
              </div>
              <br>
              `).join('')}
        </div>
    `).join('')}
  </div>`
}