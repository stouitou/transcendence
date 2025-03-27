import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Player } from '../entities/Player.js';
import { Game } from '../entities/Game.js';

@customElement('game-component')
export class  oneVSone extends LitElement {
  @property({ type: String }) gameContainerId: string = "gameWrapper";

  /* ATTRIBUTES */
  private _area: HTMLDivElement | null = null;
  private _game!: Game;

  /* CONSTRUCTOR */
	constructor () {
    super();
    // this.attachShadow({ mode: "open" });
    // this.shadowRoot!.innerHTML = ` <style>
    // :host {
    //   position: relative;
    //   width: 100%;
    //   height: 100%;
    // }
    //   html {
    //     margin: 0;
    //     padding: 0;
    //     border: 0;
    //     width: 100%;
    //     height: 100%;
    //   }
    // </style>
    // `;
  }

  firstUpdated () {
    this._area = window.document.getElementById(this.gameContainerId) as HTMLDivElement | null;
    if (!this._area) {
      throw new Error("No game container found");
    }

    this._area.style.width = "700px";
    this._area.style.height = "500px";
    this._area.style.overflow = "hidden";
    this._area.style.position = "absolute";
    this._area.style.margin = "0%";
    this._area.style.padding = "0%";
    this._area.style.border = "none";
    this._area.style.background = "rgb(0, 0, 0)";

    console.log("Area: ", this._area);
    const player1 = new Player("First", this._area);
    const player2 = new Player("Second", this._area);
    // const player3 = new Player("Three", this._area);
    // const player4 = new Player("Four", this._area);

    // const players: Player[] = [player1, player2, player3];
    const players: Player[] = [player1, player2];

    this._game = new Game(players, this._area);
    this._game.launch();
  }
  
  render () {
    return html`
    `;
  }

//   static styles = css`

//   .game {
//     display: flex;
//     flex-direction: column;
//     align-items: center;
//     justify-content: center;
//     position: relative; /* Assurez-vous que le positionnement est relatif */
//     width: 100%;
//     height: 50vh;
//     }
//     `;
}

// Enregistrement du composant avec une balise personnalisée
// customElements.define('pong-game', PongGame);
declare global {
  interface HTMLElementTagNameMap {
	  'game-component': oneVSone;
  }
}