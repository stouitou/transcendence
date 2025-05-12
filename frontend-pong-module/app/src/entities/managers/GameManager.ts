import { InputManager } from './InputManager';
import { Player } from '../Player';
import { Ball } from '../Ball';
import { CollisionManager } from './CollisionManager';
import { StatisticsManager } from './StatisticsManager';
import { DataMatch } from '../Match';
import { ScoreManager } from './ScoreManager';

export class GameManager {
  private players: Player[] = [];
  private ball: Ball =new Ball({ x: 350, y: 250 }, { width: 16, height: 16 }, { x: 1, y: 1 });;
  private collisionManager:CollisionManager = new CollisionManager();

  private scoreManager: ScoreManager |null = null;
  private statisticsManager: StatisticsManager = new StatisticsManager();
  dataconfig: DataMatch |null = null;

  inputManagers: Map<string, InputManager> = new Map(); // par joueur id

  constructor() {
   // this.players = players;
    this.createBall();
  }
  setDataconfig(dataMatch: DataMatch){
	this.dataconfig = dataMatch;
	return this

  }
  createBall() {
	this.ball = new Ball({ x: 350, y: 250 }, { width: 16, height: 16 }, { x: 1, y: 1 });
}
  private addPlayer(player: Player) {
	this.players.push(player);
	console.log('addPlayer',this.players);
  }
	addPlayers() {
		const dataMatch = this.dataconfig;
		if (!dataMatch) {
			console.error('No dataMatch available');
			return;
		}
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
			const inputManager = new InputManager(index, player.isIA);
			const  newPlayer = new Player(jsonData,index,inputManager)
			this.inputManagers.set(player.id.toString(), inputManager);

			this.addPlayer(newPlayer);
		});

	}

	clearPlayers() {
		if (this.players.length > 0) {
			//this.players.forEach((player) => {})
			this.players = [];
		}
	}

  setupGame() {
    this.clearPlayers();
    this.ball.reset({ x: 350, y: 250 }, { x: 5, y: 5 });
	this.addPlayers();
	this.scoreManager = new ScoreManager(this.players);
  }
  /**
   * * Met à jour le mouvement des joueurs 
   * * Chaque IA ajuste sa position pour suivre la balle.
   */
  updatePlayersMovement() {
	//for (const [index, player] of this.players.entries()) {
	for (const player of this.players) {
			 player.updateMovement(this.ball);
	}	
  }	
  /**
   * * Met à jour l'état du jeu, y compris la position de la balle et des joueurs.
   * * Vérifie les collisions et met à jour le score.
   */
  update() {
    // Mettre à jour les joueurs
	this.updatePlayersMovement();

    // Mettre à jour la balle, deleguer a la classe Ball
    this.ball.update();

    // Déléguer la gestion des collisions au CollisionManager
    this.collisionManager.handleCollisions(this.ball, this.players);

    // Mettre à jour les statistiques, deleguer a la classe StatisticsManager
    this.statisticsManager.updateStatistics(this.ball, this.players);

	// Mettre à jour le score, deleguer a la classe ScoreManager
	if (this.scoreManager) {
		this.scoreManager.updateScore(this.ball);		
	}

  }

  /**
   * * Vérifie si un joueur a atteint le score maximum.
   * * Si oui, arrête le jeu et envoie un message via WebSocket.
   */
  checkMaxScore(wsMessageHandler: (data: any) => void):boolean {
	if (this.scoreManager) {
		if (!this.dataconfig)  return true;//stop game
		return this.scoreManager.checkMaxScore(wsMessageHandler,this.dataconfig?.lobyId!,(this.dataconfig.id));
	}
	return true;//stop game
 }

  getBall() {
    return this.ball;
  }

  getPlayers() {
    return this.players;
  }


  /**
   * met à jour l'état du jeu avec les données reçues du serveur.
   * @param game 
   */
  updateGameState(game:{ball:{position: {x:number,y:number},size:{width:number,height:number}}, players: Player[]}) {
	this.ball.position = game.ball.position;
	//	this.ball.size = game.ball.size;
	for (const [index, player] of game.players.entries()) {
		//this.players[index].paddle.position = player.position;
		if (this.players[index].paddle && player.paddle) {
		this.players[index].paddle.position = player.paddle.position;
		}
		/* this.players[index].paddle.size = player.paddle.size; */
		this.players[index].score = player.score;
	}
  }
}