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

	private _score!: HTMLDivElement;
	private _gameAlert: HTMLElement | null = null;

	constructor () { }

	/* ---------- getters / setters UI ---------- */
	get gameCanvas(): HTMLCanvasElement | null { return this._canvas; }
	get gameDivUi(): HTMLElement | null { return this._gameUi; }
	get gameDivAlert(): HTMLElement | null { return this._gameAlert; }

	set canvas(canvas: HTMLCanvasElement) { this._canvas = canvas; this._ctx = canvas?.getContext('2d')!; }
	set gameUi(div: HTMLElement) { this._gameUi = div; }
	set gameAlert(div: HTMLElement) { this._gameAlert = div; }
	set gameHero(div: HTMLElement) { this._gameHero = div; }
	set gameHeroTree(div: HTMLElement) { this._gameHeroTree = div; }


	private displayScore (Players: Player[] = []) {
		this._score.innerHTML = '';
		Players.forEach((player, index) => {
			const	divPlayerScore = this.createDivDisplayScore(player.name, player.score, index);
			this._score.appendChild(divPlayerScore);
		});
	}


	createDivDisplayScore (playerName: string, playerScore: number, indexLocation: number) {
		const	setGrid = [
			{ gridCol: "3", gridRow: "2" }, { gridCol: "1", gridRow: "2" },
			{ gridCol: "2", gridRow: "3" }, { gridCol: "2", gridRow: "1" },
		]
		const	divPlayerScore = document.createElement('div');

		divPlayerScore.classList.add('player-score');
		divPlayerScore.innerHTML = `
			<p class="score-cell">${playerName}</p>
			<p class="score-cell score-cell-points">${playerScore}</p>`;
		const	{ gridCol, gridRow } = setGrid[indexLocation];
		divPlayerScore.style.gridColumn = gridCol;
		divPlayerScore.style.gridRow = gridRow;
		return divPlayerScore ;
	}

	/* setup inital Display */
	setupDisplay () {
		if (!this._canvas)	{ throw new Error('Game canvas not found') ; }

		this._canvas.style.verticalAlign = 'top';
		this._canvas.height = CANVAS_HEIGHT;
		this._canvas.width = CANVAS_WIDTH;

		this._score = Design.createAppendix(/* this._players.length */4 - 1);

		this._score.style.width = '100%';
		this._score.style.height = '100%';
		this._gameUi!.innerHTML = '';
		this._gameUi?.appendChild(this._score);

		Design.drawBackground(this._ctx);
	}

	// affiche un nombre sous forme de countdown	@param countdown	@returns
	renderCountdown (countdown: number) {
		if (!this._ctx || !this._canvas) { console.error('Game context is not set.'); return; }

		this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
		Design.drawBackground(this._ctx);
		Design.drawCountdownFrame(this._ctx, countdown.toString());
	}

	render (players: Player[]) {	//@TODO a renommer
		this.setupDisplay();
		this.displayScore(players);
	}

	draw (ball: Ball, players: Player[]) {
		this.clear();

		Design.drawBackground(this._ctx);

		this.drawBall(ball);		// draw ball
		players.forEach(player => {	// draw paddles
			if (player.paddle) { this.drawPaddle(player.paddle.position, player.paddle.size); }
		});

		this.displayScore(players);
	}

	private clear() {
		if (!this._ctx || !this._canvas) { console.error('Game context is not set.'); return; }	// if context is undefined, impossible to clear canvas 
		this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
	}

	private drawBall(ball: Ball) {
		if (!this._ctx) { return; }

		const ctx = this._ctx;
		const r = ball.size.width;	// Radius
		const x = ball.position.x;	// Centre X
		const y = ball.position.y;	// Centre Y

		/* Radial gradient for glossy depth */
		const g = ctx.createRadialGradient(x - r * 0.4, y - r * 0.4, r * 0.1, x, y, r);
		g.addColorStop(0, "#ff768e");
		g.addColorStop(0.55, Design.DESIGN.accentColor);
		g.addColorStop(1, "#4c000d");
		ctx.fillStyle = g;
// =======

// 	private drawBall(ball: Ball) {
// 		if (!this._ctx) return;
// 		const ctx = this._ctx;

// 		const r = ball.size.width;   // radius
// 		const x = ball.position.x;   // center X
// 		const y = ball.position.y;   // center Y

// 		// 1) build fancy radial gradient
// 		const g = ctx.createRadialGradient(
// 			x - r * 0.4, y - r * 0.4, r * 0.1,
// 			x,            y,            r
// 		);
// 		g.addColorStop(0,   "#ffffff");                // bright core
// 		g.addColorStop(0.25, Design.DESIGN.accentColor); // your accent
// 		g.addColorStop(1,   "rgba(228,0,27,0.35)");                // deep edge
// >>>>>>> origin


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

// <<<<<<< HEAD
// 	renderGameHeroDiv(data: PREPARE_MATCHES_STARTED_ROUND_GAME) {
// 		console.log('Renderer: renderGameHeroDiv data:', data);
// 		const	div = this._gameHero as HTMLDivElement;
// 		if (div) {
// 			div.innerHTML = '';
// 			displayPrepareMatchesStartedRoundGame(div, data);
// 		}
// 		// Remove the div after 5 seconds
// 		setTimeout(() => {
// 			if (div) {
// 				div.innerHTML = '';
// 			}
// 		}, 5000);
// =======

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

// <<<<<<< HEAD
// 	displayHistoriqueGame(statisticsManager: StatisticsManager, players: Player[]) {
// 		const menuHistoriqueGame = document.createElement('div');
// 		menuHistoriqueGame.style.position = 'absolute';
// 		menuHistoriqueGame.style.top = '50%';
// 		menuHistoriqueGame.style.left = '50%';
// 		menuHistoriqueGame.style.transform = 'translate(-50%, -50%)';
// 		menuHistoriqueGame.style.margin = '0';
// 		menuHistoriqueGame.style.padding = '0';
// 		menuHistoriqueGame.style.width = '250px';
// 		menuHistoriqueGame.style.height = '250px';
// 		menuHistoriqueGame.style.backgroundColor = 'blue';
// 		menuHistoriqueGame.style.display = 'flex';
// 		menuHistoriqueGame.style.justifyContent = 'center';
// 		menuHistoriqueGame.style.alignItems = 'center';
// 		menuHistoriqueGame.style.color = 'white';
// 		menuHistoriqueGame.style.fontSize = '15px';
// 		menuHistoriqueGame.style.fontFamily = 'Arial';
// 		menuHistoriqueGame.style.borderRadius = '8px';
// 		menuHistoriqueGame.style.border = '5px solid rgb(255, 0, 0)';
// 		menuHistoriqueGame.style.background = 'rgb(0, 0, 0)';
// 		menuHistoriqueGame.style.color = 'rgb(255, 0, 0)';
// 		menuHistoriqueGame.style.whiteSpace = 'pre-line';
// 		let	text = `Plus grand nombre d'échanges: ${statisticsManager._gameHistory.maxBounceCount}\n\n`;
// 		players.forEach(player => {
// 			text += `${player.name}:\nNombre de rebonds: ${player.history.bounceCount}\nDistance parcourue: ${player.history.distance}\n\n`;
// 		});
// 		menuHistoriqueGame.textContent = text;
// 		this._gameAlert?.appendChild(menuHistoriqueGame);
// =======

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
			`<li><strong>${p.name} rebonds :</strong> ${p.history.bounceCount}</li>`
		).join("")}
    </ul>
  `;

		this._gameAlert?.appendChild(menu);
// >>>>>>> origin
		this._gameAlert?.classList.add('show');
	}





}

// type PREPARE_MATCHES_STARTED_ROUND_GAME = {
// // <<<<<<< HEAD
// 	id: string, //"9jqjw4k74ytmacj5nq4",
// 	players:
// 	{
// 		id: number,//352,
// 		userId: number,//-1,
// 		name: string,//"IA-4",
// 		avatar: string,//"https://localhost:4433/uploads/1-avatartest.jpg",
// 		score: number,//0,
// 		isInGame: boolean,//true,
// 		isIA: boolean,//true
// 	}[],
// 	gameHistoryId: number,//171,
// 	gameId: number,//171,
// 	winner: {
// 		id: number,//353,
// 		userId: number,//-1,
// 		name: string,//"IA-3",
// 		avatar: string,//"https://localhost:4433/uploads/1-avatartest.jpg",
// 		state: string,//"finished",
// 		isInGame: boolean,//true,
// 		isIA: boolean,//true,
// 		score: number,//5
// 	} | null,
// 	isFinished: boolean,//true
// }

// const displayPrepareMatchesStartedRoundGame = (div: HTMLDivElement, data: PREPARE_MATCHES_STARTED_ROUND_GAME) => {
// 	const { players, winner } = data;
// 	div.innerHTML = `
// 		<div class="game-card-container-background mx-auto text-center">
	
