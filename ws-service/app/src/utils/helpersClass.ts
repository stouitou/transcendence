import { WaitingPlayers } from "../services/ws.service";

class DBPlayers {
	type: string;
	is_IA:boolean;
	avatar:string;
	display_name:string;
	score:number
	user:  number | null;
	constructor(type: string, is_IA:boolean, avatar:string, display_name:string, score:number, user: number | null) {

	  this.type = type;
	  this.is_IA = is_IA;
	  this.avatar = avatar;
	  this.display_name = display_name;
	  this.score = score;
	  this.user = user;
  }
  toJSON() {
	  return {
		type: this.type,
		is_IA: this.is_IA,
		avatar: this.avatar,
		display_name: this.display_name,
		score: this.score,
		user: this.user
	  };
	}
  }

export class PlayerConfig {
	id?: number | null;
	name: string | null;
	avatar: string | null;
	state: string | null;
	isInGame: boolean;
	isIA: boolean;
	userId: number | null = null;
	constructor(id: number | null,userId:number|null, name: string | null, avatar: string | null, state: string | null, isInGame: boolean, isIA: boolean) {
	  this.id = id;
	  this.name = name;
	  this.avatar = avatar;
	  this.state = state;
	  this.isInGame = isInGame;
	  this.isIA = isIA;
	  this.userId = null;
	}
	toJSON() {
	  return {
		id: this.id,
		name: this.name,
		avatar: this.avatar,
		state: this.state,
		isInGame: this.isInGame,
		isIA: this.isIA,
		userId: this.userId
	  };
	}
	toWaitingPlayers():WaitingPlayers {
	  return {
		userId: this.userId?? -1,
		id: this.id?? null,
		name: this.name,
		avatar: this.avatar,
		state: this.state,
		isInGame: this.isInGame,
		isIA: this.isIA
	  };
	}
  }
  class ConfigGame {
	type: string;
	format: string;
	tournamentId: number | null;
	maxPlayers: number;
	isallowedRegistration: boolean;
	gameId: number;
	state: string;
	players: PlayerConfig[];
	constructor(config:{type: string, format: string, tournamentId: number | null, maxPlayers: number, isallowedRegistration: boolean, gameId: number, state: string, players: PlayerConfig[]}) {
	  this.type = config.type;
	  this.format = config.format;
	  this.tournamentId = config.tournamentId;
	  this.maxPlayers = config.maxPlayers;
	  this.isallowedRegistration = config.isallowedRegistration;
	  this.gameId = config.gameId;
	  this.state = config.state;
	  this.players = config.players;
	}
	toJSON() {
	  return {
		type: this.type,
		format: this.format,
		tournamentId: this.tournamentId,
		maxPlayers: this.maxPlayers,
		isallowedRegistration: this.isallowedRegistration,
		gameId: this.gameId,
		state: this.state,
		players: this.players
	  };
	}
/* 	sendMessage(socket: IWebSocketsService | null | undefined) {
	  if (!socket) {
		console.error("WebSocket is not initialized");
		return;
	  }
	  const message = JSON.stringify({ type: "gameCreate", gameId: this.gameId, config: this });
	  console.log("sendMessage bu ConfigGame", message);
	  socket.sendMessage(message);
	} */
  }

  class DBCreateGame {
	state:string ="open";	
    max_players:number = 4;
    players: number[]; // user.id[]
    gameHistory: {
		players: DBPlayers[],
		type: string,// "remote" | "local"
		user: number|null//type === 'remote' ? mePlayersId : null,
	}
	constructor(state:string, max_players:number, players: number[], gameHistory: {players: DBPlayers[], type: string, user: number|null}) {
		this.state = state;
		this.max_players = max_players;
		this.players = players;
		this.gameHistory = gameHistory;
	}
	toJSON() {
		return {
			state: this.state,
			max_players: this.max_players,
			players: this.players,
			gameHistory: this.gameHistory
		};
	}
	}