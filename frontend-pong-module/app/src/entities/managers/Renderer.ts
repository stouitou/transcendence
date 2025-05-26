import { Ball } from '../Ball';
import { Player } from '../Player';
import * as Design from "../Design";
import { StatisticsManager } from './StatisticsManager';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../../component/classic';
export class	Renderer {

	private	_canvas: HTMLCanvasElement | null = null;
	private	_ctx: CanvasRenderingContext2D | null = null;
	private	_gameUi: HTMLElement | null = null;
	private _gameHero: HTMLElement | null = null;
	private	_gameHeroTree: HTMLElement | null = null;

	private	_score!: HTMLDivElement;
	private _gameAlert: HTMLElement | null = null;

	constructor () { }

	/* ---------- getters / setters UI ---------- */
	get gameCanvas () : HTMLCanvasElement | null	{ return this._canvas ; }
	get gameDivUi () : HTMLElement | null			{ return this._gameUi ; }
	get gameDivAlert () : HTMLElement | null		{ return this._gameAlert ; }

	set canvas (canvas: HTMLCanvasElement)	{ this._canvas = canvas; this._ctx = canvas?.getContext('2d')!; }
	set gameUi (div: HTMLElement)			{ this._gameUi = div; }
	set gameAlert (div: HTMLElement)		{ this._gameAlert = div; }
	set gameHero (div: HTMLElement)			{ this._gameHero = div; }
	set gameHeroTree (div: HTMLElement)		{ this._gameHeroTree = div; }


	private displayScore (Players: Player[] = []) {
		this._score.innerHTML = '';
		Players.forEach((player,index) => {
			const	divPlayerScore = this.createDivDisplayScore(player.name, player.score, index);
			this._score.appendChild(divPlayerScore);
		});
	}


	createDivDisplayScore (playerName: string, playerScore: number, indexLocation: number) {
		const	setGrid	= [
			{ gridCol:"3", gridRow:"2" }, { gridCol:"1", gridRow:"2" },
			{ gridCol:"2", gridRow:"3" }, { gridCol:"2", gridRow:"1" },
		]
		const	divPlayerScore = document.createElement('div');

		divPlayerScore.classList.add('player-score');
		divPlayerScore.innerHTML = `
			<p class="score-cell">${playerName}</p>
			<p class="score-cell score-cell-points">${playerScore}</p>`;
		const	{gridCol, gridRow} = setGrid[indexLocation];
		divPlayerScore.style.gridColumn = gridCol;
		divPlayerScore.style.gridRow = gridRow;
		return divPlayerScore ;
	}

	/* setup inital Display */
	setupDisplay () {
		if (!this._canvas)	{ throw new Error('Game canvas not found'); }

		this._canvas.style.verticalAlign = 'top';
		this._canvas.height = CANVAS_HEIGHT;
		// if (this._players.length > 2)
		// 	CANVAS_WIDTH = 500;
		this._canvas.width = CANVAS_WIDTH;

		this._score = Design.createAppendix(/* this._players.length */4 - 1);

		this._score.style.width = '100%';
		this._score.style.height = '100%';
		this._gameUi!.innerHTML = '';
		this._gameUi?.appendChild(this._score);

		Design.drawBackground(this._ctx);
	}

	// affiche un nombre sous forme de countdown	@param countdown	@returns
	renderCountdown(countdown: number) {
		if (!this._ctx || !this._canvas)	{ console.error('Game context is not set.'); return ; }

		this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
		Design.drawBackground(this._ctx);
		Design.drawCountdownFrame(this._ctx, countdown.toString());
	}

	render (players: Player[]) {//@TODO a renommer
		this.setupDisplay();
		this.displayScore(players);
	}

	draw (ball: Ball, players: Player[]) {
		this.clear();

		Design.drawBackground(this._ctx);

		this.drawBall(ball);		// draw ball
		players.forEach(player => {	// draw paddles
			if (player.paddle)	{ this.drawPaddle(player.paddle.position, player.paddle.size); }
		});

		this.displayScore(players);
	}

	private clear () {
		if (!this._ctx || !this._canvas) { console.error('Game context is not set.'); return; }	// if context is undefined, impossible to clear canvas
			this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
	}

