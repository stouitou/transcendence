import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Match } from '../entities/Match';

export let CANVAS_WIDTH = 800;
export let CANVAS_HEIGHT = 600;

/* ────────────────────────────────────────── */
/* <game-component>                           */
/* ────────────────────────────────────────── */
@customElement('game-component')
export class  classic extends LitElement {
// LitElement automatically create a shadow DOM
	@property({ type: String }) gameContainerId: string = 'gameWrapper';
	@property({ type: Object }) data: {id: string} | null = null;

	private	_game!: Match;

	static	styles = css`
        /* ---------- outer layout wrappers ---------- */
        /* ────────────────────────────────────────────────────────────────────────── */
        /* 1) GAME CONTAINER & CANVAS                                                    */
        /* ────────────────────────────────────────────────────────────────────────── */

        .game-container {
            position: relative;
            width: 1200px; /* use CANVAS_WIDTH if in a template literal */
            height: 1000px; /* use CANVAS_HEIGHT */
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
        /* 3) SCOREBOARD (UPPER UI) & PLAYER CHIPS                                    */
        /* ────────────────────────────────────────────────────────────────────────── */

        .game-ui {
            display: flex;
            justify-content: center;
            align-items: center;
            margin-bottom: 40px;
        }

        .game-ui > div {
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
            gap: 12px;
            padding: 8px 22px;
            background: rgba(255, 255, 255, 0.9);
            border: 1px solid #e4e4e4;
            border-radius: 9999px;
            box-shadow: 0 4px 14px rgba(0, 0, 0, 0.10);
            max-width: 320px;
        }

        .score-cell {
            margin: 0;
            font-weight: 600;
            color: #472525;
            padding: 0;
        }

        .score-cell.score-cell-points {
            font-weight: 800;
            color: #3a1212;
            background: rgba(234, 69, 93, 0.13);
            padding: 4px 16px;
            border-radius: 9999px;
        }

        /* ────────────────────────────────────────────────────────────────────────── */
        /* 4) HERO & TREE PANELS                                                       */
        /* ────────────────────────────────────────────────────────────────────────── */

        /* ────────────────────────────────────────────────────────────────────────── */
        /* 4) HERO & TREE PANELS – Revised “Dusk-Glow” Style                          */
        /* ────────────────────────────────────────────────────────────────────────── */

        #gameHero,
        #gameHeroTree {
            width: 100%;
            max-width: 720px;
            margin: 0 auto 48px;
            padding: 24px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;

            /* softer off-white plus a tiny top-to-bottom gradient */
            background: linear-gradient(
                    180deg,
                    rgba(255, 255, 255, 0.09) 0%,
                    rgba(250, 245, 240, 0.13) 100%
            );
            border: 1px solid rgba(0, 0, 0, 0.08);
            border-radius: 14px;

            /* stronger, but more diffuse shadow for depth */
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04),
            0 12px 24px rgba(0, 0, 0, 0.08);

            /* optional glassy blur behind if you want a subtle backdrop-filter */
            backdrop-filter: blur(4px);
        }

     
        #gameHero:empty {
            display: none;
        }

        #gameHero:empty {
            display: block;        
            background: none;       
            box-shadow: none;
        }

        #gameHero:empty::before {
            content: "No players to beat. Launch the game and try one more time.";
            display: block;
            padding: 24px;
            font-size: 1rem;
            color: #666;
            text-align: center;
        }

        #gameHero h3,
        #gameHeroTree h3 {
            margin: 0;
            font-size: 1.75rem;
            font-weight: 700;
            color: #222;
            text-align: center;
        }

        /* Hero row: names + VS */

        .hero-row,
        .hero-vs {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 16px;
            margin-top: 12px;
        }

        /* VS text gets a pop of your accent color */

        .vs-text {
            font-size: 1.25rem;
            font-weight: 700;
            color: #0077cc; /* or swap to your DESIGN.accentColor */
        }

        /* Name chips get a lighter hue and subtle inner shadow */

        .chip,
        .mini-chip {
            background: rgba(255, 255, 255, 0.7);
            padding: 8px 16px;
            border-radius: 9999px;
            font-weight: 600;
            color: #333;
            white-space: nowrap;

            /* tiny embossed effect */
            box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
        }

        /* Mini-chips slightly smaller */

        #gameHeroTree .mini-chip {
            padding: 6px 12px;
            font-size: 0.875rem;
        }


        /* ────────────────────────────────────────────────────────────────────────── */
        /* 5) UTILITY CLASSES                                                         */
        /* ────────────────────────────────────────────────────────────────────────── */

        .text-center {
            text-align: center;
        }

        .flex-center {
            display: flex;
            align-items: center;
            justify-content: center;
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

		/* turn OFF the colourful-ball background */
		this.hideBackground();

		this._game = new Match();
		this._game.webSocketManager.lobyId = this.data?.id;
	}

	firstUpdated() {
		console.log('firstUpdated: DOM is ready');

		const gameCanvas   = this.shadowRoot?.querySelector('#gameCanvas')  as HTMLCanvasElement;
		const gameDivUi    = this.shadowRoot?.querySelector('#game-ui')     as HTMLElement;
		const gameDivAlert = this.shadowRoot?.querySelector('#alertBox')    as HTMLElement;
		const gameDivHero  = this.shadowRoot?.querySelector('#gameHero')    as HTMLElement;

		if (!gameCanvas || !gameDivUi || !gameDivAlert || !gameDivHero) {
			throw new Error('One or more game DOM nodes not found');
		}

		/* Set the canvas and UI elements in the game instance */
		this._game.setCanvas(gameCanvas);
		this._game.setGameUI(gameDivUi);
		this._game.setGameAlert(gameDivAlert);
		this._game.setGameHero(gameDivHero);

		this._game.webSocketManager.connect();
	}

	render () {
		console.log('render: Rendering the component');

		return html `
			<div id="gameHero"></div>
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

