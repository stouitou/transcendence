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
    get score() {
        return this._score;
    }
    get name() {
        return this._name;
    }
    get id() {
        return this._id;
    }
    get lastWin() {
        return this._lastWin;
    }
    get paddle() {
        var _a;
        return (_a = this._paddle) !== null && _a !== void 0 ? _a : null;
    }
    /* SETTERS */
    set id(id) {
        this._id = id;
    }
    set lastOpponent(lastOpponent) {
        this._lastOpponent = lastOpponent;
    }
    set lastWin(lastWin) {
        this._lastWin = lastWin;
    }
    set paddle(location) {
        this._paddle = new Paddle(location);
    }
    incrementScore() {
        this._score += 1;
    }
    setInfoEndGame(lastOpponent) {
        this._lastOpponent = lastOpponent;
        if (this._score > lastOpponent._score)
            this._lastWin = true;
        else
            this.lastWin = false;
        this._score = 0;
    }
}
