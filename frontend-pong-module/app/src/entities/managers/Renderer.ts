import { Ball } from '../Ball';
import { Player } from '../Player';
import * as Design from "../Design";
import { StatisticsManager } from './StatisticsManager';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../../component/classic';

export class Renderer {
	private _canvas: HTMLCanvasElement | null = null;
	private _ctx: CanvasRenderingContext2D | null = null;
	private _gameUi: HTMLElement | null = null;
	private _gameHero: HTMLElement | null = null;
	private _gameHeroTree: HTMLElement | null = null;

	// This will hold the single <div class="score-grid"> when the game is active
	private _score!: HTMLDivElement;
	private _gameAlert: HTMLElement | null = null;

	constructor() {}

	/* ---------- getters / setters UI ---------- */
	get gameCanvas(): HTMLCanvasElement | null { return this._canvas; }
	get gameDivUi(): HTMLElement | null       { return this._gameUi; }
	get gameDivAlert(): HTMLElement | null    { return this._gameAlert; }

	set canvas(canvas: HTMLCanvasElement)   { this._canvas = canvas; this._ctx = canvas.getContext('2d')!; }
	set gameUi(div: HTMLElement)            { this._gameUi = div; }
	set gameAlert(div: HTMLElement)         { this._gameAlert = div; }
	set gameHero(div: HTMLElement)          { this._gameHero = div; }
	set gameHeroTree(div: HTMLElement)      { this._gameHeroTree = div; }

	/**
	 * Called once when the game starts (or when you want to show the scoreboard).
	 * It:
	 *   1) Ensures the canvas is sized correctly.
	 *   2) Creates exactly one <div class="score-grid">.
	 *   3) Appends it into "#game-ui".
	 *   4) Draws the static background under the canvas.
	 */
	setupDisplay() {
		if (!this._canvas) { throw new Error('Game canvas not found'); }

		// Size the <canvas> element
		this._canvas.style.verticalAlign = 'top';
		this._canvas.height = CANVAS_HEIGHT;
		this._canvas.width  = CANVAS_WIDTH;

		// Create one <div class="score-grid"> container
		this._score = Design.createAppendix();
		this._score.classList.add('score-grid');

		// ── STRIP OUT ANY INLINE STYLES THAT createAppendix() ADDED ──
		this._score.removeAttribute('style');

		// Let CSS in the Lit component handle width/height/padding
		// (the CSS sets .score-grid { width:100%; … })
		// Optionally set them here anyway:
		// this._score.style.width  = '100%';
		// this._score.style.height = 'auto';

		// Clear out anything in #game-ui, then append our single .score-grid
		this._gameUi!.innerHTML = '';
		this._gameUi?.appendChild(this._score);

		// Draw static background (beneath canvas)
		Design.drawBackground(this._ctx);
	}

	/**
	 * Populates the single .score-grid with four <div class="player-score …"> bubbles.
	 * Each bubble is placed in one of the four grid areas: top / left / right / bottom.
	 */
	private displayScore(Players: Player[] = []) {
		// Clear any existing bubbles
		this._score.innerHTML = '';

		Players.forEach((player, index) => {
			const bubble = this.createDivDisplayScore(player.name, player.score, index);
			this._score.appendChild(bubble);
		});
	}

	/**
	 * Creates one <div class="player-score [top|left|right|bottom]"> with two <p> tags:
	 *   <p class="score-cell">PLAYER_NAME</p>
	 *   <p class="score-cell score-cell-points">PLAYER_SCORE</p>
	 *
	 * indexLocation maps as follows:
	 *   0 → "right"
	 *   1 → "left"
	 *   2 → "bottom"
	 *   3 → "top"
	 */
	createDivDisplayScore(playerName: string, playerScore: number, indexLocation: number) {
		const areaMap = ['right', 'left', 'bottom', 'top'];
		const areaClass = areaMap[indexLocation] || 'right';

		const divPlayerScore = document.createElement('div');
		divPlayerScore.classList.add('player-score', areaClass);

		divPlayerScore.innerHTML = `
      <p class="score-cell">${playerName}</p>
      <p class="score-cell score-cell-points">${playerScore}</p>
    `;
		return divPlayerScore;
	}

	/**
	 * Renders a countdown frame (e.g. "3", "2", "1") in the very center of the canvas.
	 */
	renderCountdown(countdown: number) {
		if (!this._ctx || !this._canvas) { console.error('Game context is not set.'); return; }

		// Clear entire canvas and redraw background
		this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
		Design.drawBackground(this._ctx);
		Design.drawCountdownFrame(this._ctx, countdown.toString());
	}

