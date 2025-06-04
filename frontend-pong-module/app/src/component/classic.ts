import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Match } from '../entities/Match';

export let CANVAS_WIDTH = 800;
export let CANVAS_HEIGHT = 600;

/* ────────────────────────────────────────── */
/* <game-component>                           */
/* ────────────────────────────────────────── */
@customElement('game-component')
export class classic extends LitElement {
	@property({ type: String }) gameContainerId: string = 'gameWrapper';
	@property({ type: Object }) data: { id: string } | null = null;

	private _game!: Match;

	// ─── Arrow‐key handler reference ─────────────────────────────────────
	// We store the bound function reference so we can remove it in disconnectedCallback().
	private _onKeyDown = (e: KeyboardEvent) => {
		// Only intercept the four arrow keys:
		if (
			e.key === 'ArrowLeft' ||
			e.key === 'ArrowRight' ||
			e.key === 'ArrowUp' ||
			e.key === 'ArrowDown'
		) {
			e.preventDefault();
			// Forward to your game logic here, if desired. For example:
			// this._game.handleArrowKey(e.key);
		}
	};

	static styles = css`
		/* ────────────────────────────────────────────────────────────────────────── */
		/* 1) GAME CONTAINER & CANVAS                                                    */
		/* ────────────────────────────────────────────────────────────────────────── */

		.game-container {
			position: relative;
			width: 1200px;
			height: 1000px;
			margin: 20px auto 0;
			display: flex;
			flex-direction: column;
		}

		.game-canvas {
			flex: 1;
			display: flex;
			justify-content: center;
			align-items: center;
		}

		canvas#gameCanvas {
			width: 100%;
			height: 100%;
			display: block;
		}

		/* ────────────────────────────────────────────────────────────────────────── */
		/* 2) ALERT POPUP                                                             */
		/* ────────────────────────────────────────────────────────────────────────── */

		.alert {
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			min-width: 200px;
			max-width: 300px;
			padding: 16px;
			color: #fff;
			background: rgba(0, 0, 0, 0.7);
			font-size: 18px;
			text-align: center;
			border-radius: 8px;
			z-index: 1000;
			display: none;
		}

		.alert.show {
			display: block;
		}

		/* ────────────────────────────────────────────────────────────────────────── */
		/* 3) HERO CARD (SINGLE‐MATCH)                                                  */
		/* ────────────────────────────────────────────────────────────────────────── */

		#gameHero {
			width: 100%;
			max-width: 720px;
			margin: 0 auto 24px;
			padding: 24px;
			display: none; /* hidden when empty */
			flex-direction: column;
			align-items: center;
			gap: 16px;

			/* light transparent background */
			background: rgba(255, 255, 255, 0.6);
			border: 1px solid rgba(0, 0, 0, 0.08);
			border-radius: 14px;
			box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04),
			0 12px 24px rgba(0, 0, 0, 0.08);
			backdrop-filter: blur(4px);
		}

		#gameHero:empty {
			display: none;
		}

		/* The row that holds two hero‐chips and a VS */

		.hero-row {
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 32px;
			width: 100%;
		}

		.hero-chip {
			background: rgba(255, 255, 255, 0.9);
			padding: 12px 24px;
			border-radius: 9999px;
			font-weight: 700;
			font-size: 1.25rem;
			color: #333;
			box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
		}

		.vs-text {
			font-size: 1.5rem;
			font-weight: 800;
			color: rgba(128, 34, 34, 0.63);
		}

		/* ────────────────────────────────────────────────────────────────────────── */
		/* 4) TOURNAMENT TREE (MULTI‐ROUND)                                             */
		/* ────────────────────────────────────────────────────────────────────────── */

		#gameHeroTree {
			width: 100%;
			max-width: 720px;
			margin: 0 auto 24px;
			padding: 0 16px 24px;
			display: none; /* hidden when empty */
			gap: 12px;
		}

		#gameHeroTree:empty {
			display: none;
		}

		#gameHeroTree details {
			background: rgba(255, 255, 255, 0.6);
			border: 1px solid rgba(0, 0, 0, 0.08);
			border-radius: 12px;
			box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
			margin-bottom: 8px;
			backdrop-filter: blur(4px);
		}

		#gameHeroTree summary {
			cursor: pointer;
			padding: 12px 16px;
			font-weight: 600;
			background: rgba(240, 240, 240, 0.8);
			border-bottom: 1px solid rgba(0, 0, 0, 0.05);
			outline: none;
		}

		/* When expanded, the content area */

		#gameHeroTree summary + div {
			padding: 12px 16px;
			background: rgba(255, 255, 255, 0.8);
		}

		/* Each match’s mini‐chips row */

		.mini-chip-row {
			display: flex;
			flex-wrap: wrap;
			justify-content: center;
			gap: 12px;
		}

		.mini-chip {
			background: rgba(255, 255, 255, 0.7);
			padding: 8px 16px;
			border-radius: 9999px;
			font-weight: 600;
			font-size: 0.95rem;
			color: #333;
			box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
			white-space: nowrap;
		}

		/* ────────────────────────────────────────────────────────────────────────── */
		/* 5) SCOREBOARD (UPPER UI) & PLAYER CHIPS                                    */
		/* ────────────────────────────────────────────────────────────────────────── */

		.game-ui {
			display: flex;
			justify-content: center;
			align-items: center;
			margin: 0 auto 24px;
			width: 500px;
			background: transparent;
			border-radius: 16px;
			padding: 20px 0;
		}

		.game-ui > .score-grid {
			display: grid !important;
			grid-template-areas:
        " top    top    top "
        " left   .   right"
        " bottom bottom bottom ";
			grid-template-columns: 1fr auto 1fr;
			grid-template-rows: auto 1fr auto;
			gap: 12px;
			align-items: center;
			justify-items: center;
			width: 100%;
			background: transparent !important;
			border: none !important;
			box-shadow: none !important;
			padding: 0 !important;
		}

		.game-ui > div:not(.score-grid) {
			background: transparent !important;
			border: none !important;
			box-shadow: none !important;
			width: auto !important;
			height: auto !important;
			padding: 0 !important;
			display: flex !important;
			flex-wrap: wrap;
			justify-content: center;
			align-items: center;
			gap: 24px;
		}

		.player-score {
			display: inline-flex;
			align-items: center;
			gap: 8px;
			padding: 6px 14px;
			background: rgba(255, 255, 255, 0.9);
			border: 1px solid rgba(0, 0, 0, 0.1);
			border-radius: 9999px;
			box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
			font-size: 0.95rem;
			max-width: 200px;
		}

		.player-score.top {
			grid-area: top;
		}

		.player-score.left {
			grid-area: left;
		}

		.player-score.right {
			grid-area: right;
		}

		.player-score.bottom {
			grid-area: bottom;
		}

		.score-cell {
			margin: 0;
			font-weight: 600;
			color: #472525;
			padding: 0;
			white-space: nowrap;
		}

		.score-cell.score-cell-points {
			font-weight: 700;
			color: #3a1212;
			background: rgba(234, 69, 93, 0.15);
			padding: 2px 12px;
			border-radius: 9999px;
			font-size: 0.9rem;
		}

		/* ────────────────────────────────────────────────────────────────────────── */
		/* 6) UTILITY CLASSES                                                         */
		/* ────────────────────────────────────────────────────────────────────────── */

		.text-center {
			text-align: center;
		}

		.flex-center {
			display: flex;
			align-items: center;
			justify-content: center;
		}
	`;

