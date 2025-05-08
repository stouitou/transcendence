import { WaitingPlayers } from "../services/ws.service";
import { WebSocket } from "@fastify/websocket"

export type WsPlayers = WebSocket|null;
export interface Position {
	x: number;
	y: number;
  }
export interface Size {
	width: number;
	height: number;
  }


export type playerAction =  "up" | "down" | "left" | "right" | null;
export interface gameLoop {
	//isStarted:boolean,
	ball:{position:{x:number,y:number},size:{width:number,height:number}},
	players:WaitingPlayers[],
	playersActions: playerAction[],
  /* 	paddleObjects?: Paddle[],
	ballObject?: Ball, */
	}
export type Direction = 'left' | 'right' | 'top' | 'bottom';

 //enumeration des phase /etat de la partie
 export enum LobbyPhase {
	createMatchInDb,
	WaitingForPlayers,
	CountdownToStart,
	MatchRunning,
	MatchTimeout,
	WaitingOthersToFinish,
	SavingResults,
	Finished,
	Error,
	NextMatch

  }
  export enum LobbyMessageType {
	Join = "JOIN",
	MESSAGE = "MESSAGE",
}