// 			<div class="game-card-container-row">
// 				<p class="text-3xl font-bold text-center mb-6">Game ID: #${data.id}</p>
// 			</div>

// 			<div class="game-card-container-row" style="display: flex; flex-direction: row;">
// 				<div class="flex flex-col items-center justify-center" style="width: 200px;">
// 				${players.map((player, i) => i % 2 === 1 ? `
// 					<div class="flex flex-col items-center justify-center py-4">
// 						<img
// 							referrerPolicy="no-referrer"
// 							src=${player.avatar.replace(/=s\d+-c$/, '')}
// 							alt="User Avatar"
// 							class="mx-auto object-cover rounded-full border-4 border-gray-300 mb-4"
// 							style="width: 160px; height: 160px; clip-path: circle();"
// 						/>
// 						<h2 class="text-2xl font-semibold">${player.name}</h2>
// 					</div>` : ``
// 				).join('')}
// 				</div>

// 				<div class="flex flex-col items-center justify-center" style="width: 200px;">
// 					<p class="text-blue-600 text-8xl px-3">VS</p>
// 				</div>
	
// 				<div class="flex flex-col items-center justify-center" style="width: 200px;">
// 				${players.map((player, i) => i % 2 === 0 ? `
// 					<div class="flex flex-col items-center justify-center py-4">
// 						<img referrerPolicy="no-referrer"
// 							src=${player.avatar.replace(/=s\d+-c$/, '')}
// 							alt="User Avatar"
// 							class="w-40 h-40 mx-auto object-cover rounded-full border-4 border-gray-300 mb-4"
// 							style="width: 160px; height: 160px; clip-path: circle();"
// 						/>
// 						<h2 class="text-2xl font-semibold">${player.name}</h2>
// 					</div>` : ``
// 				).join('')}
// 				</div>
// 			</div>
// 		</div>
// 	`;
// }

