//import { Paddle } from "./Paddle";

export class Player {
    private _score: number = 0;
	private readonly _name: string;
	//private _paddle: Paddle | null = null;

	private _id: number = -1;
	private _lastOpponent: string | null = null;
	private _lastWin: boolean = false;

	/* CONSTRUCTOR */
	public constructor (name: string) {
        //this._paddle = paddle;
		this._name = name;
	}

	/* GETTERS */
	public get score()
    {
        return this._score;
    }	

	public get name () {
		return this._name;
	}

	public get id () {
		return this._id;
	}

	// public get lastOpponent () {
	// 	return this._lastOpponent;
	// }

	public get lastWin () {
		return this._lastWin;
	}

	// public get paddle() : Paddle | null
    // {
    //     return this._paddle;
    // }

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


	// public set paddle(paddle: Paddle)
    // {
    //     this._paddle = paddle;
    // }

	public incrementScore()
    {
        this._score += 1;
    }

	public setInfoEndGame(lastOpponent: Player)
	{
		this._lastOpponent = lastOpponent._name;
		if (this._score > lastOpponent._score)
			this._lastWin = true;
		else
			this.lastWin = false;
	}
}
