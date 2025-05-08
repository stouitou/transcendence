import { WaitingPlayers } from "../../services/ws.service";

export class PlayerManager {
	private players: WaitingPlayers[] = [];
	private waitingList: WaitingPlayers[] = [];

	getPlayerById(id: number): WaitingPlayers | null {
	  const player = this.players.find((p) => p.userId === id);
	  if (!player) {
		console.log(`Player with ID ${id} not found in players`);
		return null;
	  }
	  return player;
	}
  
	addPlayer(player: WaitingPlayers): void {
	  if (this.players.find((p) => p.userId === player.userId)) {
		console.log(`Player ${player.name} is already in players`);
		return;
	  }
	  this.players.push(player);
	  console.log(`Player ${player.name} added to players list`);
	}
  
	addPlayerToWaitingList(player: WaitingPlayers): void {
	  if (this.players.find((p) => p.userId === player.userId)) {
		console.log(`Player ${player.name} is already in players`);
		return;
	  }
	  if (this.waitingList.find((p) => p.userId === player.userId)) {
		console.log(`Player ${player.name} is already in waiting list`);
		return;
	  }
	  this.waitingList.push(player);
	  console.log(`Player ${player.name} added to waiting list`);
	}
  
	addPlayerFromWaitingList(id: number|null):boolean {
		if (id === null) {
		  console.log(`Player ID is null`);
		  return false;
		}
		if (this.players.find((p) => p.userId === id)) {			
			console.log(`Player with ID ${id} not found in waiting list`);
			return false;
		  }	
		const player = this.waitingList.find((p) => p.userId === id);
		if (!player) {
		  console.log(`Player with ID ${id} not found in waiting list`);
		  return false;
		}
		// Remove player from waiting list
		const playerIndex = this.waitingList.indexOf(player);
		if (playerIndex !== -1) {
		  this.waitingList.splice(playerIndex, 1);
		  console.log(`Player ${player.name} removed from waiting list`);
		}
		// Add player to players list
		player.state = "joined";
		this.players.push(player);
		console.log(`Player ${player.name} added to players list`);
		return true;
	}

	removePlayerFromWaitingList(id: number): WaitingPlayers | null {
	  const playerIndex = this.waitingList.findIndex((p) => p.userId === id);
	  if (playerIndex === -1) {
		console.log(`Player with ID ${id} not found in waiting list`);
		return null;
	  }
	  const [player] = this.waitingList.splice(playerIndex, 1);
	  console.log(`Player ${player.name} removed from waiting list`);
	  return player;
	}
  
	getPlayers(): WaitingPlayers[] {
	  return this.players;
	}
  
	getWaitingList(): WaitingPlayers[] {
	  return this.waitingList;
	}

	setPlayers(waitingPlayers:WaitingPlayers[]) {
		this.players = waitingPlayers;
	}
	setPlayerIsInGame(id: number, isInGame: boolean): void {
	  const player = this.players.find((p) => p.userId === id);
	  if (!player) {
		console.log(`Player with ID ${id} not found in players`);
		return;
	  }
	  player.isInGame = isInGame;
	  console.log(`Player ${player.name} state updated to ${isInGame}`);	
	}

  }