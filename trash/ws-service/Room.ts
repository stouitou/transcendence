import {  generateUID } from "../utils/generateUID";
import { Match } from "../models/gameClass/Match";
import { WebSocket } from "@fastify/websocket";
import { WaitingPlayers, WebSocketGameConfig } from "./ws.service";
import { Player } from "../models/gameClass/Player";
import { LobbyMessageType, LobbyPhase } from "../types/gameUtils.type";


export const lobys = new Map<string, Loby>();


export class Loby{
  private _lobyId: string = "";//unique lobyIdentifier for the room
  private wsPlayers: Map<number,WebSocket> = new Map();
//  private tournamentId: number = -1;
  private 	config:{
		_type:string,//remote or local
		_format:string,//classic or tournament
		_mode:string,//normal or rapid ..  //@TODO a redefinir
		_tournamentId:number|null,
		_maxPlayers:number,
		_isallowedRegistration:boolean,
		_gameId:number, //@TODO a redefinir
		_state:string,
		_players:WaitingPlayers[],
		_waitingList:WaitingPlayers[]
		} = {
				_type:"local",
				_format: "classic",
				_mode: "normal",
				_tournamentId: null,
				_maxPlayers: 2,
				_isallowedRegistration: true,
				_gameId: -1,
				_state: "open",
				_players: [],
				_waitingList: [],
			};



