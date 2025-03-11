import { Player } from "./Player.js";
import { Game } from "./Game.js";

export class Tournament {

	private readonly _players: Player[];
	private readonly _nofPlayers: number;

	private _match: Map<number, Player[] | null> = new Map();
	private _game: Game | null = null;

	/* CONSTRUCTOR */
	public constructor(nofPlayers: number, players: Player[]) {
		this._players = players;
		this._nofPlayers = nofPlayers;

		for (let i = 0; i < nofPlayers; i++) {
			let id: number;
			do {
				id = Math.floor(Math.random() * nofPlayers / 2) + 1;
			} while (this.takenId(id, nofPlayers, players));
			players[i].id = id;
		}
		for (let i = 0; i < nofPlayers; i++) {
			if (this._match.has(players[i].id))
				this._match.get(players[i].id)?.push(players[i]);
			else
				this._match.set(players[i].id, [players[i]]);
		}
		for (let i: number = 0; i <= (nofPlayers + 1) / 2; i++)
			console.log(this._match.get(i));
		this.launchGame((nofPlayers + 1) / 2)
	}
	
	private takenId (id: number, nofPlayers: number, players: Player[]) {
		let once = 0;
		for (let x = 0; x < nofPlayers; x++) {
			if (players[x].id === id) {
				if (!once)
					once++;
				else
					return true;
			}
		}
		return false;		
	}

	private async launchGame (nofMatch: number) {
		let i: number = 1;
		let nextRound: Player[] = [];
		let	j = 0;

		while (i <= nofMatch) {
			const game = this._match.get(i);
			if (game && game.length === 2) {
				// console.log("Je suis I dans le if ", i);
				// console.log("launch game");
				console.log("game[0].name", game[0].name);
				console.log("game[1].name", game[1].name);
				// console.log("this._match.get(i)", this._match.get(i));
            	this._game = new Game(game[0], game[1]);
				await this._game.launch();
				document.body.innerHTML = ''; //a revoir, remet la page a 0
				if (this._game)
					nextRound[j] = game[0].lastWin ? game[0] : game[1];
				j++;
			}
			else if (game) {
				nextRound[j] = game[0];
				j++;
			}
			i++;
		}
		for (let k = 0; k < nextRound.length; k++)
			console.log("winner :", nextRound[j]);
		// passe a la ligne suivante si cest possible if fin de la Game();
		// 	loop;
	}

	private getPlayer (id: number) {
		for (let i: number = 0; i < this._nofPlayers; i++) {
			if (this._players[i].id === id)
				return this._players[i];
		}
		return null ;
	}
}