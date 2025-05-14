import { Ball } from '../Ball';
import { Player } from '../Player';
import * as Design from "../Design";
import { Ground } from '../../Interfaces/Ground.interface';
import { StatisticsManager } from './StatisticsManager';
export class	Renderer {

	private	_canvas: HTMLCanvasElement | null = null;
	private	_ctx: CanvasRenderingContext2D | null = null;
	private	_gameUi: HTMLElement | null = null;
	private _gameHero: HTMLElement | null = null;
	private	_gameHeroTree: HTMLElement | null = null;

	private		_ground!: Ground;
	private		_score!: HTMLDivElement;
	private 	_gameAlert: HTMLElement | null = null;

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
			//const divPlayerScore = this.createDivDisplayScore(player.name, player.points, player.location);
			const divPlayerScore = this.createDivDisplayScore(player.name, player.score, index);
			this._score.appendChild(divPlayerScore);
		});
	}

	createDivDisplayScore(playerName: string, playerScore: number,indexLocation: number) {
		const setGrid  = [
			{gridCol:"1",gridRow:"2"},{gridCol:"3",gridRow:"2"},
			{gridCol:"2",gridRow:"1"},{gridCol:"2",gridRow:"3"},
		]
		const divPlayerScore = document.createElement('div');
		divPlayerScore.classList.add('player-score');
		divPlayerScore.innerHTML = `
			<p class="score-cell">${playerName}</p>
			<p class="score-cell score-cell-points">${playerScore}</p>`;
		const {gridCol, gridRow} = setGrid[indexLocation];
			divPlayerScore.style.gridColumn = gridCol;
			divPlayerScore.style.gridRow = gridRow;
		return divPlayerScore;
	}
		/* -----------setup inital Display */
		setupDisplay () {
			if (!this._canvas) {
				throw new Error('Game canvas not found');
			}
			this._canvas.style.verticalAlign = 'top';
			this._canvas.height = 600//CANVAS_HEIGHT; //@TODO a recuperer dynamiquement !!!
//			if (this._players.length > 2)
			//	CANVAS_WIDTH = 500;
			this._canvas.width = 800//CANVAS_WIDTH;//@TODO a recuperer dynamiquement !!!
	
			this._ground = {
				field: /* this._ctx!, */this._canvas.getContext('2d') as CanvasRenderingContext2D,
				width: this._canvas.width,
				height: this._canvas.height
			}
	
			this._score = Design.createAppendix(/* this._players.length */4 - 1);
	
			this._score.style.width = '100%';
			this._score.style.height = '100%';
			this._gameUi!.innerHTML = '';
			this._gameUi?.appendChild(this._score);
	
			Design.drawBackground(this._ground.field);
		}

	/**
	 * affiche un nombre sous forme de countdown
	 * @param countdown 
	 * @returns 
	 */
	renderCountdown(countdown: number) {
	//	this.setupDisplay();
		if (!this._ctx || !this._canvas) {
			console.error('Game context is not set.');
			return;
		}
		this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
		Design.drawBackground(this._ground.field);
		Design.drawCountdownFrame(this._ground.field, countdown.toString());
	}

  render(players: Player[]) {//@TODO a renommer
	console.log('Renderer: render');
	this.setupDisplay();
	 this.displayScore(players);
  //  this.clear(); 
//	Design.drawBackground(this._ctx!);
//	this.drawBall(ball);
/* this.displayCountdown().then(() => {
		Design.drawBackground(this._ground.field);
	//this.drawBall(ball);
	//this.drawTest(ball,players);
	console.log('Renderer: render: displayCountdown Resolved');
}); */

  }
