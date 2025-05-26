import { Player } from "../Player";
import { Ball } from '../Ball';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "../../component/classic";

export class	ScoreManager {

	private readonly	_players: Player[];
	private readonly	_canvas = { width: CANVAS_WIDTH, height: CANVAS_HEIGHT };
	private readonly	_maxScore = 5;
	private				_isFinished = false;

	constructor (players: Player[]) {
		this._players = players;
	}

	get isFinished ()	{ return this._isFinished ; }

	updateScore (ball: Ball) {
		if (ball.lastHit && ball.lastWallBounce != null && ball.lastWallBounce < this._players.length &&
			(ball.position.x + ball.size.width < 0 ||
			ball.position.x > this._canvas.width ||
			ball.position.y + ball.size.height < 0 ||
			ball.position.y > this._canvas.height)
		) {
			if (this._players.length === 2) {
				const	winnerIndex = ball.lastWallBounce === 0 ? 1 : 0;
				this._players[winnerIndex].score++;
			} else {
				if (ball.lastHit.location === ball.lastWallBounce && ball.lastHit.score > 0)
					ball.lastHit.score--;
				else if (ball.lastHit.location != ball.lastWallBounce)
					ball.lastHit.score++;
			}
			this._players[ball.lastWallBounce].history.goalsConceded++;
			ball.reset();
		}
	}

	checkMaxScore (wsMessageHandler: (data: any) => void, lobyId:string, gameId:string) : boolean {
		for (const player of this._players) {
			if (player.score >= this._maxScore) {
				console.log(`Player ${player.name} wins!`);
				this._isFinished = true;

				// Update score via Web Socket
				this._players.forEach((player) => {
					player.state = "finished";
					player.isInGame = false;
				});
				const	dataMessage = {
					type: "UPDATESCORE",
					gameId: gameId,
					lobyId: lobyId,
					data: {
						players: this._players,
					},
				};
				wsMessageHandler(dataMessage);

				return true ;	// A player has won
			}
		}
		return false ;			// no player with maximum score
	}

	awardPointToPlayer (playerIndex: number) {
		const	player = this._players[playerIndex];
		player.score++;
		console.log(`Player ${player.name} scored! New score: ${player.score}`);
	}

	resetScores () {
		this._players.forEach(player => { player.score = 0; });
	}
}