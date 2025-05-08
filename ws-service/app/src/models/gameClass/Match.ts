import { WsPlayers } from "../../types/gameUtils.type";

import { Ball } from "../../models/gameClass/Ball";
import { Paddle } from "../../models/gameClass/Paddle";
import { WaitingPlayers, WebSocketGameConfig } from "../../services/ws.service";

import { WebSocket } from "@fastify/websocket"
import { playerAction } from "../../types/gameUtils.type";
import { GameLoopData } from "../../models/gameClass/GameLoop";
import { Player } from "../../models/gameClass/Player";

class Observer{
	isInitialized:boolean = false;
	isStarted:boolean = false;
}

export class Match {
	observer: Observer = new Observer();
	isStarted: boolean = false;
	lobyId: string; //uuid du loby
	id: string;// uuid du match

	gameHistoryId:number|null = null;

	wsPlayers: WsPlayers[];
	players: Player[] = [];
	playersActions: playerAction[] = [];
	//paddles: Paddle[] = [];
	ball: Ball;
	intervalId: NodeJS.Timeout | null = null;
	canvas:{width:number,height:number} = {width:800,height:600};
	config:{type:string,
		format:string,
		tournamentId:number|null,
		maxPlayers:number,
		isallowedRegistration:boolean,
		gameId:number,
		//gameHistoryId:number,
		state:string,
		players:WaitingPlayers[],
	    waitingList:WaitingPlayers[]} = {
			type:"pong",format:"classic",
			tournamentId:null,
			maxPlayers:4,
			isallowedRegistration:true,
			gameId:-1,
			state:"open",
			players:[],
			waitingList:[]};
  
	constructor(lobyId:string,id: string,config:WebSocketGameConfig) {
	  this.lobyId = lobyId;
	  this.id = id;// ID unique du match
	  this.wsPlayers = [];// Liste des joueurs connectés
	  this.ball = new Ball({ x: this.canvas.width/2,y:this.canvas.height }, { width: 10, height: 10 }, { x: 10, y: 10 });
/* 	  this.paddles =config.players.map((player) => {
		const initialPosition = { x: player.position!.x, y: player.position!.y };
		const size = player.size!;
		return new Paddle(initialPosition, size);
	  }); */
	  this.players = config.players.map((playerData, index) => {
		return new Player(playerData, index);});
		
	  this.playersActions = config.players.map(() => (null))
	  this.config = {...config,waitingList:[]};
	}

	addPlayer(player: Player) {
	  this.players.push(player);
	  this.playersActions.push(null);
	//  this.wsPlayers.push(null);
	}
	addPlayerToWaitingList(player: Player) {
	  // check if player is already in players
	  const existingPlayer = this.config.players.find((p) => p.id === player.id);
	  if (existingPlayer) {
		console.log(`Player ${player.name} is already in players`);
		return;
	  }
	 // check if player is already in waiting list
	  const existingWaitPlayer = this.config.waitingList.find((p) => p.id === player.id);
	  if (existingWaitPlayer) {
		console.log(`Player ${player.name} is already in waiting list`);
		return;
	  }
	  this.config.waitingList.push(player);
	}
	addPlayerFromWaitingList(id:number) {
	  const player = this.config.waitingList.find((player) => player.id === id);
	  if (player) {
		player.state = "joined";
		this.config.players.push(player);
		this.config.waitingList = this.config.waitingList.filter((p) => p.id !== id);
		this.setPlayers();
	  }

	}
	setPlayers(){
		this.players = this.config.players.map((playerData, index) => {
			return new Player(playerData, index);
		  });
		this.playersActions = this.config.players.map(() => (null))
	}
	setPlayerState(state:string,playerId:number){
		const index = this.players.findIndex((player) => player.id === playerId);
	if (index === -1) {
	  console.error(`Player with ID ${playerId} not found`);
	  return;
	}
	  this.players[index].state = state;
	  if (state === "finished" || state === "left") {
		this.players[index].isInGame = false;
	  }
	}
	addSocketPlayer(socket: WebSocket,playerId:number) {
	const index = this.players.findIndex((player) => player.userId === playerId);
	if (index === -1) {
	  console.error(`addSocketPlayer to match Player with ID ${playerId} not found`);
	  return;
	}
	  this.players[index].isInGame = true;
	  this.wsPlayers[index] = socket;
	 // this.players[index].isRemote = true;
	 //if game local
	  if (this.config.type === "local") {
		//set each player isInGame to true
		this.players.forEach((player) => {
		  player.isInGame = true;
		  player.state = "playing";
		  player.isRemote = false;
		});
	  }
	}
  
