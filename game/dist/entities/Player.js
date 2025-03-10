//import { Paddle } from "./Paddle";
export class Player {
    /* CONSTRUCTOR */
    constructor(name) {
        //private _paddle: Paddle | null = null;
        this._score = 0;
        this._id = -1;
        //this._paddle = paddle;
        this._name = name;
    }
    /* GETTERS */
    get score() {
        return this._score;
    }
    get name() {
        return this._name;
    }
    get id() {
        return this._id;
    }
    // public get paddle() : Paddle | null
    // {
    //     return this._paddle;
    // }
    /* SETTERS */
    set id(id) {
        this._id = id;
    }
    // public set paddle(paddle: Paddle)
    // {
    //     this._paddle = paddle;
    // }
    incrementScore() {
        this._score += 1;
    }
}
