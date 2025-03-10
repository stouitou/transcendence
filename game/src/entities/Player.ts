import { Paddle } from "./Paddle.js";

export class Player {

	private readonly _name: string;
	private 		_paddle?: Paddle;
	private			_id: number;

	private 		_score: number;
	private			_lastOpponent: string | null = null;
	private			_lastWin: boolean;

	/* CONSTRUCTOR */
/* 	public constructor (name: string) {
		this._name = name;
		this._id = -1;
		this._score = 0;
		this._lastWin = false;
	} */
	public constructor (player: {_name?:string,id?:Number}) {
		this._name = player._name??"rand"
		this._id = -1;
		this._score = 0;
		this._lastWin = false;
	}
	/* GETTERS */
	public get score() {
        return this._score;
    }	

	public get name () {
		return this._name;
	}

	public get id () {
		return this._id;
	}

	public get lastWin () {
		return this._lastWin;
	}

	public get paddle () : Paddle | null {
        return this._paddle ?? null;
    }

	/* SETTERS */
	public set id (id: number) {
		this._id = id;
	}

	public set lastOpponent (lastOpponent: string) {
		this._lastOpponent = lastOpponent;
	}

	public set lastWin (lastWin: boolean) {
		this._lastWin = lastWin;
	}

	public set paddle (location: number) {
		this._paddle = new Paddle(location);
	}

	public incrementScore() {
        this._score += 1;
    }

	public setInfoEndGame(lastOpponent: Player) {
		this._lastOpponent = lastOpponent._name;
		if (this._score > lastOpponent._score)
			this._lastWin = true;
		else
			this.lastWin = false;
		this._score = 0;
	}
}
