import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Player } from '../entities/Player.js';
import { Tournament } from '../entities/Tournament.js';

@customElement('tournament-component')
export class  TournamentGame extends LitElement {
  @property({ type: String }) gameContainerId: string = "gameWrapper";

  /* ATTRIBUTES */
  private _area!: HTMLDivElement;
  private _game!: Tournament;

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
    this._area = window.document.getElementById(this.gameContainerId)! as HTMLDivElement;

    // this._area.style.position = "absolute";
    this._area.style.position = "relative";
    this._area.style.overflow = "hidden";
    this._area.style.margin = "0%";
    this._area.style.padding = "0%";
    this._area.style.border = "none";

    this.setupGame();
  }

  private async setupGame () {
    const name: string = await this.createPlayer();
  
    const players: string[] = [name, 'Guest1', 'Guest2', 'Guest3', 'Guest4'];
    await this.createGame(players);
    // await this.addToHistory();
  }

  private async createPlayer () : Promise<string> {
    const url = 'https://localhost:4433/api/v2/database/myDb/table/user/id/1';

    try {
      const response = await fetch(url);
      const data = await response.json();
      const name = data.data.name!;
      if (!name) {
        throw new Error("No name found");
      }
      return (name);
    }
    catch (error) {
      return ("Host");
    }
  }

  async createGame (names: string[]) : Promise<void> {
    const url = 'https://localhost:4433/api/v2/database/myDb/table/game';
    const body = {
      players: names,
      state: 'running',
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
      let players: Player[] = [];
      for (let i = 0; i < names.length; i++) {
        players[i] = new Player(names[i], i, false);
      }
      this._game = new Tournament(players, this._area);
      // const players: Player[] = [new Player(player1, 0, false), new Player(player2, 1, true)];
      // this._game = new Match(players, this._area);
      // await this._game.launch();
    }
    catch (error) {
      console.log("Error");
    }
  }

  render () {
    return html`
    `;
  }
}

// Enregistrement du composant avec une balise personnalisée
// customElements.define('pong-game', PongGame);
declare global {
  interface HTMLElementTagNameMap {
	  'tournament-component': TournamentGame;
  }
}