type PREPARE_MATCHES_STARTED_ROUND = {
	round: number,
	matches: PREPARE_MATCHES_STARTED_ROUND_GAME[]
}

// const displayPrepareMatchesStartedTournament = (div: HTMLDivElement, data: PREPARE_MATCHES_STARTED_ROUND[]) => {
// 	div.innerHTML = `
// 	<div>
// 	 <p>Click the links below to navigate:</p>
// 		${data.map((round, index) => `
// 		<div class="flex flex-col">
// 				<p>Round ${index + 1}</p>
// 				${round.matches.map((match) => `
// 				<div class="flex flex-row">					 
// 					${match.players.map((player) => `
// 						<div class="flex flex-col">								
// 							<div class="w-20">
// 							<img referrerPolicy="no-referrer"
// 									src=${player.avatar}
// 									alt="User Avatar"
// 									class="w-5 h-5 mx-auto rounded-full border-4 border-gray-300 mb-4"
// 								/>
// 							</div>
// 							<h2 class="text-xl font-semibold">${player.name}</h2>
// 							<br>
// 							<h3 class="text-lg font-semibold">Games Score</h3>
// 							<p class="text-green-600 text-lg">${player.score}</p>
// 						</div>`
// 	).join('')}
// 				</div>
// 				<br>
// 				`).join('')}
// 			</div>
// 		`).join('')}
// 	</div>`
// }
// =======
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
// export type PREPARE_MATCHES_STARTED_ROUND      = PrepareMatchRound;

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
// >>>>>>> origin
}