 matches = new Map<string, Match>();
  constructor() {}
  private count = 10;
  private currentTimeout: NodeJS.Timeout | null = null;
  phase: LobbyPhase = LobbyPhase.WaitingForPlayers;
  waitmessage() {
	const message = {
		type: "startGame",
		lobyId: this._lobyId,
		count: this.count,
	};
	this.broadcastMessageToLoby(JSON.stringify(message));
	this.count--;
}
isStarted: boolean = false;
start(){
	if (this.isStarted) {
		console.log("Lobby already started");
		return;
	}
	this.isStarted = true;
	this.transitionTo(LobbyPhase.CountdownToStart);	  
}

currentInterval: NodeJS.Timeout | null = null;
transitionTo(newPhase: LobbyPhase) {
	// Clear the previous timeout if it exists
    if (this.currentTimeout) clearTimeout(this.currentTimeout);
	if (this.currentInterval) clearInterval(this.currentInterval);
    this.phase = newPhase;
    console.log(`Transitioning to phase: ${LobbyPhase[newPhase]}`);

    switch (newPhase) {
      case LobbyPhase.CountdownToStart:
		this.broadcast(LobbyMessageType.MESSAGE,"Le match est cree en bdd ..");
       
			const config:WebSocketGameConfig = {
				type: this.config._type,
				format: this.config._format,
				//mode: this.config._mode,
				tournamentId: null,
				maxPlayers: this.config._maxPlayers,
				isallowedRegistration: this.config._isallowedRegistration,
				gameId: this.config._gameId,
				state: "playing",
				players: this.config._players,
			  };
			const match = this.createMatch(config);
			console.log("Match created in transition",match);

			
        this.broadcast(LobbyMessageType.MESSAGE,"Le match commence dans 5 secondes...");
       //envoi d'un compte a rebour
		this.waitmessage();
		this.currentInterval = setInterval(async () => {
		  if (this.count > 0) {
			this.waitmessage();
		  } else {
			clearInterval(this.currentTimeout!);
			this.transitionTo(LobbyPhase.MatchRunning);
		  }
		}, 1000);
		// Timeout pour le début du match
		
		/* this.currentTimeout = setTimeout(() => {
          this.transitionTo(LobbyPhase.MatchRunning);
        }, 5000); */
        break;

/* 		case LobbyPhase.createMatchInDb:
			this.broadcast(LobbyMessageType.MESSAGE,"Le match est cree en bdd ..");
       
			const config:WebSocketGameConfig = {
				type: this.config._type,
				format: this.config._format,
				//mode: this.config._mode,
				tournamentId: null,
				maxPlayers: this.config._maxPlayers,
				isallowedRegistration: this.config._isallowedRegistration,
				gameId: this.config._gameId,
				state: "playing",
				players: this.config._players,
				//waitingList: this.config._waitingList,
			  };
			const match = this.createMatch(config);
			console.log("Match created in transition",match);
			break; */

      case LobbyPhase.MatchRunning:
		//les joueur sont prets
		//les ajouter a leurs parties respectives

      //  this.match.start();
        this.broadcast(LobbyMessageType.MESSAGE,"Match en cours...");
		console.log("Match en cours... , matchches.lengt",this.matches.size);
		//parcourir les matchs et demarrer
		this.matches.forEach((match) => {
			//attacher les sockets des joueurs
			const playersIds = match.config.players.map((player) => player.userId);
			if (playersIds.length === 0) {
				console.error(`0-No players found for match ${match.id}`);
				return;
			}
			playersIds.forEach((id) => {
				const socket = this.wsPlayers.get(Number(id));
				if (!socket) {
					console.error(`9-Socket not found for player ID ${id}`);
					return;
				}
				const player = this.config._players.find((player) => player.userId === id);
				if (!player) {
					console.error(`10-Player not found for ID ${id}`);
					return;
				}
				match.addPlayer(new Player(player));
				match.setPlayers()
				//ajouter le socket au match
				match.addSocketPlayer(socket, id);
				socket.send(JSON.stringify({ type: "MESSAGE", socket:'is set', id: id ,typeof: typeof id}));

				//socket.send(JSON.stringify({ type: "data", data: match.toJSON() }));
			});
			match.bradcastMessage(match.toJSON(),'data');
			//demarrer le match
				match.start();
			console.log("match started");
		});
        // Timeout max du match
        this.currentTimeout = setTimeout(() => {
          this.transitionTo(LobbyPhase.MatchTimeout);
        }, 60000); // ex: 60s max
        break;

      case LobbyPhase.MatchTimeout:
       // this.match.stop();
        this.broadcast(LobbyMessageType.MESSAGE,"Temps écoulé, match terminé.");
		this.matches.forEach((match) => {match.stop();}); //@TODO match.forceStopIfNotEnded();
        this.transitionTo(LobbyPhase.WaitingOthersToFinish);
        break;

		case LobbyPhase.WaitingOthersToFinish:
			this.broadcast(LobbyMessageType.MESSAGE,"En attente des autres joueurs...");
	
			const checkCompletion = () => {
			//  const allDone = this.matches.every(m => m.isOver());
			  const allDone = Array.from(this.matches.values()).every((match) => match.isStarted/* isOver() */);
			  if (allDone) {
				this.broadcast(LobbyMessageType.MESSAGE,"Tous les matchs sont terminés !");
				this.transitionTo(LobbyPhase.SavingResults);
			  } else {
				this.broadcast(LobbyMessageType.MESSAGE,"Certains matchs sont encore en cours...");
				this.currentTimeout = setTimeout(checkCompletion, 3000);
			  }
			};
	
			checkCompletion();
			break;

      case LobbyPhase.SavingResults:
     //   this.saveMatchResults();
        this.broadcast(LobbyMessageType.MESSAGE,"Résultats en cours de sauvegarde...");
        this.currentTimeout = setTimeout(() => {
          this.transitionTo(LobbyPhase.Finished);
        }, 3000);
        break;

      case LobbyPhase.Finished:
        this.broadcast(LobbyMessageType.MESSAGE,"Match terminé. Merci !");
        // Optionnel: clean lobby, match, joueurs...
        break;
    }
  }

