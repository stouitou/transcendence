import { Player } from "../Player";
import { Ball } from '../Ball';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "../../component/classic";

export class	ScoreManager {

	private readonly	_players: Player[];
	private readonly	_canvas = { width: CANVAS_WIDTH, height: CANVAS_HEIGHT };
	private readonly	_maxScore = 10;
	isFinished = false;

	constructor(players: Player[]) {
		this._players = players;
	}

	updateScore(ball: Ball) {
		if (ball.lastHit && ball.lastWallBounce != null && ball.lastWallBounce < this._players.length &&
			(ball.position.x + ball.size.width < 0 ||
			ball.position.x > this._canvas.width ||
			ball.position.y + ball.size.height < 0 ||
			ball.position.y > this._canvas.height)
		) {
			ball.lastHit.score++;
			this._players[ball.lastWallBounce]._historyPlayer.goalsConceded++;
			ball.reset();
		}
	}

	// Vérifier si un joueur a atteint le score maximum
	checkMaxScore (wsMessageHandler: (data: any) => void,lobyId:string,gameId:string) : boolean {
		for (const player of this._players) {
			if (player.score >= this._maxScore) {
				console.log(`Player ${player.name} wins!`);
				this.isFinished = true;

				//mise a jour du score via websocket
				this._players.forEach((player) => {
					player.state = "finished";
					player.isInGame = false;
				});
				const dataMessage = {
					type: "UPDATESCORE",
					gameId: gameId,
					lobyId: lobyId,
					data: {
						players: this._players,
					},
				};
				wsMessageHandler(dataMessage);

				return true; // Un joueur a gagné
			}
		}
		return false; // Aucun joueur n'a atteint le score maximum
	}

	awardPointToPlayer(playerIndex: number) {
		const player = this._players[playerIndex];
		player.score++;
		console.log(`Player ${player.name} scored! New score: ${player.score}`);
	}

	resetScores() {
		this._players.forEach(player => { player.score = 0; });
	}
}