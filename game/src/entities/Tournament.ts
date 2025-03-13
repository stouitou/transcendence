import { Player } from "./Player.js";
import { Game } from "./Game.js";

export class Tournament {

	private readonly	_players: Player[];

	private				_round: Player[] = [];
	private				_match: Map<number, Player[] | null> = new Map();
	private				_game!: Game;

	/* CONSTRUCTOR */
	public constructor(players: Player[]) {
		this._players = players;

		this.randomize();
		
		console.log("random :")
		for (let i = 0; i < this._round.length; i++)
			console.log(this._round[i]);

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

		console.log("match:");
		for (let i = 0; i < Math.round(this._round.length / 2); i++)
			console.log(this._match.get(i));
	}

	private async launchGame (nofMatch: number) {
		console.log("number of match: ", nofMatch);

		this._round.length = 0;
		let i: number = 0;
		let nextRound: Player[] = [];
		let	j = 0;

		while (i <= nofMatch) {
			console.log("starting game");
			const game = this._match.get(i);
			if (game && game.length === 2) {
            	this._game = new Game(game[0], game[1]);
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

		console.log("next round :")
		for (let i = 0; i < this._round.length; i++)
			console.log(this._round[i]);

		this._match.clear();
		console.log("round length = ", this._round.length);
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
			this._game = new Game(this._round[y], this._round[x]);
			await this._game.launch();
			array[x][0] += this._round[x].lastWin ? 1 : 0;
			array[x][1] += this._round[x].lastScore;

			array[y][0] += this._round[y].lastWin ? 1 : 0;
			array[y][1] += this._round[y].lastScore;

			document.body.innerHTML = ''; //a revoir, remet la page a 0
			console.log(array);
			if (FLAG == false)
				FLAG = true; await loop(1, 2);
			if (FLAG1 == false)
				FLAG1 = true; await loop(0, 2);
		}
		loop(0, 1);
	}
}