 istestmatch = false;
  createMatch(config: WebSocketGameConfig) {
	if (this.istestmatch) return
	this.istestmatch = true;
	//const match = createMatch(config,this._lobyId);
	const id = generateUID();
  const match = new Match(this.lobyId,id,config);
  //this.matches.set(id, match);
	match.processDataBaseCreateMatch().then((data) => {
		console.log("[Loby] createMatch data",data);
		console.table("[Loby] createMatch data.players",data.players);
	this.matches.set(match.id, match);
	return match;
	}).catch((error) => {
		console.error("createMatch error",error);
	});
	return match;

  }


  addSocketPlayer(socket: WebSocket,playerId:number) {
	const index = this.config._players.findIndex((player) => player.userId === playerId);
	if (index === -1) {
		console.error(`addSocketPlayer to room Player with ID ${playerId} not found`);
	  console.error(`addSocketPlayer Players `,this.config._players);
	  return;
	}
	  this.config._players[index].isInGame = true;
	  console.log(`addSocketPlayer to room Player with ID ${playerId} found, type ${typeof playerId}`);
	  if (!socket) {
		console.error(`addSocketPlayer to room Player with ID ${playerId} socket not found`);
	  }
	  this.wsPlayers.set(playerId, socket);
	 // this.players[index].isRemote = true;
	 //if game local
	  if (this.config._type === "local") {
		//set each player isInGame to true
		this.config._players.forEach((player) => {
		  player.isInGame = true;
		  player.state = "playing";
		//  player.isRemote = false;
		});
	  }
	  console.log(`[Loby] addSocketPlayer to room Player with ID ${playerId} added`);
	}
  setLobyId(lobyId: string) {
	this._lobyId = lobyId;
  }
  get lobyId() {
	return this._lobyId;
  }
  setMode(mode: string) {
	this.config._mode = mode;
	return this;
  }
  get mode() {
	return this.config._mode;
  }
  setFormat(format: string) {
	this.config._format = format;
	return this;
  }
  get format() {
	return this.config._format;
  }
  setType(type: string) {
	this.config._type = type;
	return this;
  }
  get type() {
	return this.config._type;
  }
  setState(state: string) {
	this.config._state = state;
	return this;
  }
  get state() {
	return this.config._state;
  }
  setMaxPlayers(maxPlayers: number) {
	this.config._maxPlayers = maxPlayers;
	return this;
  }
  get maxPlayers() {
	return this.config._maxPlayers;
  }
  setIsAllowedRegistration(isallowedRegistration: boolean) {
	this.config._isallowedRegistration = isallowedRegistration;
	return this;
  }
  get isAllowedRegistration() {
	return this.config._isallowedRegistration;
  }

  setTournamentId(tournamentId: number) {
	this.config._tournamentId = tournamentId;
  }
  addPlayer(id:number,wsPlayer: WebSocket) {
	this.wsPlayers.set(id,wsPlayer);
  }

  setPlayers(players: WaitingPlayers[]) {
	this.config._players = players;
	return this;
  }
  addPlayerToLoby(player: WaitingPlayers) {
	// check if player is already in players
	const existingPlayer = this.config._players.find((p) => p.userId === player.userId);
	if (existingPlayer) {
	  console.log(`Player ${player.name} is already in players`);
	  return;
	}
	this.config._players.push(player);
  }