	start() {
		this.observer.isStarted
		//if (this.isStarted) {
		if (this.observer.isStarted) {
		  console.log("Match already started");
		  return;
		}
	//  this.setPlayers();
	this.observer.isStarted = true;
	  if (this.config.type === "remote") {
	  this.intervalId = setInterval(() => this.update(), 1000 / 60);
	  }
	  else if (this.config.type === "local") {
	  this.intervalId = setInterval(() => null, 1000 / 60);
	  }
	}
  
	update() {
		//all players are in game
		if (this.players.every((player) => player.isInGame)) {		
			this.updateMovement();
			this.ball.update();
			this.checkCollisions();
			this.broadcastState();
		}
		else
		{
			this.broadcastState();
		}
		if (this.players.every((player) => player.state === "finished")) {
			this.stop();
			this.isOver();
			console.log("Match finished");
		}
	}

	updatePlayerAction = (playerIndex:number,action:playerAction) => {
		//check if is Allowed
				//check if is Allowed direction
		const allowedDirections = [["left", "right",null],["up", "down",null]];
		if (playerIndex > 1) {
			// Player 0 and 1 can only move left or right
			if (!allowedDirections[0].includes(action!)) {
				return;
			}
		} else {
			// Player 2 and 3 can only move up or down
			if (!allowedDirections[1].includes(action!)) {
				return;
			}
		}
		this.playersActions[playerIndex] = action;
	}
  
	stop() {
	  if (this.intervalId) {
		clearInterval(this.intervalId);
	  }
	}
	bradcastMessage( message: any,type:string ="MESSAGE") {
	  for (const wsPlayer of this.wsPlayers) {
		if (!wsPlayer) continue;
		wsPlayer.send(JSON.stringify({ type: type, data: message }));
	  }
	}
	//broadcast message to all players
  
	broadcastState() {
	  //const state = { ball: this.ball.position };
	  const game = new GameLoopData({
		ball: this.ball,
		players: this.players.map((player) => ({
		  userId: player.userId,
		  id: player.id,
		  name: player.name,
		  avatar: player.avatar,
		  state: player.state,
		  isInGame: player.isInGame,
		  position: player.paddle.position,
		  score: player.score,
		  isIA: player.isIA,
		 // isRemote: player.isRemote,
		  paddle: player.paddle,
		  //direction: player.direction,
		 // size: player.size,
		})),
		playersActions: this.playersActions,
	  });
	  for (const wsPlayer of this.wsPlayers) {
		//wsPlayer.send(JSON.stringify({ type: "UPDATE", data: state }));
		if (!wsPlayer) continue;
		wsPlayer.send(JSON.stringify({ type: "state", game }));
	  }
	}
  
	checkCollisions() {
	  // Détecte collisions balle/barres
	  		// Collision balle / paddles
		for (const [index, player] of this.players.entries()) {
			if (this.hasCollision(player.paddle)) {
			  this.handleBallBounce(index);
			}
		  }
		  const wallIndex = this.wallCollision();
		  this.updateScore(wallIndex);
	}

	
	hasCollision = (paddle: Paddle): boolean =>{
		return (
			this.ball.position.x < paddle.position.x + paddle.size.width &&
			this.ball.position.x + this.ball.size.width > paddle.position.x &&
			this.ball.position.y < paddle.position.y + paddle.size.height &&
			this.ball.position.y + this.ball.size.height > paddle.position.y
		);
		}
	
	handleBallBounce=(playerIndex: number)=> {
		// Inverser la vélocité selon le côté du paddle touché
		if (playerIndex === 0 || playerIndex === 1) {
			this.ball.velocity.x *= -1;
		} else if (playerIndex === 2 || playerIndex === 3) {
			this.ball.velocity.y *= -1;
		}
		}
	
		wallCollision = (): number=> {
			// Collision avec les murs
			//mur left 
			if (this.ball.position.x <= 0) {
				this.ball.velocity.x *= -1; // Inverser la direction horizontale
				return 0; // 
			  }
			//mur right
			if (this.ball.position.x + this.ball.size.width >= this.canvas.width) {
				this.ball.velocity.x *= -1; // Inverser la direction horizontale
				return 1; //
			}
			//mur top
			if (this.ball.position.y <= 0) {
				this.ball.velocity.y *= -1; // Inverser la direction verticale
				return 2; //
			  }
			//mur botom
			if (this.ball.position.y + this.ball.size.height >= this.canvas.height) {
				this.ball.velocity.y *= -1; // Inverser la direction verticale
				return 3; //
			  }
			return -1; // Aucune collision
		  }
	
