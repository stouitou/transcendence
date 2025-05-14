import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Match } from '../entities/Match';

export let CANVAS_WIDTH = 800;
export let CANVAS_HEIGHT = 600;

// Export 'game-component' as a tagname in HTML
@customElement('game-component')
export class	classic extends LitElement {
	@property({ type: String }) gameContainerId: string = 'gameWrapper';
	@property({ type: Object }) data: { id: string } | null = null;

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

	constructor ()	{ super(); console.log('game component constructor') }

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

		this._game = new Match();
		this._game.webSocketManager.lobyId = this.data?.id;
	}

	firstUpdated () {
		console.log('firstUpdated: DOM is ready');

		const	gameCanvas = this.shadowRoot?.querySelector('#gameCanvas') as HTMLCanvasElement;
		if (!gameCanvas) {
			throw new Error ('Game canvas not found');
		}
		const	gameDivUi = this.shadowRoot?.querySelector('#game-ui') as HTMLElement;
		if (!gameDivUi) {
			throw new Error ('Game UI not found');
		}
		const	gameDivAlert = this.shadowRoot?.querySelector('#alertBox') as HTMLElement;
		if (!gameDivAlert) {
			throw new Error ('Game UI alert not found');
		}
		const	gameDivHero = this.shadowRoot?.querySelector('#gameHero') as HTMLElement;
		if (!gameDivHero) {
			throw new Error ('Game hero not found');
		}
		const	gameDivHeroTree = this.shadowRoot?.querySelector('#gameHeroTree') as HTMLElement;
		if (!gameDivHeroTree) {
			throw new Error ('Game hero tree not found');
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
		// this._game.clear();
		// this._game.removeRemoteMovementListener();
	}
}

// Save the component with a customize tagname
declare global {
	interface HTMLElementTagNameMap {
		'game-component': classic;
	}
}