	/**
	 * Main draw loop. For each animation frame, call draw(...) with the Ball and Player[]:
	 *   1) Clear the canvas
	 *   2) Draw background
	 *   3) Draw the ball
	 *   4) Draw each paddle
	 *   5) Update the scoreboard bubbles
	 */
	draw(ball: Ball, players: Player[]) {
		this.clear();
		Design.drawBackground(this._ctx);

		// Draw the ball
		this.drawBall(ball);

		// Draw each player’s paddle
		players.forEach(player => {
			if (player.paddle) {
				this.drawPaddle(player.paddle.position, player.paddle.size);
			}
		});

		// Finally, refresh scoreboard bubbles
		this.displayScore(players);
	}

	/**
	 * Clears the entire HTML canvas area.
	 */
	private clear() {
		if (!this._ctx || !this._canvas) { console.error('Game context is not set.'); return; }
		this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
	}

	/**
	 * Draws a glossy ball with radial gradient, shadow, blur, highlight, and edge stroke.
	 */
	private drawBall(ball: Ball) {
		if (!this._ctx) { return; }

		const ctx = this._ctx;
		const r = ball.size.width;    // radius
		const x = ball.position.x;    // center X
		const y = ball.position.y;    // center Y

		// Create a radial gradient for a glossy effect
		const g = ctx.createRadialGradient(x - r * 0.4, y - r * 0.4, r * 0.1, x, y, r);
		g.addColorStop(0, "#ff768e");
		g.addColorStop(0.55, Design.DESIGN.accentColor);
		g.addColorStop(1, "#4c000d");
		ctx.fillStyle = g;

		// 2) Draw a blurred shadow/glow behind the ball
		ctx.save();
		ctx.shadowColor = Design.DESIGN.accentColor;
		ctx.shadowBlur   = 12;
		ctx.shadowOffsetX = 0;
		ctx.shadowOffsetY = 0;

		ctx.filter = "blur(2px)";
		ctx.beginPath();
		ctx.arc(x, y, r, 0, Math.PI * 2);
		ctx.fillStyle = g;
		ctx.fill();
		ctx.restore();

		// 4) Draw the ball again without blur to sharpen it
		ctx.save();
		ctx.beginPath();
		ctx.arc(x, y, r, 0, Math.PI * 2);
		ctx.fillStyle = g;
		ctx.fill();
		ctx.restore();

		// 5) Inner specular highlight
		ctx.save();
		ctx.fillStyle = "rgba(255,255,255,0.6)";
		ctx.beginPath();
		ctx.ellipse(
			x - r * 0.35, y - r * 0.35,
			r * 0.2, r * 0.12,
			0, 0, Math.PI * 2
		);
		ctx.fill();
		ctx.restore();

		// 6) Edge stroke for definition
		ctx.save();
		ctx.lineWidth = 2;
		ctx.strokeStyle = "rgba(255,255,255,0.2)";
		ctx.beginPath();
		ctx.arc(x, y, r - 1, 0, Math.PI * 2);
		ctx.stroke();
		ctx.restore();
	}

	/**
	 * Draws a single paddle at the given (x, y) position and (width, height) size.
	 */
	private drawPaddle(position: { x: number; y: number }, size: { width: number; height: number }) {
		Design.drawPaddle(
			this._ctx!,
			position.x,
			position.y,
			size.width,
			size.height
		);
	}

	/**
	 * Renders the “hero card” when a single‐match is prepared (one round game).
	 */
	renderGameHeroDiv(data: PREPARE_MATCHES_STARTED_ROUND_GAME) {
		const div = this._gameHero as HTMLDivElement;
		if (!div) return;

		// If there are no players, hide immediately
		if (!data.players || data.players.length === 0) {
			div.innerHTML = '';
			div.style.display = 'none';
			return;
		}

		// Build a <div class="hero-chip"> for each player,
		// and insert <span class="vs-text">VS</span> between them:
		const heroHtml = data.players
			.map((p) => `<div class="hero-chip">${p.name}</div>`)
			.join(`<span class="vs-text">VS</span>`);

		div.innerHTML = `
    <div class="hero-row">
      ${heroHtml}
    </div>
  `;
		div.style.display = 'flex';

		// Remove after 10s (optional)
		setTimeout(() => {
			div.innerHTML = '';
			div.style.display = 'none';
		}, 10000);
	}