	private hideBackground (): void {
		const bg = document.querySelector('background-canvas-component');
		if (bg) { (bg as HTMLElement).style.display = 'none'; }

		// force black at the very root, *and* show your JPG
		document.documentElement.style.backgroundColor = 'black';
		document.documentElement.style.backgroundImage = 'url("/uploads/bg3.png")';
		document.documentElement.style.backgroundRepeat = 'no-repeat';
		document.documentElement.style.backgroundSize = 'cover';
		document.documentElement.style.backgroundPosition = 'center';

		// if body covers the html, give it the same
		document.body.style.backgroundColor   = "";  // clear your white fallback
		document.body.style.backgroundImage   =
			`linear-gradient(
     rgba(255,255,255,0.8),    /* 50% white fade */
     rgba(255,255,255,0.8)
   ), 
   url("/uploads/bg10.png")`;

		document.body.style.backgroundRepeat  = "no-repeat";
		document.body.style.backgroundSize    = "cover";
		document.body.style.backgroundPosition= "center";
	}

	private showBackground (): void {
		const   bg = document.querySelector('background-canvas-component');
		if (bg) { (bg as HTMLElement).style.display = ''; }

		// restore original page styles
		document.documentElement.style.backgroundColor = '';
		document.documentElement.style.backgroundImage = '';
		document.documentElement.style.backgroundRepeat = '';
		document.documentElement.style.backgroundSize = '';
		document.documentElement.style.backgroundPosition = '';

		document.body.style.backgroundColor = '';
		document.body.style.backgroundImage = '';
		document.body.style.backgroundRepeat = '';
		document.body.style.backgroundSize = '';
		document.body.style.backgroundPosition = '';
	}
}

// Save the component with a customize tagname
declare global {
	interface HTMLElementTagNameMap {
		'game-component': classic;
	}
}

export function setCanvasSize (width: number, height: number) {
	CANVAS_WIDTH = 1200;
	CANVAS_HEIGHT = 1000;
}