  addPlayerToWaitingList(player: WaitingPlayers) {
		  // check if player is already in players
	const existingPlayer = this.config._players.find((p) => p.userId === player.userId);
	if (existingPlayer) {
	console.log(`Player ${player.name} is already in players`);
	return;
	}
	// check if player is already in waiting list
	const existingWaitPlayer = this.config._waitingList.find((p) => p.userId === player.userId);
	if (existingWaitPlayer) {
	console.log(`Player ${player.name} is already in waiting list`);
	return;
	}
	this.config._waitingList.push(player);
	}
 addPlayerFromWaitingList(id: number|null):boolean {
	if (id === null) {
	  console.log(`Player ID is null`);
	  return false;
	}
	const playerExists = this.config._players.some((player) => player.userId === id);
	if (playerExists) {
	  console.log(`Player with ID ${id} already in players list`);
	  return false;
	}

	const player = this.config._waitingList.find((p) => p.userId === id);
	if (!player) {
	  console.log(`Player with ID ${id} not found in waiting list`);
	  return false;
	}
	// Remove player from waiting list
	const playerIndex = this.config._waitingList.indexOf(player);
	if (playerIndex !== -1) {
	  this.config._waitingList.splice(playerIndex, 1);
	  console.log(`Player ${player.name} removed from waiting list`);
	}
	// Add player to players list
	player.state = "joined";
	this.config._players.push(player);
	console.log(`Player ${player.name} added to players list`);
	// Send message to all players in the room
/* 	const message = {
	  type: "playerAdded",
	  player: player,
	  lobyId: this._lobyId,
	  state: this.config._state,
	  config: this.config,
	}; */
	//en base de donnees
	//handleAddPlayer
	return true;
	}
  



  broadcastMessageToLoby = (message: string) => {
	for (const socket of this.wsPlayers.values()) {
	  socket.send(message);
	}
  };

  broadcast = (type:LobbyMessageType ,data: any) => {
	const messageObj = {
	  type: type,
	  lobyId: this._lobyId,
	  data,
	}
	const message = JSON.stringify(messageObj);
	for (const socket of this.wsPlayers.values()) {
	  socket.send(message);
	}
  };

  // surcherge pour methode natif json
	toJSON() {
		return {//@TODO player.toJSON()
		  lobyId: this._lobyId,		 
		  config: {
			type: this.config._type,
			format: this.config._format,
			mode: this.config._mode,
			tournamentId: this.config._tournamentId,
			maxPlayers: this.config._maxPlayers,
			isallowedRegistration: this.config._isallowedRegistration,
			gameId: this.config._gameId,
			state: this.config._state,
			players: this.config._players,
			waitingList: this.config._waitingList,
		  },
		};
	  }

}

type wsRoom =  WebSocket | null;
interface Room {
	id: string;
	players: wsRoom[] ;
	matchs: Match[];
  }
  
  const rooms = new Map<string, Room>();

/*   export function createRoom(configs: WebSocketGameConfig[]) {

	const roomId = generateUID();
	const matchs: Match[] = configs.map((config) => {
		return createMatch(config,roomId);
	});
	const room: Room = {
	  id: roomId,
	  players: [],
	  matchs : matchs,
	};
	rooms.set(roomId, room);
  } */

  export function getRoomById(roomId: string): Room | undefined {
	const room = rooms.get(roomId);
	if (!room) {
	  console.error(`Room with ID ${roomId} not found`);
	  return undefined;
	}
	return room;
  }
  export function getRoomByMatchId(matchId: string): Room | undefined {
	const room = Array.from(rooms.values()).find((room) =>
	  room.matchs.some((match) => match.id === matchId)
	);
	if (!room) {	
	  console.error(`Room with Match ID ${matchId} not found`);
	  return undefined;
	}
	return room;
  }

  export function addPlayerToRoom(roomId: string, player: wsRoom) {
	const room = rooms.get(roomId);
	if (!room) {
	  console.error(`Room with ID ${roomId} not found`);
	  return;
	}
	room.players.push(player);
  console.log(`Player added to room ${roomId}`);
  }

  export function removePlayerFromRoom(roomId: string, player: wsRoom) {
	const room = rooms.get(roomId);
	if (!room) {
	  console.error(`Room with ID ${roomId} not found`);
	  return;
	}
	const playerIndex = room.players.indexOf(player);
	if (playerIndex !== -1) {	
	  room.players.splice(playerIndex, 1);
	  console.log(`Player removed from room ${roomId}`);
	}
  }
  export function removeRoom(roomId: string) {
	const room = rooms.get(roomId);
	if (!room) {
	  console.error(`Room with ID ${roomId} not found`);
	  return;
	}
	rooms.delete(roomId);
	console.log(`Room ${roomId} deleted`);
  }