	private drawBall(ball: Ball) {
		if (!this._ctx) return;
		const ctx = this._ctx;

		const r = ball.size.width;   // radius
		const x = ball.position.x;   // center X
		const y = ball.position.y;   // center Y

		// 1) build fancy radial gradient
		const g = ctx.createRadialGradient(
			x - r * 0.4, y - r * 0.4, r * 0.1,
			x,            y,            r
		);
		g.addColorStop(0,   "#ffffff");                // bright core
		g.addColorStop(0.25, Design.DESIGN.accentColor); // your accent
		g.addColorStop(1,   "rgba(228,0,27,0.35)");                // deep edge


		// 2) shadow/glow behind the ball
		ctx.save();
		ctx.shadowColor = Design.DESIGN.accentColor;
		ctx.shadowBlur  = 12;
		ctx.shadowOffsetX = 0;
		ctx.shadowOffsetY = 0;

		// 3) blur-pass for extra bloom
		ctx.filter = "blur(2px)";

		ctx.beginPath();
		ctx.arc(x, y, r, 0, Math.PI * 2);
		ctx.fillStyle = g;
		ctx.fill();
		ctx.restore();

		// 4) main fill without filter to sharpen
		ctx.save();
		ctx.beginPath();
		ctx.arc(x, y, r, 0, Math.PI * 2);
		ctx.fillStyle = g;
		ctx.fill();
		ctx.restore();

		// 5) inner specular highlight
		ctx.save();
		ctx.fillStyle = "rgba(255,255,255,0.6)";
		ctx.beginPath();
		ctx.ellipse(
			x - r * 0.35, y - r * 0.35,
			r * 0.2,      r * 0.12,
			0,           0,           Math.PI * 2
		);
		ctx.fill();
		ctx.restore();

		// 6) edge stroke for definition
		ctx.save();
		ctx.lineWidth   = 2;
		ctx.strokeStyle = "rgba(255,255,255,0.2)";
		ctx.beginPath();
		ctx.arc(x, y, r - 1, 0, Math.PI * 2);
		ctx.stroke();
		ctx.restore();
	}




	private drawPaddle(position: { x: number; y: number }, size: { width: number; height: number }) {
		Design.drawPaddle(
			this._ctx!,
			position.x,
			position.y,
			size.width,
			size.height
		);
	}


	renderGameHeroDiv(data: PREPARE_MATCHES_STARTED_ROUND_GAME) {
		const div = this._gameHero as HTMLDivElement;
		if (!div) return;

		// wipe & re-render
		div.innerHTML = '';
		displayPrepareMatchesStartedRoundGame(div, data);

		// completely remove the container after 5s (no empty frame)
		setTimeout(() => div.remove(), 5000);
	}

	renderGameHeroTreeDiv(data: PREPARE_MATCHES_STARTED_ROUND[]) {
		const div = this._gameHeroTree as HTMLDivElement;
		if (!div) return;

		// wipe & re-render
		div.innerHTML = '';
		displayPrepareMatchesStartedTournament(div, data);

		// completely remove the container after 5s
		setTimeout(() => div.remove(), 5000);
	}


	displayHistoriqueGame(statisticsManager: StatisticsManager, players: Player[]) {
		const menu = document.createElement('div');

		// ─── PANEL LAYOUT ────────────────────────────────────────────
		Object.assign(menu.style, {
			position:       'absolute',
			top:            '50%',
			left:           '50%',
			transform:      'translate(-50%, -50%)',
			width:          '320px',            // wider to fit all text
			padding:        '16px 24px',
			background:     'rgba(255,255,255,0.6)',
			backdropFilter: 'blur(4px)',
			border:         '1px solid rgba(0,0,0,0.05)',
			borderRadius:   '12px',
			boxShadow:      '0 4px 12px rgba(0,0,0,0.06)',
			fontFamily:     'Inter, Arial, sans-serif',
			fontSize:       '14px',
			lineHeight:     '1.5',
			color:          '#333',
			textAlign:      'left',
			overflow:       'visible',         // show all at once
			zIndex:         '1000',
		} as Partial<CSSStyleDeclaration>);

		// ─── LOBBY BUTTON (top) ─────────────────────────────────────
		menu.innerHTML = `
    <div style="text-align:right; margin-bottom:12px;">
      <a
        href="https://localhost:4433/game-loby"
        style="
          display:inline-block;
          padding:6px 12px;
          background:rgba(200,230,255,0.7);
          color:#333;
          text-decoration:none;
          border-radius:6px;
          font-weight:600;
          box-shadow:0 2px 8px rgba(0,0,0,0.08);
        "
      >
        ◀ Retour au Lobby
      </a>
    </div>
    <ul style="list-style:none; padding:0; margin:0;">
      <li><strong>Rebonds max :</strong> ${statisticsManager._gameHistory.maxBounceCount}</li>
      <li>
        <strong>Plus de buts encaissés :</strong>
        ${statisticsManager._gameHistory.mostGoalsConcededPlayer.name}
        (${statisticsManager._gameHistory.mostGoalsConcededPlayer.goalsConceded})
      </li>
      ${players.map(p =>
			`<li><strong>${p.name} rebonds :</strong> ${p.totalBouncesPerPlayer}</li>`
		).join("")}
    </ul>
  `;

		this._gameAlert?.appendChild(menu);
		this._gameAlert?.classList.add('show');
	}





}


