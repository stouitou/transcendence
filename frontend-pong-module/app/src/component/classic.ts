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
	createRenderRoot () {
		// Désactive le shadow DOM, le rendu se fait dans le DOM ight
		return this;
	}

// LitElement automatically create a shadow DOM
	@property({ type: String }) gameContainerId: string = 'gameWrapper';
	@property({ type: Object }) data: {id: string} | null = null;

	private	_game!: Match;

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

	firstUpdated () {
		console.log('firstUpdated: DOM is ready');

		const	gameCanvas = this.querySelector('#gameCanvas') as HTMLCanvasElement;
		const	gameDivUi = this.querySelector('#game-ui') as HTMLElement;
		const	gameDivAlert = this.querySelector('#alertBox') as HTMLElement;
		const	gameDivHero = this.querySelector('#gameHero') as HTMLElement;
		const	gameDivHeroTree = this.querySelector('#gameHeroTree') as HTMLElement;

		if (!gameCanvas || !gameDivUi || !gameDivAlert || !gameDivHero || !gameDivHeroTree) {
			throw new Error ('One or more game DOM nodes not found');
		}

		gameDivAlert.style.display = 'none';

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
			<div class="game-container" style="width: ${CANVAS_WIDTH}px; height: ${CANVAS_HEIGHT}px;">

				<!-- Partie superieur : UI -->
				<div class="ui game-ui" id="game-ui">
					<h1>Game UI</h1>
				</div>
				
				<!-- Partie inferieure : canvas -->
				<div class="ui game-canvas">
					<canvas class="canvas" id="gameCanvas"></canvas>
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
