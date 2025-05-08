import { LitElement, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Player } from '../entities/Player.js';
import { Match } from '../entities/Match.js';
import { Bot } from '../entities/Bot.js';

// Export 'game-component' as a tagname in HTML
@customElement('game-component')
export class  classic extends LitElement {
// LitElement automatically create a shadow DOM
  @property({ type: String }) gameContainerId: string = 'gameWrapper';
  @property({ type: Object }) data: {id: string} | null = null;

  /* ATTRIBUTES */
  private _area!: HTMLDivElement;
  private _game!: Match;

  private socket: WebSocket | null = null;
  private wsMe: {userId:string, name:string} |null = null

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
  `;

  /* CONSTRUCTOR */
	constructor () {
    super();
  }
  set params (params: {id: string}) {
    this.data = params;
    console.log('params:', this.data);
  }

/*   firstUpdated () {
     this._area = window.document.getElementById(this.gameContainerId) as HTMLDivElement;
    if (!this._area) {
      throw new Error('Game container not found');
    }

    // Redefine the gameWrapper properties to match with what we need
    // this._area.style.position = "absolute";
    this._area.style.position = 'relative';
    this._area.style.overflow = 'hidden';
    this._area.style.margin = '0';
    this._area.style.padding = '0';
    this._area.style.border = 'none';

    this.setupGame(); 
  } */
  connectedCallback(): void {
    this.render();
    this._area = document.getElementById(this.gameContainerId) as HTMLDivElement;
    if (!this._area) {
      throw new Error('Game container not found');
    }
    this._area.style.position = 'relative';
    this._area.style.overflow = 'hidden';
    this._area.style.margin = '0';
    this._area.style.padding = '0';
    this._area.style.border = 'none';
        // Attendre la connexion WebSocket avant de configurer le jeu
    this.connectWebSocket()
        .then(() => {
            console.log('WebSocket connected and data received');
            this.setupGame(); // Appeler setupGame après la connexion WebSocket
        })
        .catch((error) => {
            console.error('Failed to connect WebSocket or retrieve data:', error);
        });
  }
  
  private async setupGame () {
    try {
      //const player: Player = await this.createPlayer();
      const player: Player = new Player({name: this.wsMe?.name??"guest"}); // Backup value for the player if the API call fails
      console.log('Player created: ', player);
      await this.createGame([player, new Bot(1)]);
    // await this.addToHistory();
    }
    catch (error) {
      console.error('Error setting up game: ', error);
    }
  }

  // Get the first player from the API
  // TODO For the moment, we get him with id 1, in the future, we will get him with the id of the user logged in
/*   private async createPlayer () : Promise<Player> {
      const url: string = 'https://localhost:4433/api/user/me';  // URL adress of the API

      try {
        const response = await fetch(url);      // send a GET request to the API, reuslt is Response type
        if (!response.ok) {
          console.warn(`Server responded with status ${response.status}`);
          throw new Error("Failed to fetch user data");
        }
        const user = await response.json();     // parse the response to JSON
        const player = new Player(user.data); // create a new player with the data from the API

        return player;
      }
      catch (error) {
        console.error('Error while creating player: ', error);
        return new Player({name: 'Host', role: 'user', level: 1});                           // Backup value for the player if the API call fails
      }
  } */

  private async createGame (players: Player[]) : Promise<void> {
  //  createGameDatabase(players, 'classic');
    this._game = new Match(players, this._area);
    await this._game.launch();
   // updateStateGameDatabase();
  }

  render () {
    this.innerHTML = `<div id="gameWrapper">  </div>`;
    const pongdiv = this.querySelector('#gameWrapper')! as HTMLElement;
    pongdiv.style.width = `${600}px`;
    pongdiv.style.height = `${600}px`;
  }

  /**
   * Connect to the WebSocket server for the game.
   * This method establishes a WebSocket connection to the server and handles incoming messages.
   */
  private async connectWebSocket(): Promise<void> {
    return new Promise((resolve, reject) => {
        this.socket = new WebSocket('wss://localhost:4433/ws/wspong');

        this.socket.onopen = () => {
            console.log('WebSocket game connection established');
            // Envoyer un message pour rejoindre le jeu
            this.socket!.send(JSON.stringify({ type: 'joinPong', format: "classic", pongId: this.data?.id }));
        };

        this.socket.onmessage = (event) => {
            if (event.data) {
                const message = JSON.parse(event.data);
                switch (message.type) {
                    case 'me':
                        console.log('me:', message);
                        if (message.name) {
                            this.wsMe = { userId: message.userId, name: message.name };
                            resolve(); // Résoudre la promesse une fois que les données sont disponibles
                        }
                        break;
                    case 'data':
                        console.log('data:', message);
                        break;
                    case 'welcometogame':
                        console.log('welcometogame:', message);
                        break;
                    case 'startGame':
                      console.log('startGame:', message);
                      break;
                }
            }
        };

        this.socket.onclose = () => {
            console.log('WebSocket game connection closed');
            this.socket = null;
            reject(new Error('WebSocket connection closed before data was received'));
        };

        this.socket.onerror = (error) => {
            console.error('WebSocket error:', error);
            reject(error);
        };
    });
}
//close on unmount
  disconnectedCallback() {
    console.log('WebSocket disconnectedCallback game connection closed');
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

// Save the component with a customize tagname
declare global {
  interface HTMLElementTagNameMap {
	  'game-component': classic;
  }
}