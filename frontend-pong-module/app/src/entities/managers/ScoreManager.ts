import { Player } from "../Player";
import { Ball } from '../Ball';

export class ScoreManager {
  private players: Player[];
  canvas = { width: 800, height: 600 };
  maxScore = 1;
  isFinished = false;
  constructor(players: Player[]) {
    this.players = players;
  }
  updateScore(ball: Ball) {
	//le joueur marque un point
	// la ball a touché un mur defendu par un joueur
	// un autre joueur a touché la balle

	/* console.log("ball.lastHit",ball.lastHit);
	console.log("ball.lastWallBounce",ball.lastWallBounce);
	console.log("this.players.length",this.players.length); */
	if (ball.lastHit && ball.lastWallBounce != null && ball.lastWallBounce < this.players.length ) {
	  ball.lastHit.score++;
	  this.players[ball.lastWallBounce]._historyPlayer.goalsConceded++;
	  console.log(
		"Score updated for player:",
		ball.lastHit.name,
		"New score:",
		ball.lastHit.score,
		"conceded by:",
		this.players[ball.lastWallBounce].name,

	  );
	  //ball.lastHit = null; // Réinitialiser le dernier joueur ayant touché la balle
	  //ball.lastWallBounce = null; // Réinitialiser le dernier mur touché
	  ball.reset();
	}
  }

  // Vérifier si un joueur a atteint le score maximum
  checkMaxScore(wsMessageHandler: (data: any) => void,lobyId:string,gameId:string):boolean {
	for (const player of this.players) {
		if (player.score >= this.maxScore) {
			console.log(`Player ${player.name} wins!`);
			this.isFinished = true;

			//mise a jour du score via websocket
			this.players.forEach((player) => {
				player.state = "finished";
				player.isInGame = false;
			});
			const dataMessage = {
				type: "UPDATESCORE",
				gameId: gameId,
				lobyId: lobyId,
				data: {
					players: this.players,
				},
			};
			wsMessageHandler(dataMessage);

			return true; // Un joueur a gagné
		}
	}
	return false; // Aucun joueur n'a atteint le score maximum
  }

  awardPointToPlayer(playerIndex: number) {
    const player = this.players[playerIndex];
    player.score++;
    console.log(`Player ${player.name} scored! New score: ${player.score}`);
  }

  resetScores() {
    this.players.forEach(player => (player.score = 0));
  }
}