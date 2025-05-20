import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Match2 as Match } from '../entities/Match';

/* ────────────────────────────────────────── */
/* <game-component>                           */
/* ────────────────────────────────────────── */
@customElement('game-component')
export class Classic extends LitElement {
  /* ---------- public attributes ---------- */
  @property({ type: String }) gameContainerId: string = 'gameWrapper';
  @property({ type: Object }) data: { id: string } | null = null;

  /* ---------- private refs ---------- */
  private _area!: HTMLDivElement;
  private _game!: Match;

  /* ---------- styles ---------- */
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
      color: white;
      font-size: 18px;
      text-align: center;
      border-radius: 8px;
      z-index: 1000;
      display: none;
    }
    .player-score {
      position: relative;
      display: flex;
      justify-items: space-between;
      align-items: space-between;
      width: 80%;
      height: auto;
      margin: 5px;
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

  /* ---------- setters ---------- */
  set params(params: { id: string }) {
    this.data = params;
    console.log('[game-component] params:', this.data);
  }

  /* ---------- background helpers ---------- */
  private hideBackground(): void {
    const bg = document.querySelector('background-canvas-component');
    if (bg) (bg as HTMLElement).style.display = 'none';
  }
  private showBackground(): void {
    const bg = document.querySelector('background-canvas-component');
    if (bg) (bg as HTMLElement).style.display = '';
  }

  /* ---------- lifecycle ---------- */
  connectedCallback(): void {
    super.connectedCallback();
    console.log('connectedCallback: Component added to the DOM');

    /* turn OFF the colourful-ball background */
    this.hideBackground();

    /* initialise the game instance */
    this._game = new Match();
    this._game.webSocketManager.setLobyid(this.data?.id);
  }

  firstUpdated() {
    console.log('firstUpdated: DOM is ready');

    const gameCanvas   = this.shadowRoot?.querySelector('#gameCanvas')  as HTMLCanvasElement;
    const gameDivUi    = this.shadowRoot?.querySelector('#game-ui')     as HTMLElement;
    const gameDivAlert = this.shadowRoot?.querySelector('#alertBox')    as HTMLElement;
    const gameDivHero  = this.shadowRoot?.querySelector('#gameHero')    as HTMLElement;
    const gameDivHeroT = this.shadowRoot?.querySelector('#gameHeroTree') as HTMLElement;

    if (!gameCanvas || !gameDivUi || !gameDivAlert || !gameDivHero || !gameDivHeroT) {
      throw new Error('One or more game DOM nodes not found');
    }

    /* wire the DOM refs into Match2 */
    this._game.setCanvas(gameCanvas);
    this._game.setGameUI(gameDivUi);
    this._game.setGameAlert(gameDivAlert);
    this._game.setGameHero(gameDivHero);
    this._game.setGameHeroTree(gameDivHeroT);

    /* store canvas wrapper (used later?) */
    this._area = this.shadowRoot?.querySelector('.game-canvas') as HTMLDivElement;

    /* finally connect WebSocket */
    this._game.webSocketManager.connect();
  }

  disconnectedCallback() {
    console.log('disconnectedCallback: Component removed from the DOM');
    this._game?.stop();
    this._game.removeRemoteMovementListener();

    /* restore the colourful-ball background */
    this.showBackground();

    super.disconnectedCallback();
  }

  /* ---------- render ---------- */
  render() {
    console.log('render: Rendering the component');
    return html`
      <div id="gameHero"></div>
      <div id="gameHeroTree"></div>

      <div class="game-container">
        <!-- Top UI -->
        <div class="game-ui" id="game-ui">
          <h1>Game UI</h1>
        </div>

        <!-- Playfield -->
        <div class="game-canvas">
          <canvas id="gameCanvas"></canvas>
        </div>

        <!-- Alerts -->
        <div class="alert" id="alertBox"></div>
      </div>
    `;
  }
}

/* ---------- tag registration ---------- */
declare global {
  interface HTMLElementTagNameMap {
    'game-component': Classic;
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