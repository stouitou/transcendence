import { Player } from '../Player';
import { Ball } from '../Ball';

export class	StatisticsManager {

	_gameHistory = {
		maxBounceCount: 0,
		mostGoalsConcededPlayer: {name: '', goalsConceded: 0},
		playerWithMostPointsLost: 0,
		totalBouncesPerPlayer: 0,
	};

  constructor() { }

  updateStatistics (ball: Ball, players: Player[]) {
    // Exemple : Mise à jour des statistiques
	//total des rebonds de la balle sur le round
	this._gameHistory.maxBounceCount = ball.maxBounceCountRound;
	//Le joueur qui s'est pris le plus de buts 
	const	goalsConceded = players.reduce((prev, current) => {
		return (prev.historyPlayer.goalsConceded > current.historyPlayer.goalsConceded) ? prev : current;
	});
	this._gameHistory.mostGoalsConcededPlayer = {
		name: goalsConceded.name,
		goalsConceded: goalsConceded.historyPlayer.goalsConceded,
	};
	//@TODO ajouter d'autres stats
  }


}