	/**
	 * Renders the tournament tree view when a multi‐round tournament is prepared.
	 */
	renderGameHeroTreeDiv(data: PREPARE_MATCHES_STARTED_ROUND[]) {
		const div = this._gameHeroTree as HTMLDivElement;
		if (!div) return;

		// Build out a <details> for each round
		const roundsHtml = data
			.map((round, idx) => {
				// For each match in this round, render: [Chip A] VS [Chip B]
				const matchesHtml = round.matches
					.map((match) => {
						// If match.players has exactly two entries:
						const [pA, pB] = match.players;

						return `
              <div class="mini-chip-row">
                <div class="mini-chip">${pA.name}</div>
                <span class="vs-text">VS</span>
                <div class="mini-chip">${pB.name}</div>
              </div>
            `;
					})
					.join('');

				return `
          <details ${idx === 0 ? 'open' : ''}>
            <summary>Round ${idx + 1}</summary>
            <div>
              ${matchesHtml}
            </div>
          </details>
        `;
			})
			.join('');

		div.innerHTML = roundsHtml;
		div.style.display = 'block';  // un‐hide it

		// Auto‐hide after 5s (optional)
		setTimeout(() => {
			div.innerHTML = '';
			div.style.display = 'none';
		}, 5000);
	}


	/**
	 * Displays a historical statistics panel (max rebounds, most goals conceded, etc.).
	 */
	displayHistoriqueGame(statisticsManager: StatisticsManager, players: Player[]) {
		const menu = document.createElement('div');

		Object.assign(menu.style, {
			position:       'absolute',
			top:            '50%',
			left:           '50%',
			transform:      'translate(-50%, -50%)',
			width:          '320px',
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
			overflow:       'visible',
			zIndex:         '1000',
		} as Partial<CSSStyleDeclaration>);

		menu.innerHTML = `
      <div style="text-align:right; margin-bottom:12px;">
        <a
          href="/game"
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
        <li><strong>Rebonds max&nbsp;:</strong> ${statisticsManager._gameHistory.maxBounceCount}</li>
        <li>
          <strong>Plus de buts encaissés&nbsp;:</strong>
          ${statisticsManager._gameHistory.mostGoalsConcededPlayer.name}
          (${statisticsManager._gameHistory.mostGoalsConcededPlayer.goalsConceded})
        </li>
        ${players
        .map(
          p =>
            `<li><strong>${p.name} rebonds&nbsp;:</strong> ${p.history.bounceCount}</li>`
        )
        .join('')}
      </ul>
  `;

		/* ─── SHOW & AUTO-HIDE ─────────────────────────────────────── */
//        <li><strong>Rebonds max :</strong> ${statisticsManager._gameHistory.maxBounceCount}</li>
//        <li>
//          <strong>Plus de buts encaissés :</strong>
//          ${statisticsManager._gameHistory.mostGoalsConcededPlayer.name}
//          (${statisticsManager._gameHistory.mostGoalsConcededPlayer.goalsConceded})
//        </li>
//        ${players.map(p =>
//			`<li><strong>${p.name} rebonds :</strong> ${p.history.bounceCount}</li>`
//		).join('')}
//      </ul>
//    `;


		this._gameAlert?.appendChild(menu);
		this._gameAlert?.classList.add('show');

		// Hide after 5s
		setTimeout(() => {
			menu.remove();
			this._gameAlert?.classList.remove('show');
		}, 5000);
	}


		// hide banner after 5 s
		setTimeout(() => {
			menu.remove();
			this._gameAlert?.classList.remove('show');
		}, 5000);
	}
}

/* ------------------------------------------------------------ */
/*  Public DTOs – identical to back-end payloads                */
/* ------------------------------------------------------------ */
export interface PrepareMatchGame {
	id: string;
	players: Player[];
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
// export type PREPARE_MATCHES_STARTED_ROUND      = PrepareMatchRound;

/* -------------------------------------------------------------------------- */
/*  Chip factories                                                             */
/* -------------------------------------------------------------------------- */

// Large pill for hero card
const	heroChip = (p: Player) => `
  <div class="chip hero-chip">
    <span class="name">${p.name}</span>
  </div>`;

const	miniChip = (p: Player) => `
  <div class="chip mini-chip">
    <span class="name">${p.name}</span>
  </div>`;


/* -------------------------------------------------------------------------- */
/*  Single‑game hero card                                                      */
/* -------------------------------------------------------------------------- */

export function	displayPrepareMatchesStartedRoundGame(
	div: HTMLDivElement,
	data: PrepareMatchGame,
) : void {
	// debug banner so you *see* the right bundle
	console.log("💎 Chips UI active – hero card", data.id);

	const	{ players } = data;

	div.innerHTML = `
    <section class="mx-auto max-w-screen-md px-4 sm:px-6 lg:px-8">
      <div class="rounded-2xl bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md shadow-lg ring-1 ring-black/5 p-8 text-center space-y-10">
        <div class="flex flex-wrap justify-center items-center gap-6">
          ${players.filter((_, i) => i % 2 === 0).map(heroChip).join("")}
          <span class="text-3xl font-extrabold text-blue-600 select-none">VS </span>
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

export type PREPARE_MATCHES_STARTED_ROUND = PrepareMatchRound;

