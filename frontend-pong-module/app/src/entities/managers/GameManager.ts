import { InputManager } from './InputManager';
import { Player } from '../Player';
import { CollisionManager } from './CollisionManager';
import { StatisticsManager } from './StatisticsManager';
import { ScoreManager } from './ScoreManager';
import { Ball } from '../Ball';
import { DataMatch } from '../../Interfaces/DataMatch.interface';

export class	GameManager {

	private				_players: Player[] = [];
	private readonly	_ball: Ball;
	
	private				_dataConfig: DataMatch | null = null;
	private readonly	_collisionManager: CollisionManager = new CollisionManager();
	private 			_scoreManager: ScoreManager | null = null;
	private readonly	_statisticsManager: StatisticsManager = new StatisticsManager();
	private readonly	_inputManagers: Map< string, InputManager > = new Map(); // par joueur id

	constructor () {
		this._ball = new Ball({ x: 350, y: 250 }, { width: 16, height: 16 }, { x: 1, y: 1 }, 4);
	}

	get players ()							{ return this._players ; }
	get ball ()								{ return this._ball ; }
	get dataConfig () : DataMatch | null	{ return this._dataConfig ; }

	setDataconfig (dataMatch: DataMatch) {
		this._dataConfig = dataMatch;
		return this ;
	}

	private addPlayer (player: Player) {
		this._players.push(player);
	}

	addPlayers () {
		const	dataMatch = this._dataConfig;
		if (!dataMatch)	{ console.error('No dataMatch available'); return ; }

		dataMatch.players.forEach((player, index) => {
			const	jsonData = {
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
			this._inputManagers.set(player.id.toString(), inputManager);

			this.addPlayer(newPlayer);
		});
	}

	clearPlayers () {
		if (this._players.length > 0) {
			this._players = [];
		}
	}

	setupGame () {
		this.clearPlayers();
		this._ball.reset();
		this.addPlayers();
		this._scoreManager = new ScoreManager(this._players);
	}

	update () {
		// Update players
		this.updatePlayersMovement();

		// Update ball, Ball Class responsability
		this._ball.update();

		// CollisionManager responsability
		this._collisionManager.handleCollisions(this._ball, this._players);

		// Update statistics, StatisticsManager Class responsability
		this._statisticsManager.updateStatistics(this._ball, this._players);

		// Update score, ScoreManager Class responsability
		if (this._scoreManager) {
			this._scoreManager.updateScore(this._ball);		
		}
	}

	/**
	 * * Vérifie si un joueur a atteint le score maximum.
	 * * Si oui, arrête le jeu et envoie un message via WebSocket.
	 */
	checkMaxScore (wsMessageHandler : (data: any) => void) : boolean {
		if (this._scoreManager) {
			if (!this._dataConfig)	{ return true ; }	// stop game
			return this._scoreManager.checkMaxScore(wsMessageHandler, this._dataConfig?.lobyId!, (this._dataConfig.id));
		}
		return true ;	//stop game
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