/* -------------------------------------------------------------------------- */
/*  Public DTOs – keep identical to back‑end payloads, but no duplicates!       */
/* -------------------------------------------------------------------------- */

export interface PrepareMatchGame {
	id: string;
	players: Player[];            // imported Player model
	gameHistoryId: number;
	gameId: number;
	winner: Player | null;
	isFinished: boolean;
}

export interface PrepareMatchRound {
	round: number;
	matches: PrepareMatchGame[];
}

export type PREPARE_MATCHES_STARTED_ROUND_GAME = PrepareMatchGame;
export type PREPARE_MATCHES_STARTED_ROUND      = PrepareMatchRound;

/* -------------------------------------------------------------------------- */
/*  Chip factories                                                             */
/* -------------------------------------------------------------------------- */

// Large pill for hero card
// Large pill for hero card
const heroChip = (p: Player) => `
  <div class="chip hero-chip">
    <span class="name">${p.name}</span>
  </div>`;

const miniChip = (p: Player) => `
  <div class="chip mini-chip">
    <span class="name">${p.name}</span>
  </div>`;


/* -------------------------------------------------------------------------- */
/*  Single‑game hero card                                                      */
/* -------------------------------------------------------------------------- */

export function displayPrepareMatchesStartedRoundGame(
	div: HTMLDivElement,
	data: PrepareMatchGame,
): void {
	// debug banner so you *see* the right bundle
	console.log("💎 Chips UI active – hero card", data.id);

	const { players, winner } = data;

	div.innerHTML = `
    <section class="mx-auto max-w-screen-md px-4 sm:px-6 lg:px-8">
      <div class="rounded-2xl bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md shadow-lg ring-1 ring-black/5 p-8 text-center space-y-10">
        <div class="flex flex-wrap justify-center items-center gap-6">
          ${players.filter((_, i) => i % 2 === 0).map(heroChip).join("")}
          <span class="text-3xl font-extrabold text-blue-600 select-none">VS</span>
          ${players.filter((_, i) => i % 2 === 1).map(heroChip).join("")}
        </div>

        ${winner ? `<p class="text-base font-medium text-emerald-600">Winner: <span class="font-semibold">${winner.name}</span></p>` : ""}
      </div>
    </section>`;
}

/* -------------------------------------------------------------------------- */
/*  Tournament tree                                                            */
/* -------------------------------------------------------------------------- */

export function displayPrepareMatchesStartedTournament(
	div: HTMLDivElement,
	data: PrepareMatchRound[],
): void {
	console.log("🌳 Chips UI active – tournament tree (rounds)");

	div.innerHTML = `
    <div class="space-y-4">
      ${data
		.map(
			(round, idx) => `
            <details${idx === 0 ? " open" : ""} class="rounded-xl overflow-hidden ring-1 ring-gray-200 dark:ring-zinc-700 shadow-sm">
              <summary class="cursor-pointer select-none px-4 py-2 bg-gray-50 dark:bg-zinc-800 font-medium">
                Round ${idx + 1}
              </summary>
              <div class="px-4 py-4 space-y-6 bg-white dark:bg-zinc-900">
                ${round.matches
				.map(
					(match) => `
                      <div class="flex flex-wrap justify-center items-center gap-3">
                        ${match.players.map(miniChip).join("")}
                      </div>`
				)
				.join("")}
              </div>
            </details>`
		)
		.join("")}
    </div>`;
}