/* private async displayCountdown(): Promise<void> {
		const frames = ["3", "2", "1", "GO"];
		return new Promise(resolve => {
			frames.forEach((f, i) => {
				setTimeout(() => {
					Design.drawCountdownFrame(this._ground.field, f);
					if (i === frames.length - 1) resolve();
				}, i * 1000);
			});
		});
	} */

  draw(ball: Ball, players: Player[]) {
    this.clear();

	Design.drawBackground(this._ground.field);
	

    // Dessiner la balle
    this.drawBall(ball);

    // Dessiner les paddles des joueurs
    players.forEach(player => {
      if (player.paddle) {
        this.drawPaddle(player.paddle.position, player.paddle.size);
      }
    });
	this.displayScore(players);
  }

  drawTest(ball: Ball,players:Player[]) {
    this.clear();

  //  this.clear();

    // Dessiner la balle
    this.drawBall(ball);

    // Dessiner les paddles des joueurs
    players.forEach(player => {
      if (player.paddle) {
        this.drawPaddle(player.paddle.position, player.paddle.size);
      }
    });
  }

  clear() {
	if (!this._ctx || !this._canvas) {
	  // Si le contexte de jeu n'est pas défini, on ne peut pas effacer le canvas
	  console.error('Game context is not set.');
	  return;
	}
    this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
  }

  private drawBall(ball: Ball) {
/* 	if (!this._ctx) {
	  console.error('Game context is not set.');
	  return;
	}
    this._ctx.fillStyle = 'white';
    this._ctx.beginPath();
    this._ctx.arc(
      ball.position.x + ball.size.width / 2, // Centre X
      ball.position.y + ball.size.height / 2, // Centre Y
      ball.size.width / 2, // Rayon
      0,
      Math.PI * 2
    );
    this._ctx.fill(); */
		/* ---------- glossy draw ---------- */
			const ctx = this._ground.field;/* 
			const r   = this._radius;
			const x   = this._position.x;
			const y   = this._position.y; */
			const r   = ball.size.width ; // Radius
			const x   = ball.position.x; // Centre X
			const y   = ball.position.y; // Centre Y
	
			/* Radial gradient for glossy depth */
			const g = ctx.createRadialGradient(x - r * 0.4, y - r * 0.4, r * 0.1, x, y, r);
			g.addColorStop(0,   "#ff768e");
			g.addColorStop(0.55, Design.DESIGN.accentColor);
			g.addColorStop(1,   "#4c000d");
			ctx.fillStyle = g;
	
			/* blur pass for soft glow / motion feel */
			ctx.save();
			ctx.filter = "blur(2px)";
			ctx.beginPath();
			ctx.arc(x, y, r, 0, Math.PI * 2);
			ctx.fill();
			ctx.restore();
	
			/* specular highlight */
			ctx.fillStyle = "rgba(255,255,255,.65)";
			ctx.beginPath();
			ctx.ellipse(x - r * 0.35, y - r * 0.35, r * 0.15, r * 0.10, 0, 0, Math.PI * 2);
			ctx.fill();
  }

  private drawPaddle(position: { x: number; y: number }, size: { width: number; height: number }) {
	/* if (!this._ctx) {
	  console.error('Game context is not set.');
	  return;
	}
    this._ctx.fillStyle = 'white';
    this._ctx.fillRect(position.x, position.y, size.width, size.height); */
	/* 	let height: number = 0;
			let width: number = 0;
	 */
		/* 	switch (this.owner.location) {
				case 0:
				case 1:
					height = this._height;
					width = this._width;
					break;
				case 2:
				case 3:
					height = this._width;
					width = this._height;
					break;
			} */
			Design.drawPaddle(
				this._ctx!,
				position.x,
				position.y,
				size.width,
				size.height
			);
  }





	renderGameHeroDiv(data: PREPARE_MATCHES_STARTED_ROUND_GAME) {
		console.log('Renderer: renderGameHeroDiv data:',data);
		const div = this._gameHero as HTMLDivElement;
        if (div) {
          div.innerHTML = '';
          displayPrepareMatchesStartedRoundGame(div,data);
        }
		//effacer le div au bout de 5 secondes
        setTimeout(() => {
          if (div) {
            div.innerHTML = '';
          }
        }, 5000);
	}

	renderGameHeroTreeDiv(data: PREPARE_MATCHES_STARTED_ROUND[]) {
		const div = this._gameHeroTree as HTMLDivElement;
        if (div) {
          div.innerHTML = '';
          displayPrepareMatchesStartedTournament(div,data);
        }
		//effacer le div au bout de 5 secondes
        setTimeout(() => {
          if (div) {
            div.innerHTML = '';
          }
        }
        , 5000);

	}

	displayHistoriqueGame(statisticsManager:StatisticsManager,players: Player[]) {
	{
		const menuHistoriqueGame = document.createElement('div');
		menuHistoriqueGame.style.position =  'absolute';
		menuHistoriqueGame.style.width = '250px';
		menuHistoriqueGame.style.height = '400px';
		menuHistoriqueGame.style.backgroundColor = 'blue';
		menuHistoriqueGame.style.display = 'flex';
		menuHistoriqueGame.style.justifyContent = 'center';
		menuHistoriqueGame.style.alignItems = 'center';
		menuHistoriqueGame.style.color = 'white';
		menuHistoriqueGame.style.fontSize = '15px';
		menuHistoriqueGame.style.fontFamily = 'Arial';
		menuHistoriqueGame.style.borderRadius = '8px';
		menuHistoriqueGame.style.border = '5px solid rgb(255, 0, 0)';
		menuHistoriqueGame.style.background = 'rgb(0, 0, 0)';
		menuHistoriqueGame.style.color = 'rgb(255, 0, 0)';
		menuHistoriqueGame.style.whiteSpace = 'pre-line';
		let text: string = 'Le plus grand nombre de rebonds ' + statisticsManager._gameHistory.maxBounceCount + "\n\n";
/* 		let mostGoalsConcededPlayer: number = 0;
		let playerWithMostPointsLost: number = 0; */

		/* for (let x: number = 0; x < players.length; x++)
		{
			console.log("players[x].historiqueGame.firstPointScorer ", "players[x].historiqueGame.firstPointScorer?.name");
			if (players[x]._historyPlayer.goalsConceded > players[mostGoalsConcededPlayer].historiqueGame.mostGoalsConcededPlayer)
				mostGoalsConcededPlayer = x;
			if (players[x].historiqueGame.playerWithMostPointsLost > players[playerWithMostPointsLost].historiqueGame.playerWithMostPointsLost)
				playerWithMostPointsLost = x;
			if (players[x].historiqueGame.firstPointScorer)
				text += "Le premier joueur à avoir marqué un point est " + players[x].name + "\n\n";
		} */
	    const {name, goalsConceded} = statisticsManager._gameHistory.mostGoalsConcededPlayer;
		//text += " Le joueur qui s'est pris le plus de buts " + players[mostGoalsConcededPlayer].name + " avec " + players[mostGoalsConcededPlayer].historiqueGame.mostGoalsConcededPlayer + "\n\n";
		text += ` Le joueur qui s'est pris le plus de buts ${name} avec ${goalsConceded}\n\n`;
	//	text += "Le joueur ayant perdu le plus de points " + players[playerWithMostPointsLost].name + " avec " + players[playerWithMostPointsLost].historiqueGame.playerWithMostPointsLost + "\n\n";
		
		players.forEach(player => {
			text += ` Nombre de rebond de ${player.name} est de {player.totalBouncesPerPlayer} \n`;
		});
		/* for (let x: number = 0; x < players.length; x++)
		{
			text += "Nombre de rebond de " + players[x].name + " est de " + players[x].historiqueGame.totalBouncesPerPlayer + "\n";
		} */
		menuHistoriqueGame.textContent = text;
		this._gameAlert?.appendChild(menuHistoriqueGame);
		this._gameAlert?.classList.add('show');
		}
	}
}



