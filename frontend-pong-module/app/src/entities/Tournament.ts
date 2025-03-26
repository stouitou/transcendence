import { Player } from "./Player.js";
import { Game } from "./Game.js";

export class Tournament {

	private readonly	_canvas: HTMLDivElement;

	private readonly	_players: Player[];

	private				_round: Player[] = [];
	private				_match: Map<number, Player[] | null> = new Map();
	private				_game!: Game;
	private				_nextMatch: HTMLDivElement | null = null;

	/* CONSTRUCTOR */
	public constructor(players: Player[], canvas: HTMLDivElement) {
		this._players = players;
		this._canvas = canvas;

		this.randomize();
		
		this.createMatch();

		this.launchGame(Math.round(this._round.length / 2));
	}

	private randomize () {
		let	array = this._players;
		let	len = array.length;
		while (array.length) {
			let	index = Math.floor(Math.random() * len);
			this._round.push(array.splice(index, 1)[0]);
			len--;
		}
	}

	private createMatch () {
		let	index = 0;
		for (let i = 0; i < this._round.length; i++) {
			if (!this._match.has(index))
				this._match.set(index, [this._round[i]]);
			else if (this._match.get(index)?.length === 1) {
				this._match.get(index)?.push(this._round[i]);
				index++;
			}
		}
	}

	private async launchGame (nofMatch: number) {
		await this.showNextMatch();

		this._round.length = 0;
		let i: number = 0;
		let	j = 0;

		while (i <= nofMatch) {
			const game = this._match.get(i);
			if (game && game.length === 2) {
            	this._game = new Game(game[0], game[1], this._canvas);
				await this._game.launch();
				document.body.innerHTML = ''; //a revoir, remet la page a 0
				this._round[j] = game[0].lastWin ? game[0] : game[1];
				j++;
			}
			else if (game) {
				this._round[j] = game[0];
				j++;
			}
			i++;
		}

		this._match.clear();
		if (this._round.length === 3) {
			this.threePlayers();
			return ;
		}
		else if (this._round.length === 1)
			return ;
		this.createMatch();
		this.launchGame(Math.round(this._round.length / 2));
	}

	private threePlayers () {
		let	array: number[][] = [[0, 0], [0, 0], [0, 0]];
		let FLAG: boolean = false;
		let FLAG1: boolean = false;

		const loop = async (x: number, y: number) => {
			this._game = new Game(this._round[y], this._round[x], this._canvas);
			await this._game.launch();
			array[x][0] += this._round[x].lastWin ? 1 : 0;
			array[x][1] += this._round[x].lastScore;

			array[y][0] += this._round[y].lastWin ? 1 : 0;
			array[y][1] += this._round[y].lastScore;

			document.body.innerHTML = ''; //a revoir, remet la page a 0
			if (FLAG == false) {
				FLAG = true;
				await loop(1, 2);
			}
			if (FLAG1 == false) {
				FLAG1 = true;
				await loop(0, 2);
			}
		}
		loop(0, 1);
	}

	private showNextMatch() : Promise<void>
    {
        return new Promise((resolve) => {
			const keys = Array.from(this._match.keys()); // Liste des clés
			let i: number = 0;
			let tab: string[] = ["Next match:" + "<br>"];
			let game = this._match.get(i);

			while (i < keys.length) {
				if (game) {
					if (game[1])
						tab[i + 1] = tab[i] + game[0].name + " VS " + game[1].name + "<br>";
					else
						tab[i + 1] = tab[i] + game[0].name + "<br>";
				}
				i++;
				game = this._match.get(i);
			}
			//if (game)
			//    tab = tab + game[0].name;
			this._nextMatch = document.createElement('div');

			this._nextMatch.innerHTML = tab[0];
			this._nextMatch.style.font = `30px`;
			this._nextMatch.style.color = 'rgba(41, 112, 97, 0.57)';
			this._nextMatch.style.fontSize = `50px`;
			//this._nextMatch.style.opacity = ${this._opacity};
			this._nextMatch.style.top = '50%';
			this._nextMatch.style.left = '50%';
			this._nextMatch.style.position = 'absolute';
			this._nextMatch.style.transform = 'translate(-50%, -50%)';
			
			document.body.appendChild(this._nextMatch);
			for (let x = 1; x < i + 1; x++) {
				setTimeout(() => { 
					const nextMatch = document.createElement('div');
					if (this._nextMatch)
						this._nextMatch.innerHTML = tab[x]
						document.body.appendChild(nextMatch);
					}, x * 800); 
			}
			document.addEventListener('keydown', (event) => {
				if (event.key === "Enter") {
					if (this._nextMatch)
						this._nextMatch.innerHTML = "";
					resolve();
				}
			});
        });
	}
}