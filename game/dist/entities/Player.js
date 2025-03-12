import { Paddle } from "./Paddle.js";
export class Player {
    /* CONSTRUCTOR */
    constructor(name) {
        this._lastOpponent = null;
        this._name = name;
        this._id = -1;
        this._score = 0;
        this._lastWin = false;
    }
    /* GETTERS */
    get name() {
        return this._name;
    }
    get id() {
        return this._id;
    }
    get paddle() {
        return this._paddle;
    }
    get score() {
        return this._score;
    }
    get lastWin() {
        return this._lastWin;
    }
    /* SETTERS */
    set id(id) {
        this._id = id;
    }
    set paddle(location) {
        this._paddle = new Paddle(location);
    }
    set lastOpponent(lastOpponent) {
        this._lastOpponent = lastOpponent;
    }
    set lastWin(lastWin) {
        this._lastWin = lastWin;
    }
    incrementScore() {
        this._score += 1;
    }
    setInfoEndGame(pointsToWin, lastOpponent) {
        this._lastOpponent = lastOpponent;
        if (this._score === pointsToWin)
            this._lastWin = true;
        else
            this._lastWin = false;
        this._score = 0;
    }
}