	constructor () {
		super();
		console.log('game component constructor');
	}

	set params (params: { id: string }) {
		this.data = params;
	}

	connectedCallback (): void {
		super.connectedCallback();
		console.log('ConnectedCallback: Component added to the DOM');

		// ─── Attach the arrow‐key listener here ─────────────────────────────────
		window.addEventListener('keydown', this._onKeyDown);

		this.hideBackground();
		this._game = new Match();
		this._game.webSocketManager.lobyId = this.data?.id;
	}

	firstUpdated () {
		console.log('firstUpdated: DOM is ready');

		const gameCanvas      = this.shadowRoot?.querySelector('#gameCanvas')  as HTMLCanvasElement;
		const gameDivUi       = this.shadowRoot?.querySelector('#game-ui')     as HTMLElement;
		const gameDivAlert    = this.shadowRoot?.querySelector('#alertBox')    as HTMLElement;
		const gameDivHero     = this.shadowRoot?.querySelector('#gameHero')    as HTMLElement;
		const gameDivHeroTree = this.shadowRoot?.querySelector('#gameHeroTree') as HTMLElement;

		if (!gameCanvas || !gameDivUi || !gameDivAlert || !gameDivHero || !gameDivHeroTree) {
			throw new Error('One or more game DOM nodes not found');
		}

		this._game.setCanvas(gameCanvas);
		this._game.setGameUI(gameDivUi);
		this._game.setGameAlert(gameDivAlert);
		this._game.setGameHero(gameDivHero);
		this._game.setGameHeroTree(gameDivHeroTree);   // ★ hook up tournament tree

		this._game.webSocketManager.connect();
	}

