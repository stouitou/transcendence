import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Player } from '../entities/Player.js';
import { Match } from '../entities/Match.js';
import { createGameDatabase, updateStateGameDatabase } from '../utils/databaseGame.js';
import { Bot } from '../entities/Bot.js';

// Export 'game-component' as a tagname in HTML
@customElement('game-component')
export class  classic extends LitElement {
// LitElement automatically create a shadow DOM
  @property({ type: String }) gameContainerId: string = 'gameWrapper';

  /* ATTRIBUTES */
  private _area!: HTMLDivElement;
  private _game!: Match;

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

  firstUpdated () {
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
  }
  
  private async setupGame () {
    try {
      const player: Player = await this.createPlayer();
      await this.createGame([player, new Bot(1), new Bot(1), new Bot(1)]);
    // await this.addToHistory();
    }
    catch (error) {
      console.error('Error setting up game: ', error);
    }
  }

  // Get the first player from the API
  // TODO For the moment, we get him with id 1, in the future, we will get him with the id of the user logged in
  private async createPlayer () : Promise<Player> {
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
  }

  private async createGame (players: Player[]) : Promise<void> {
    createGameDatabase(players, 'classic');
    this._game = new Match(players, this._area);
    await this._game.launch();
    updateStateGameDatabase();
  }

  render () {
    return `
    `;
  }
}

// Save the component with a customize tagname
declare global {
  interface HTMLElementTagNameMap {
	  'game-component': classic;
  }
}