import { Paddle } from "./Paddle.js";

export class Player {

	/* ATTIBUTES */
	private readonly 	_area: HTMLDivElement;

	private				_name: string;
	private				_id: number;
	private				_paddle!: Paddle;

	private 			_score: number;
	// private				_lastOpponent: Player | null = null;
	private				_lastWin: boolean;
	private				_lastScore: number;

	/* CONSTRUCTOR */
	constructor (name: string, canvas: HTMLDivElement) {
		this._area = canvas;

		this._name = name;
		this._id = -1;
		this._score = 0;
		this._lastWin = false;
		this._lastScore = 0;
	}

	/* GETTERS */
	public get name () {
		return this._name;
	}
	
	public get id () {
		return this._id;
	}	
	
	public get paddle () : Paddle {
		return this._paddle;
	}

	public get score() {
		return this._score;
	}		
	
	public get lastWin () {
		return this._lastWin;
	}	
	
	public get lastScore() {
		return this._lastScore;
	}		
	
	/* SETTERS */
	public set id (id: number) {
		this._id = id;
	}	

	public set paddle (location: number) {
		this._paddle = new Paddle(location, this._area);
	}	

	// public set lastOpponent (lastOpponent: Player) {
	// 	this._lastOpponent = lastOpponent;
	// }	

	public set lastWin (lastWin: boolean) {
		this._lastWin = lastWin;
	}	

	public set score (score: number) {
		this._score = score;
	}	

	public set lastScore (score: number) {
		this._lastScore = score;
	}	

	/* METHODS */
	public incrementScore () {
        this._score += 1;
    }

	public setInfoEndGame (pointsToWin: number) {
		// this._lastOpponent = lastOpponent;
		if (this._score === pointsToWin)
			this._lastWin = true;
		else
			this._lastWin = false;
		this._lastScore = this._score;
		this._score = 0;
	}
}
