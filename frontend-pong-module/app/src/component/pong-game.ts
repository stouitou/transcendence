import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { Player } from '../entities/Player.js';
// import { Tournament } from '../entities/Tournament.js';
import { Game } from '../entities/Game.js';

@customElement('game-component')
export class PongGame extends LitElement {
	private game:Game;
	// private tournament:Tournament;
	constructor(canvas: HTMLCanvasElement) {
		super();
	//	this.game = new Game();
    
    const player1 = new Player("Olivier1");
    const player2 = new Player("Sarah2");
    // const player3 = new Player("Pierre3");
    // const player4 = new Player("Bess4");
    // const player5 = new Player("Paul5");
    
    // const players: Player[] = [player1, player2, player3, player4, player5];
    
    this.game = new Game(canvas, player1, player2);
    this.game.launch();
    // this.game = new Tournament(players);
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
  firstUpdated() {
    this.game/* .start() */;
  }
  render() {
    return html`
      <div class="game">
        <p>Pong Game Component</p>
      </div>
    `;
  }
}

// Enregistrement du composant avec une balise personnalisée
//customElements.define('pong-game', PongGame);

declare global {
  interface HTMLElementTagNameMap {
	'game-component': PongGame
  }
}