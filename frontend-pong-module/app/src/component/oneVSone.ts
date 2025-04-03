import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Player } from '../tests/Player.js';
// import { Player } from '../entities/Player.js';
import { Game } from '../entities/Game.js';
import { Match } from '../tests/Match.js';

@customElement('game-component')
export class  oneVSone extends LitElement {
// LitElement automatically create a shadow DOM
  @property({ type: String }) gameContainerId: string = "gameWrapper";

  /* ATTRIBUTES */
  private _area!: HTMLDivElement;
  private _field!: HTMLCanvasElement;
  // private _game!: Game;
  private _game!: Match;
  static styles = css`
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

  firstUpdated () {
    this._area = window.document.getElementById(this.gameContainerId) as HTMLDivElement;
    if (!this._area) {
      throw new Error("No game container found");
    }

    // this._area.style.width = "700px";
    // this._area.style.height = "500px";
    this._area.style.overflow = "hidden";
    this._area.style.position = "absolute";
    // this._area.style.top = "50vh";
    // this._area.style.left = "50vw";
    // this._area.style.transform = "translate(-50%, -50%)";
    this._area.style.margin = "0%";
    this._area.style.padding = "0%";
    this._area.style.border = "none";

    this.setupGame();
  }
  
  async setupGame () {
    const name: string = await this.createPlayer();
  
    await this.createGame(name, 'guest');
    this.launchGame();
  }

  async createPlayer () : Promise<string> {
      const url = 'https://localhost:4433/api/v2/database/myDb/table/user/id/1';

      try {
        const response = await fetch(url);
        const data = await response.json();
        const name = data.data.name;
        if (!name) {
          throw new Error("No name found");
        }
        return (name);
      }
      catch (error) {
        return ("Player1");
      }
  }

  async createGame (player1: string, player2: string) : Promise<void> {
    const url = 'https://localhost:4433/api/v2/database/myDb/table/game';
    const body = {
      players: [player1, player2],
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      const data = await response.json();
    }
    catch (error) {
      console.log("Error");
    }
    const players: Player[] = [new Player(player1, 0), new Player(player2, 1)];
    // const players: Player[] = [new Player(player1, this._area), new Player(player2, this._area)];
    // this._game = new Game(players, this._area);
    this._game = new Match(players, this._area);
  }

  async launchGame () {
    const url = 'https://localhost:4433/api/v2/database/myDb/table/game/id/1';
    const body = {
      state: 'running',
    };

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      console.log(data);
    }
    catch (error) {
      console.log("Error");
    }
    // this._game.launch();
  }

  render () {
    return html`
    `;
  }

  // static styles = css`

  // .game {
  //   display: flex;
  //   flex-direction: column;
  //   align-items: center;
  //   justify-content: center;
  //   position: relative; /* Assurez-vous que le positionnement est relatif */
  //   width: 100%;
  //   height: 50vh;
  //   }
  //   `;
}

// Enregistrement du composant avec une balise personnalisée
// customElements.define('game-component', OneVSone);
declare global {
  interface HTMLElementTagNameMap {
	  'game-component': oneVSone;
  }
}