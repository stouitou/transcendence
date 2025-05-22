import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Match } from '../entities/Match';

export let CANVAS_WIDTH = 800;
export let CANVAS_HEIGHT = 600;

/* ────────────────────────────────────────── */
/*				<game-component>	 		  */
/* ────────────────────────────────────────── */
@customElement('game-component')
export class	classic extends LitElement {
// LitElement automatically create a shadow DOM
	@property({ type: String }) gameContainerId: string = 'gameWrapper';
	@property({ type: Object }) data: {id: string} | null = null;

	private	_game!: Match;

	static	styles = css `
		.game-container {
			position:		relative;
			width:			${CANVAS_WIDTH}px;
			height:			${CANVAS_HEIGHT}px;
			margin:			0 auto;
			margin-top:		20px;
			display:		flex;
			flex-direction:	column;
		}
		.game-ui {
			flex:				1;
			display:			flex;
			justify-content:	center;
			align-items:		center;
		}
		.game-canvas {
			flex:				1;
			display:			flex
			justify-content:	center;
			align-items:		center;
		}
		.canvas {
			width:	100%;
			height:	100%;
		}
		.alert {
			position:		absolute;
			top:			50%;
			left:			50%;
			transform:		translate(-50%, -50%);
			min-width:		200px;
			max-width:		300px;
			padding:		16px;
			color:			white;
			font-size:		18px;
			text-align:		center;
			border-radius:	8px;
			z-index:		1000;
			display:		none;
		}
		.player-score {
			position:		relative;
			display:		flex;
			justify-items:	space-between;
			align-items:	space-between;
			width:			80%;
			height:			auto;
			margin:			5px;
		}
		.score-cell {
			padding:	0;
		}
		.score-cell.score-cell-points {
			padding:	0 20px;
		}
		.alert.show {
			display:	block;
		}
	`

	constructor () {
		super();
		console.log('game component constructor')
	}

	set params (params: { id: string })	{ this.data = params; }

	/* Lifecycle methods
		- connectedCallback: Called when the element is added to the DOM
		- firstUpdated: Called the element is first rendered
		- updated: Called after the element is updated
		- disconnectCallback: Called when the element is removed from the DOM
	*/

	connectedCallback () : void {
		super.connectedCallback();
		console.log('ConnectedCallback: Component added to the DOM');

		/* turn OFF the colourful-ball background */
		this.hideBackground();

		this._game = new Match();
		this._game.webSocketManager.lobyId = this.data?.id;
	}

	firstUpdated() {
		console.log('firstUpdated: DOM is ready');

		const gameCanvas = this.shadowRoot?.querySelector('#gameCanvas') as HTMLCanvasElement;
		const gameDivUi = this.shadowRoot?.querySelector('#game-ui') as HTMLElement;
		const gameDivAlert = this.shadowRoot?.querySelector('#alertBox') as HTMLElement;
		const gameDivHero = this.shadowRoot?.querySelector('#gameHero') as HTMLElement;
		const gameDivHeroTree = this.shadowRoot?.querySelector('#gameHeroTree') as HTMLElement;

		if (!gameCanvas || !gameDivUi || !gameDivAlert || !gameDivHero || !gameDivHeroTree) {
			throw new Error('One or more game DOM nodes not found');
		}

		/* Set the canvas and UI elements in the game instance */
		this._game.setCanvas(gameCanvas);
		this._game.setGameUI(gameDivUi);
		this._game.setGameAlert(gameDivAlert);
		this._game.setGameHero(gameDivHero);
		this._game.setGameHeroTree(gameDivHeroTree);

		this._game.webSocketManager.connect();
	}

	render () {
		console.log('render: Rendering the component');

		return html `
			<div id="gameHero"></div>
			<div id="gameHeroTree"></div>
			<div class="game-container">

				<!-- Partie superieur : UI -->
				<div class="game-ui" id="game-ui">
					<h1>Game UI</h1>
				</div>
				
				<!-- Partie inferieure : canvas -->
				<div class="game-canvas">
					<canvas id="gameCanvas"></canvas>
				</div>

				<!-- Message d'alerte -->
				<div class="alert" id="alertBox"></div>
			</div>
		`;
	}

	disconnectedCallback () {
		console.log('disconnectedCallback: Component removed from the DOM');
		this._game?.stop();
		this._game.removeRemoteMovementListener();

		/* restore the colourful-ball background */
		this.showBackground();

		super.disconnectedCallback();
	}

	/* ---------- background helpers ---------- */
	private hideBackground () : void {
		const	bg = document.querySelector('background-canvas-component');
		if (bg)	{ (bg as HTMLElement).style.display = 'none'; }
	}

	private showBackground () : void {
		const	bg = document.querySelector('background-canvas-component');
		if (bg)	{ (bg as HTMLElement).style.display = ''; }
	}
}

// Save the component with a customize tagname
declare global {
	interface HTMLElementTagNameMap {
		'game-component': classic;
	}
}

export function setCanvasSize (width: number, height: number) {
	CANVAS_WIDTH = width;
	CANVAS_HEIGHT = height;
}