//component affichage du PREPARE_MATCHES_STARTED_ROUND_GAME
type PREPARE_MATCHES_STARTED_ROUND_GAME = {
  
    id:string, //"9jqjw4k74ytmacj5nq4",
    players:
      {
        id: number,//352,
        userId: number,//-1,
        name: string,//"IA-4",
        avatar: string,//"https://localhost:4433/uploads/1-avatartest.jpg",
        score: number,//0,
        isInGame: boolean,//true,
        isIA: boolean,//true
      } [],
    gameHistoryId: number,//171,
    gameId: number,//171,
    winner: {
        id: number,//353,
        userId: number,//-1,
        name: string,//"IA-3",
        avatar: string,//"https://localhost:4433/uploads/1-avatartest.jpg",
        state: string,//"finished",
        isInGame: boolean,//true,
        isIA: boolean,//true,
        score: number,//5
      } | null,
    isFinished: boolean,//true
  }
const displayPrepareMatchesStartedRoundGame = (div: HTMLDivElement,data:PREPARE_MATCHES_STARTED_ROUND_GAME) => {
	const {players,winner} = data;
	div.innerHTML = `
	<div class="mx-auto text-center">
		  <div class="game-card-container-background">
  
			<div class="game-card-container-row">
			 <p class="text-3xl font-bold text-center mb-6">Game ID: #${data.id}</p>
			</div>
  
			
			<div class="game-card-container-row">
			  <div class="flex flex-col items-center justify-center min-w-[220px]">
			  ${players.map((player,i) =>
				i%2 === 0 ? `
				<div class="flex flex-col items-center justify-center min-w-[220px] py-4">
					<img referrerPolicy="no-referrer"
						  src=${player.avatar}
						  alt="User Avatar"
						  class="w-24 h-24 mx-auto rounded-full border-4 border-gray-300 mb-4"
					  />
						  <h2 class="text-2xl font-semibold">${player.name}</h2>
  
						  <br>
							<h3 class="text-lg font-semibold">Games Score</h3>
							<p class="text-green-600 text-9xl">${player.score}</p>
  
				</div>`:``
			).join('')}
  
				</div>
			  <div class="flex flex-col items-center justify-center">
				<p class="text-blue-600 text-8xl px-3">VS</p>
			  </div>
  
  
			  <div class="flex flex-col items-center justify-center min-w-[220px]">
				  ${players.map((player,i) => 
					i%2 === 1 ? `
					<div class="flex flex-col items-center justify-center min-w-[220px] py-4">
						<img referrerPolicy="no-referrer"
							  src=${player.avatar}
							  alt="User Avatar"
							  class="w-24 h-24 mx-auto rounded-full border-4 border-gray-300 mb-4"
						  />
							  <h2 class="text-2xl font-semibold">${player.name}</h2>
  
							  <br>
								<h3 class="text-lg font-semibold">Games Score</h3>
								<p class="text-green-600 text-9xl">${player.score}</p>
  
					</div>`:``
				).join('')}
  
			  </div>
			</div>
			  <p>Winner: </p>
			  <p class="text-3xl font-bold text-center mb-6 text-green-600">${winner?winner.name:''}</p>
		  </div>
		   
	   </div>
   `;
  }

  type PREPARE_MATCHES_STARTED_ROUND={
	round:number,
	matches:PREPARE_MATCHES_STARTED_ROUND_GAME[]
  }
  
  const displayPrepareMatchesStartedTournament = (div: HTMLDivElement,data:PREPARE_MATCHES_STARTED_ROUND[]) => {
	div.innerHTML = `
	<div>
	 <p>Click the links below to navigate:</p>
	  ${data.map((round, index) => `
		<div class="flex flex-col">
			  <p>Round ${index+1}</p>
			  ${round.matches.map((match) =>  `
				<div class="flex flex-row">           
					${match.players.map((player) =>  `
					  <div class="flex flex-col">                
						  <div class="w-20">
							<img referrerPolicy="no-referrer"
								  src=${player.avatar}
								  alt="User Avatar"
								  class="w-5 h-5 mx-auto rounded-full border-4 border-gray-300 mb-4"
							  />
							</div>
							<h2 class="text-xl font-semibold">${player.name}</h2>
							<br>
							<h3 class="text-lg font-semibold">Games Score</h3>
							<p class="text-green-600 text-lg">${player.score}</p>
					  </div>`
					).join('')}
				</div>
				<br>
				`).join('')}
		  </div>
	  `).join('')}
	</div>`
  }