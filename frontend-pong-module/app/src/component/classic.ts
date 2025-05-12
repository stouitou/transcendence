import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Match2 as Match } from '../entities/Match';


// Export 'game-component' as a tagname in HTML
@customElement('game-component')
export class  classic extends LitElement {
// LitElement automatically create a shadow DOM
  @property({ type: String }) gameContainerId: string = 'gameWrapper';
  @property({ type: Object }) data: {id: string} | null = null;

  /* ATTRIBUTES */
  private _area!: HTMLDivElement;
  private _game!: Match;


  static styles = css`
  .game-container {
    position: relative;
    width: 800px;
    height: 600px;
    margin: 0 auto;
    margin-top: 20px;
    display: flex;
    flex-direction: column;
  }
  .game-ui {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .game-canvas {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  canvas {
    width: 100%;
    height: 100%;
  }
  .alert {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    min-width: 200px;
    max-width: 300px;
    padding: 16px;
    /* background-color: rgba(255, 0, 0, 0.9); */
    color: white;
    font-size: 18px;
    text-align: center;
    border-radius: 8px;
    z-index: 1000;
    display: none;
  }
  .player-score {
    position : relative;
		display : flex;
		justify-items : space-between;
    align-items: space-between;
		width : 80%;
		height : auto;
		margin : 5px;
    }
  .score-cell {
    padding: 0;
  }
  .score-cell.score-cell-points {
    padding: 0 20px;
  }

  .alert.show {
    display: block;
  }
`;

  /* CONSTRUCTOR */
	constructor () {
    super();
  }
  set params (params: {id: string}) {
    this.data = params;
    console.log('[component ]params:', this.data);
  }
  /*
    Lifecycle methods
  - connectedCallback: Called when the element is added to the DOM.
  - firstUpdated: Called after the element is first rendered.
  - updated: Called after the element is updated.
  - disconnectedCallback: Called when the element is removed from the DOM.
  */
  connectedCallback(): void {
    super.connectedCallback(); 
    console.log('connectedCallback: Component added to the DOM');
    //initialisation of the game
    this._game = new Match();
    //initialisation du the websocket
    this._game.webSocketManager.setLobyid(this.data?.id )/* .connect(); */
    //this._game.setGameManager(dataMatch);
  }

  firstUpdated () {
    console.log('firstUpdated: DOM is ready');
    const gameCanvas = this.shadowRoot?.querySelector('#gameCanvas') as HTMLCanvasElement;
    if (!gameCanvas) {
      throw new Error('Game canvas not found');
    }    
    const gameDivUi = this.shadowRoot?.querySelector('#game-ui') as HTMLElement;
    if (!gameDivUi) {
      throw new Error('Game UI not found');
    }    
    const gameDivAlert = this.shadowRoot?.querySelector('#alertBox') as HTMLElement;
    if (!gameDivAlert) {
      throw new Error('Game UI Alert not found');
    }    
    const gameDivHero = this.shadowRoot?.querySelector('#gameHero') as HTMLElement;
    if (!gameDivHero) {
      throw new Error('Game UI Alert not found');
    }    
    const gameDivHeroTree = this.shadowRoot?.querySelector('#gameHeroTree') as HTMLElement;
    if (!gameDivHeroTree) {
      throw new Error('Game UI Alert not found');
    }  

    // Set the canvas and UI elements in the game instance
    this._game.setCanvas(gameCanvas);
    this._game.setGameUI(gameDivUi);
    this._game.setGameAlert(gameDivAlert);
    this._game.setGameHero(gameDivHero);
    this._game.setGameHeroTree(gameDivHeroTree);
   // this._game.webSocketManager.connect();

/*     setTimeout(() => {
      const alertBox = this.shadowRoot?.querySelector('#alertBox');
      alertBox?.classList.add('show');
    }, 2000);

    setTimeout(() => {
      const alertBox = this.shadowRoot?.querySelector('#alertBox');
      alertBox?.classList.remove('show');
    }, 5000); */
     this._area = this.shadowRoot?.querySelector('.game-canvas') as HTMLDivElement;
    if (!this._area) {
      throw new Error('Game container not found');
    }
   // this._game.setGameManager(dataMatch);
   //connect to the websocket
    this._game.webSocketManager.connect();
  }
  
/*  protected updated(_changedProperties: PropertyValues): void {
  super.updated(_changedProperties);
  console.log('updated: Component updated');
  if (this.data) {
    console.log('Updated data:', this.data);
  }

} */


