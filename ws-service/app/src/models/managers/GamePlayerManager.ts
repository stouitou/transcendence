import { Player } from "../../models/gameClass/Player";
import { WaitingPlayers } from "../../services/ws.service";
import { playerAction } from "../../types/gameUtils.type";
import { Ball } from "../gameClass/Ball";

export class GamePlayerManager {
	private _players: Player[] = [];
	private playerActions: playerAction[] = [];
  
	constructor(initialPlayers: WaitingPlayers[], difficulty:number ) {
	  this._players = initialPlayers.map((playerData, index) => new Player(playerData, index, difficulty));
	  this.playerActions = initialPlayers.map(() => null);
	}
	isPlayer(playerId: number): boolean {
	  const player = this._players.find((p) => p.userId === playerId);
	  if (!player) {
		console.log(`[GamePlayerManager.isPlayer] Player with ID ${playerId} not found in players`);
	//	console.log(`[GamePlayerManager.isPlayer] Players: ${JSON.stringify(this._players)}`);
		return false;
	  }
	  return true;
	}
	setIsInGame(playerId: number, isInGame: boolean): void {
	  const player = this._players.find((p) => p.userId === playerId);
	  if (!player) {
		console.log(`[GamePlayerManager.setIsInGame] Player with ID ${playerId} not found in players`);
		return;
	  }
	  player.isInGame = isInGame;
	  console.log(`[GamePlayerManager.setIsInGame] Player ${player.name} isInGame set to ${isInGame}`);
	}

	incrementPlayerScorebyIndex(index: number): void {
	  if (index >= 0 && index < this._players.length) {
		this._players[index].score++;
	  } else {
		console.error("Index out of bounds");
	  }
	}
	setPlayerScorebyIndex(index: number, score: number): void {
	  if (index >= 0 && index < this._players.length) {
		this._players[index].score = score;
	  } else {
		console.error("Index out of bounds");
	  }
	}
  
	addPlayer(player: Player): void {
	  this._players.push(player);
	  this.playerActions.push(null);
	}

	get players(): Player[] {
	  return this._players;
	}
	set players(players: Player[]) {
	  this._players = players;
	  this.playerActions = players.map(() => null);
	}
  
	getPlayers(): Player[] {
	  return this._players;
	}

	updatePlayerBotMovement(ball:Ball): void {
	  this._players.forEach((player,index) => {
		if (player.isIA) {
		  player.bot?.move(ball);		 
		  // Update player action based on bot movement
		  this.playerActions[index] = player.directionReceived || null;
		}
	  });
	}
  
	getPlayerActions(ball:Ball): playerAction[] {
		this.updatePlayerBotMovement(ball);
	  return this.playerActions;
	}
  
	areAllPlayersInGame(): boolean {
	  return this._players.every((player) => { player.isInGame });
	}
  
	areAllPlayersFinished(): boolean {
	  return this._players.every((player) => player.state === "finished");
	}

	updatePlayerAction = (playerIndex:number,action:playerAction) => {
		//check if is Allowed
		const allowedDirections = [["left", "right",null],["up", "down",null]];
		if (playerIndex > 1) {
			// Player 2 and 3 can only move left or right
			if (!allowedDirections[0].includes(action!)) {
				console.error("Invalid action for player 0 or 1");
				return;
			}
		} else {
			// Player 0 and 1 can only move up or down
			if (!allowedDirections[1].includes(action!)) {
				console.error("Invalid action for player 2 or 3");
				return;
			}
		}
		this.playerActions[playerIndex] = action;
	}

		/**
	message: {"type":"UPDATESCORE",
	"gameId":"65votllgq5dma811jha",
	"lobyId":"7ljfg13jckama810wyn",
	"data":{
		"players":[
			{
				"state":"finished",
				"name":"nizar brigui",
				"isRemote":false,
				"isIA":false,
				"isInGame":false,
				"score":1,
				"position":{"x":0,"y":0},
				"paddle":{
					"position":{"x":20,"y":385},
					"size":{"width":10,"height":100}
					},
				"direction":"left",
				"id":335
				},
			{"state":"finished","name":"IA-2","isRemote":false,"isIA":true,"isInGame":false,"score":5,"position":{"x":0,"y":0},"paddle":{"position":{"x":780,"y":260},"size":{"width":10,"height":100}},"direction":"right","id":336}]}}
	
	 */
	setLocalScore(data:{players:{id:number,score:number,state:string}[]}): void {
	//	console.log("setLocalScore this.players",this.players);
		data.players.forEach((playerData) => {
			const player = this.players.find((p) => p.id === playerData.id);
			if (!player) {
				console.log(`Player with ID ${playerData.id} not found in players`);
				return;
			}
			player.score = playerData.score;
			player.state = playerData.state;
			console.log(`Player ${player.name} score updated to ${playerData.score}`);
		});
	}
  
	toJSON(): any {
	  return this._players.map((player) => ({
		id: player.id,
		name: player.name,
		avatar: player.avatar,
		state: player.state,
		isInGame: player.isInGame,
		isIA: player.isIA,
		position: player.position,
		size: player.size,
		score: player.score,
		paddle: player.paddle?.toJSON(),
		userId: player.userId,
	 }));
	}
  }