import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Player } from '../entities/Player.js';
import { Match } from '../entities/Match.js';
import { Tournament } from '../entities/Tournament.js';

@customElement('game-component')
export class  oneVSone extends LitElement {
// LitElement automatically create a shadow DOM
  @property({ type: String }) gameContainerId: string = "gameWrapper";

  /* ATTRIBUTES */
  private _area!: HTMLDivElement;
  private _game!: Tournament;
  // private _game!: Match;
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

    this._area.style.position = "absolute";
    this._area.style.overflow = "hidden";
    this._area.style.margin = "0%";
    this._area.style.padding = "0%";
    this._area.style.border = "none";

    this.setupGame();
  }
  
  private async setupGame () {
    const name: string = await this.createPlayer();
  
    await this.createGame(name, 'Guest');
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

  async createGame (player1: string, player2: string) : Promise<void> {
    const url = 'https://localhost:4433/api/v2/database/myDb/table/game';
    const body = {
      players: [player1, player2],
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
      const players: Player[] = [new Player(player1, 0, false), new Player(player2, 1, false), new Player('player3', 2, false), new Player('player4', 3, false), new Player('player5', 4, false)];
      this._game = new Tournament(players, this._area);
      // const players: Player[] = [new Player(player1, 0, false), new Player(player2, 1, true)];
      // this._game = new Match(players, this._area);
      // await this._game.launch();
    }
    catch (error) {
      console.log("Error");
    }
  }

  // private async addToHistory () : Promise<void> {
  //   const url = 'https://localhost:4433/api/v2/database/myDb/table/gameHistory';
  //   const body = {
  //     player1: this._game.players[0].name,
  //     player2: this._game.players[1].name,
  //     score1: this._game.players[0].points,
  //     score2: this._game.players[1].points,
  //     winner: this._game.winner,
  //   }
  //   try {
  //     const response = await fetch(url, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify(body),
  //     });
  //     const data = await response.json();
  //     console.log("history: ", data);
  //   }
  //   catch (error) {
  //     console.log("Error");
  //   }
  // }

  // private async launchGame () {
  //   const url = 'https://localhost:4433/api/v2/database/myDb/table/game/id/1';
  //   const body = {
  //     state: 'running',
  //   };

  //   try {
  //     const response = await fetch(url, {
  //       method: 'PUT',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify(body),
  //     });
  //     const data = await response.json();
  //     console.log(data);
  //   }
  //   catch (error) {
  //     console.log("Error");
  //   }
  // }

  render () {
    return html`
    `;
  }
}

// Enregistrement du composant avec une balise personnalisée
declare global {
  interface HTMLElementTagNameMap {
	  'game-component': oneVSone;
  }
}