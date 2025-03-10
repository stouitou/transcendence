//import { Paddle } from "./Paddle";

export class Player {
	//private _paddle: Paddle | null = null;
    private _score: number = 0;

	private readonly _name: string;
	private _id: number = -1;

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

	// public get paddle() : Paddle | null
    // {
    //     return this._paddle;
    // }

	/* SETTERS */
	public set id (id: number) {
		this._id = id;
	}

	// public set paddle(paddle: Paddle)
    // {
    //     this._paddle = paddle;
    // }

	public incrementScore()
    {
        this._score += 1;
    }

}