	render () {
		console.log('render: Rendering the component');
		return html`
			<!-- Single‐match hero card (hidden when empty) -->
			<div id="gameHero"></div>

			<!-- Tournament tree (hidden when empty) -->
			<div id="gameHeroTree"></div>

			<div class="game-container">
				<!-- Upper UI: scoreboard (initially empty) -->
				<div class="game-ui" id="game-ui"></div>

				<!-- Lower: canvas -->
				<div class="game-canvas">
					<canvas id="gameCanvas"></canvas>
				</div>

				<!-- Alert box -->
				<div class="alert" id="alertBox"></div>
			</div>
		`;
	}

	disconnectedCallback () {
		console.log('disconnectedCallback: Component removed from the DOM');
		window.removeEventListener('keydown', this._onKeyDown);
		this._game?.stop();
		this._game.removeRemoteMovementListener();
		this.showBackground();
		super.disconnectedCallback();
	}

	private hideBackground (): void {
		const	bg = document.querySelector('background-canvas-component');
		if (bg) { (bg as HTMLElement).style.display = 'none'; }

		document.documentElement.style.backgroundColor = 'black';
		document.documentElement.style.backgroundImage = 'url("/uploads/bg10.png")';
		document.documentElement.style.backgroundRepeat = 'no-repeat';
		document.documentElement.style.backgroundSize = 'cover';
		document.documentElement.style.backgroundPosition = 'center';
		document.body.style.backgroundColor = '';
		document.body.style.backgroundImage = `
			linear-gradient(
				rgba(255,255,255,0.8),
				rgba(255,255,255,0.8)
			), 
			url("/uploads/bg10.png")
		`;
		document.body.style.backgroundRepeat = 'no-repeat';
		document.body.style.backgroundSize = 'cover';
		document.body.style.backgroundPosition = 'center';
	}

	private showBackground (): void {
		const	bg = document.querySelector('background-canvas-component');
		if (bg) { (bg as HTMLElement).style.display = ''; }

		document.documentElement.style.backgroundColor = 'black';
		document.body.style.backgroundImage = `
			linear-gradient(
				rgba(255,255,255,0.8),
				rgba(255,255,255,0.8)
			), 
			url("/uploads/bg10.png")
		`;
		document.documentElement.style.backgroundRepeat = 'no-repeat';
		document.documentElement.style.backgroundSize = 'cover';
		document.documentElement.style.backgroundPosition = 'center';
		document.body.style.backgroundColor = '';
		document.body.style.backgroundImage = `
			linear-gradient(
				rgba(255,255,255,0.8),
				rgba(255,255,255,0.8)
			), 
			url("/uploads/bg10.png")
		`;
		document.body.style.backgroundRepeat = 'no-repeat';
		document.body.style.backgroundSize = 'cover';
		document.body.style.backgroundPosition = 'center';
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'game-component': classic;
	}
}

export function setCanvasSize(width: number, height: number) {
	CANVAS_WIDTH = width;
	CANVAS_HEIGHT = height;
}