		 updateScore = (wallIndex:number)=>{
			const maxScore = 5; // Score maximum pour gagner //@TODO
			// Vérifier si la collision est valide
			if (wallIndex === -1) return; // Pas de collision avec un mur
			if (this.players.length <= wallIndex) return; // Pas de joueur pour ce mur
		
			let resetBall = false;
		
			// Parcourir les joueurs pour mettre à jour le score
			let score = 0;
			for (const [index, player] of this.players.entries()) {
				if (index !== wallIndex) {
					if (player.score === undefined) {
						player.score = 0; // Initialiser le score à 0 si non défini
					}
					// Si ce n'est pas le joueur défendant le mur, incrémenter son score
					player.score++;
					if (score <= player.score) {
						score = player.score;
					}
					resetBall = true;
				 //   console.log(`id:${player.id} name:${player.name} score: ${player.score}`);
				}
			}
		
			// Réinitialiser la balle si un point a été marqué
			if (resetBall) {
				// Vérifier si le score maximum est atteint
				if (score >= maxScore) {
					// les player passe en finished
					this.players.forEach((player) => {
							player.state = "finished";
							player.isInGame = false;
					}
					);
					
				}
				this.ball.reset({ x: this.canvas.width / 2, y: this.canvas.height / 2 }, { x: 1, y: 1 });
			}
		  }



		  // Mappings pour les mouvements locaux

	localBindMappings  =  {
		up: { dx: 0, dy: -5},// up
		down: { dx: 0, dy: 5},// down
		left: { dx: -5, dy: 0 },// left
		right: { dx: 5, dy: 0 },// right
	  }
	updateMovement = () => {
		// Déplacements paddles
		for (const [index, player] of this.players.entries()) {
			// 0 -le joueur est il une ia
			const IAMouvement = player.isIA?this.moveBot(player,index):null ;
			
			//recupere le mouvement du joueur 
			const newmove = !player.isIA?this.playersActions[index]:IAMouvement ;
			// 1 - recuperer le inputManager du joueur
		 // const inputManager = this.inputManagers.get(player.id);
		  if (newmove) {
			console.log("newmove index [",index,"]",newmove);
			// 2 - recuperer le mouvement du joueur
			const movement = this.localBindMappings[newmove];
			// 3 - mettre a jour les donnees la position du paddle
			player.paddle.move(movement.dx, movement.dy);
			// 4 - mettre a jour la position du joueur
			player.position = player.paddle.position;
			
			//paddles[index].setPosition(player.position!);
		  }
		}
	}


	moveBot = (player: Player, index: number): playerAction => {
		const canvas = { width: 800, height: 600 };
	
		const botPos = player.position!;
		const botSize = player.size;
		const ballPos = this.ball.position;
		const ballVel = this.ball.velocity;
	
		// Center of the paddle
		const botCenterX = botPos.x + botSize.width / 2;
		const botCenterY = botPos.y + botSize.height / 2;
	
		// Center of the ball
		const ballCenterX = ballPos.x + this.ball.size.width / 2;
		const ballCenterY = ballPos.y + this.ball.size.height / 2;
	
		//const botSpeed = 5; // Speed at which the bot can move
		const tolerance = 10; // Tolerance so the bot doesn't jitter when close
	
		let targetX = botCenterX;
		let targetY = botCenterY;
	
		switch (index) {
			case 0: // Left wall
				if (ballVel.x < 0) {
					targetY = ballCenterY; // Move to align with ball
				} else {
					targetY = canvas.height / 2; // Go back to center
				}
				if (Math.abs(botCenterY - targetY) > tolerance) {
					return botCenterY > targetY ? "up" : "down";
				}
				break;
	
			case 1: // Right wall
				if (ballVel.x > 0) {
					targetY = ballCenterY;
				} else {
					targetY = canvas.height / 2;
				}
				if (Math.abs(botCenterY - targetY) > tolerance) {
					return botCenterY > targetY ? "up" : "down";
				}
				break;
	
			case 2: // Top wall
				if (ballVel.y < 0) {
					targetX = ballCenterX;
				} else {
					targetX = canvas.width / 2;
				}
				if (Math.abs(botCenterX - targetX) > tolerance) {
					return botCenterX > targetX ? "left" : "right";
				}
				break;
	
			case 3: // Bottom wall
				if (ballVel.y > 0) {
					targetX = ballCenterX;
				} else {
					targetX = canvas.width / 2;
				}
				if (Math.abs(botCenterX - targetX) > tolerance) {
					return botCenterX > targetX ? "left" : "right";
				}
				break;
		}
	
		return null;
	};