  render() {
    console.log('render: Rendering the component');
    return html`
    <div id="gameHero"></div>
    <div id="gameHeroTree"></div>
      <div class="game-container">
        <!-- Partie supérieure : UI -->
        <div class="game-ui" id="game-ui">
          <h1>Game UI</h1>
        </div>
  
        <!-- Partie inférieure : Canvas -->
        <div class="game-canvas">
          <canvas id="gameCanvas"></canvas>
        </div>
  
        <!-- Message d'alerte -->
        <div class="alert" id="alertBox">
            <!--  This is an alert message!-->
        </div>
      </div>
    `;
  }

  //close on unmount
    disconnectedCallback() {
      console.log('disconnectedCallback: Component removed from the DOM');
      this._game?.stop();
    //  this._game?.clearGame();
  
    //  this._game?.clearPlayers();
      this._game.removeRemoteMovementListener();

    }
  
}

// Save the component with a customize tagname
declare global {
  interface HTMLElementTagNameMap {
	  'game-component': classic;
  }
}



/* 
// Example data for testing
import { DataMatch } from '../entities/WebsocketClient.js';
const dataMatch:DataMatch ={ 
  "id": "8a2aftazdxhmajbxyq6",
  "lobyId": "a38giyamgfamajbxudw",
  "players": [
    {
      "id": 5,
      "name": "busters B",
      "avatar": "https://lh3.googleusercontent.com/a/ACg8ocI85K9yJNYOrR86zWEpFjKhzWdoA0Hh7YMJCwSSq4-P2U4x8g=s96-c",
      "state": "waiting",
      "isInGame": true,
      "isIA": false,
      "position": {
        "x": 20,
        "y": 250
      },
      "size": {
        "width": 10,
        "height": 100
      },
      "score": 0,
      "paddle": {
        "position": {
          "x": 20,
          "y": 250
        },
        "size": {
          "width": 10,
          "height": 100
        }
      },
      "userId": 2
    },
    {
      "id": 6,
      "name": "IA-2",
      "avatar": "https://localhost:4433/uploads/1-avatartest.jpg",
      "state": "waiting",
      "isInGame": true,
      "isIA": true,
      "position": {
        "x": 780,
        "y": 250
      },
      "size": {
        "width": 10,
        "height": 100
      },
      "score": 0,
      "paddle": {
        "position": {
          "x": 780,
          "y": 250
        },
        "size": {
          "width": 10,
          "height": 100
        }
      },
      "userId": -1
    },
    {
      "id": 7,
      "name": "IA-3",
      "avatar": "https://localhost:4433/uploads/1-avatartest.jpg",
      "state": "waiting",
      "isInGame": true,
      "isIA": true,
      "position": {
        "x": 400,
        "y": 20
      },
      "size": {
        "width": 100,
        "height": 10
      },
      "score": 0,
      "paddle": {
        "position": {
          "x": 400,
          "y": 20
        },
        "size": {
          "width": 100,
          "height": 10
        }
      },
      "userId": -1
    }
  ],
  "ball": {
    "position": {
      "x": 400,
      "y": 300
    },
    "size": {
      "width": 10,
      "height": 10
    }
  },
  "config": {
    "type": "local",
    "format": "classic",
    "tournamentId": null,
    "maxPlayers": 4,
    "isallowedRegistration": true,
    "gameId": 3,
    "state": "playing",
    "players": [
      {
        "id": null,
        "name": "busters B",
        "avatar": "https://lh3.googleusercontent.com/a/ACg8ocI85K9yJNYOrR86zWEpFjKhzWdoA0Hh7YMJCwSSq4-P2U4x8g=s96-c",
        "state": "subscribe",
        "isInGame": true,
        "isIA": false,
        "userId": 2
      },
      {
        "id": null,
        "name": "IA-2",
        "avatar": "https://localhost:4433/uploads/1-avatartest.jpg",
        "state": "subscribe",
        "isInGame": false,
        "isIA": true,
        "userId": -1
      },
      {
        "id": null,
        "name": "IA-3",
        "avatar": "https://localhost:4433/uploads/1-avatartest.jpg",
        "state": "subscribe",
        "isInGame": false,
        "isIA": true,
        "userId": -1
      }
    ]
  },
  "canvas": {
    "width": 800,
    "height": 600
  }

} */