import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { Player } from '../entities/Player.js';
// import { Tournament } from '../entities/Tournament.js';
import { Game } from '../entities/Game.js';

@customElement('game-component')
export class oneVSone extends LitElement {
  // private readonly  _canvas: HTMLCanvasElement | null = null;
  private readonly  _game!: Game;
	// private tournament:Tournament;
  
	constructor () {
    super();
    console.log("Starting game...");
    // const canvas = window.document.getElementById("canvas") as HTMLCanvasElement | null;
    // if (!canvas)
    //   throw new Error("No canvas found");
    // this._canvas = canvas;

    // this._canvas.style.background = 'rgb(0, 87, 0)';
    const player1 = new Player("First");
    const player2 = new Player("Second");
    // const player3 = new Player("Pierre3");
    // const player4 = new Player("Bess4");
    // const player5 = new Player("Paul5");
    
    // const players: Player[] = [player1, player2, player3, player4, player5];
    // this.tournament = new Tournament(players);
    this._game = new Game(player1, player2);
    this._game.launch();
  }
  

  firstUpdated () {
    this._game/* .start() */;
  }
  
  render () {
    return html`
    <div class="game">
    <p>Pong Game Component</p>
    </div>
    `;
  }

  static styles = css`
  
  .game {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative; /* Assurez-vous que le positionnement est relatif */
    width: 100%;
    height: 50vh;
    }
    `;
}

// Enregistrement du composant avec une balise personnalisée
//customElements.define('pong-game', PongGame);
declare global {
  interface HTMLElementTagNameMap {
	  'game-component': oneVSone;
  }
}