	// surcherge pour methode natif json
	toJSON() {
		return {//@TODO player.toJSON()
		  id: this.id,
		  lobyId: this.lobyId,
		  players: this.players.map((player) => ({
			id: player.id,
			name: player.name,
			avatar: player.avatar,
			state: player.state,
			isInGame: player.isInGame,
			isIA: player.isIA,
			position: player.position,
			size: player.size,
			score: player.score,
			paddle: player.paddle.toJSON(),
			userId: player.userId,
		  })),
		  ball:{position: this.ball.position,size:this.ball.size},
		  config: this.config,
		};
	  }

	  processDataBaseCreateMatcha = async() => {
		const type = this.config.type;
		const players = this.config.players ;
		const databasePlayers = players.map((player) => ({
			type: type,
			is_IA: player.isIA,
			avatar: player.avatar,
			display_name: player.name,
			score: player.score,
			user:  player.userId ==-1? null : player.userId,
		}));
		//playersId = les userId des joueurs si non null
		const playersId = players.map((player) => player.userId).filter((userId) => userId !== -1);

		const dataDB = {
			state:this.config.state,
			type:this.config.type,
			format:this.config.format,
			max_players:this.config.maxPlayers,
			players: playersId?? [],
	 		gameHistory: {
				players: databasePlayers,
				type: type,
				//user: type === 'remote' ? mePlayersId : null,
				}
			};
		//const result = await fetch(`http://database-services:3000/api/v2/database/myDb/table/game?relations=players`, {
		//const result = await fetch(`http://game-management-service:3000/api/game-management-service/games/${type}/${format}/${mode}`, {
			const result = await fetch(`http://game-management-service:3000/docker/games/${this.config.type}/${this.config.format}/normal`, {

			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(dataDB),
			});
		if (result.ok) {
			const data = await result.json();
			//const databasePlayers = data.gameHistory.players;
			//console.log("[Match]processDataBaseCreateMatch createGame data ",data);
			this.config.gameId = data.id;
			this.config.state = data.state;
			this.gameHistoryId = data.gameHistory.id; //utilie pour la mise a jour des resultats

			//on dois metre a jour les id des joueurs via leur userId
			this.config.players = this.config.players.map((player) => {
				const dbPlayer = data.gameHistory.players.find((dbPlayer: any) => dbPlayer.user != null && ( dbPlayer.user.id === player.userId));
				if (dbPlayer) {
					player.id = dbPlayer.id;
					//player.state = "waiting";
					//player.isInGame = false;
					player.score = 0;
				}
				return player;
			});
		//	this.config.players = data.players ?? [];
			console.log("[Match]processDataBaseCreateMatch createGame data ",data);
			console.log("[Match]processDataBaseCreateMatch createGame data.players ",data.players);
			console.log("[Match]processDataBaseCreateMatch createGame data.gameHistory ",data.gameHistory);

			return data;
		} else {
			console.error("GameController createGame error ",result);
			throw new Error("Error creating game");
		}
	}
	processDataBaseSaveMatchResult = async() => {
		console.log("[Match]processDataBaseSaveMatchResult gameId ",this.config.gameId);
		console.log("[Match]processDataBaseSaveMatchResult gameHistoryId ",this.gameHistoryId);

		this.config.state = "finished";
		//determiner le nom du gagnant : player.score le plus eleve
		const winner = this.players.reduce((prev, current) => (prev.score > current.score) ? prev : current);
		console.log("[Match]processDataBaseSaveMatchResult winner ",winner);
		const data = {
			players: this.players.map((player) => ({
				id: player.id,
				score: player.score
			})),
			game: {
				id: this.config.gameId,
				state: this.config.state},
			winner : winner.name,
		}
		console.log("[Match]processDataBaseSaveMatchResult data ",data);
		
		try {
		//const result = await fetch(`https://localhost:4433/api/game-management-service/gameHistory/${this.gameHistoryId}`, {
		const result = await fetch(`http://game-management-service:3000/docker/gameHistory/${this.gameHistoryId}`, {

			method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
				});
			if (result.ok) {
				const data = await result.json();
				console.log("processDataBaseSaveMatchResult data OK ",data);
				this.isGameFinished = true;
				return data;

			} else {
				console.error("processDataBaseSaveMatchResult  error ",result);
				throw new Error("Error creating game");
			}
		} catch (error) {
			console.error("processDataBaseSaveMatchResult error ",error);
			throw error;
		}
	}
	private isGameFinished:boolean = false;	
	isOver(){
		//check if all players are finished
		if (this.players.every((player) => player.state === "finished")) {
			this.stop();
			this.processDataBaseSaveMatchResult();
			console.log("Match finished");
			this.isGameFinished = true;
		}
		return this.isGameFinished;
	}

	}