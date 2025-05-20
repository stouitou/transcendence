import { InputManager } from './InputManager';
import { Player } from '../Player';
import { CollisionManager } from './CollisionManager';
import { StatisticsManager } from './StatisticsManager';
import { ScoreManager } from './ScoreManager';
import { Ball } from '../Ball';
import { DataMatch } from '../../Interfaces/DataMatch.interface';

export class GameManager {

	private	_players: Player[] = [];
	private	_ball: Ball = new Ball({ x: 350, y: 250 }, { width: 16, height: 16 }, { x: 1, y: 1 }, 0.4);;
	private	_collisionManager:CollisionManager = new CollisionManager();

	private scoreManager: ScoreManager |null = null;
	private statisticsManager: StatisticsManager = new StatisticsManager();
	dataconfig: DataMatch | null = null;

	inputManagers: Map<string, InputManager> = new Map(); // par joueur id

	constructor () {
		this.createBall();
	}

	get ball ()		{ return this._ball ; }
	get players()	{ return this._players ; }

	setDataconfig (dataMatch: DataMatch) {
		this.dataconfig = dataMatch;
		return this ;
	}

	createBall () {
		this._ball = new Ball({ x: 350, y: 250 }, { width: 16, height: 16 }, { x: 1, y: 1 }, 3);
	}

	private addPlayer (player: Player) {
		this._players.push(player);
		console.log('addPlayer', this._players);
	}

	addPlayers () {
		const	dataMatch = this.dataconfig;
		if (!dataMatch)	{ console.error('No dataMatch available'); return ; }

		dataMatch.players.forEach((player, index) => {
			console.log('player:', index,player.id);
			const jsonData = {
						id: player.id,
						name: player.name,
						isRemote: dataMatch?.config.type === 'remote',
						isInGame: player.isInGame,
						isIA: player.isIA,	
						score: player.score,
						paddle: {
							position: player.position,
							size: player.size,
						},
						
					}
			const	inputManager = new InputManager(index, !player.isIA);
			const	newPlayer = new Player(jsonData, index, inputManager)
			this.inputManagers.set(player.id.toString(), inputManager);

			this.addPlayer(newPlayer);
		});
	}

	clearPlayers () {
		if (this._players.length > 0) {
			//this._players.forEach((player) => {})
			this._players = [];
		}
	}

	setupGame () {
		this.clearPlayers();
		this._ball.reset();
		this.addPlayers();
		this.scoreManager = new ScoreManager(this._players);
	}

	/**
	 * * Met à jour l'état du jeu, y compris la position de la balle et des joueurs.
	 * * Vérifie les collisions et met à jour le score.
	 */
	update () {
		// Update players
		this.updatePlayersMovement();

		// Update ball, Ball Class responsability
		this._ball.update();

		// CollisionManager responsability
		this._collisionManager.handleCollisions(this._ball, this._players);

		// Update statistics, StatisticsManager Class responsability
		this.statisticsManager.updateStatistics(this._ball, this._players);

		// Update score, ScoreManager Class responsability
		if (this.scoreManager) {
			this.scoreManager.updateScore(this._ball);		
		}
	}

	/**
	 * * Vérifie si un joueur a atteint le score maximum.
	 * * Si oui, arrête le jeu et envoie un message via WebSocket.
	 */
	checkMaxScore(wsMessageHandler: (data: any) => void):boolean {
	if (this.scoreManager) {
		if (!this.dataconfig)	return true;//stop game
		return this.scoreManager.checkMaxScore(wsMessageHandler,this.dataconfig?.lobyId!,(this.dataconfig.id));
	}
	return true;//stop game
 }


	// Met à jour l'état du jeu avec les données reçues du serveur.	@param game 
	updateGameState (game: { ball: { position: { x:number, y:number }, size: { width: number, height: number } }, players: Player[] }) {
		this._ball.position = game.ball.position;

		for (const [index, player] of game.players.entries()) {
			//this._players[index].paddle.position = player.position;
			if (this._players[index].paddle && player.paddle) {
				this._players[index].paddle.position = player.paddle.position;
			}
			/* this._players[index].paddle.size = player.paddle.size; */
			this._players[index].score = player.score;
		}
	}
	// Update players movements. Each IA adjust position to follow ball
	private updatePlayersMovement () {
		for (const player of this._players) {
				player.updateMovement(this._ball);
		}	
	}	

}