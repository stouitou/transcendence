import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { Player } from '../entities/Player.js';
import { Tournament } from '../entities/Tournament.js';

@customElement('game-component')
export class PongGame extends LitElement {
	private game:Tournament;
	constructor() {
		super();
	//	this.game = new Game();
    
    const player1 = new Player({_name:"Olivier1"});
    const player2 = new Player({_name:"Sarah2"});
    const player3 = new Player({_name:"Pierre3"});
    const player4 = new Player({_name:"Bess4"});
    const player5 = new Player({_name:"Paul5"});
    
    const players: Player[] = [player1, player2, player3, player4, player5];
    
    // const game = new Game(player1, player2);
    // game.launch();
    this.game = new Tournament(5, players);
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