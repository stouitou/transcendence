export class Direction {
    /* CONSTRUCTOR */
    constructor(x, y) {
        this.magnitude = () => Math.sqrt(Math.pow(this._x, 2) + Math.pow(this._y, 2));
        this._x = x;
        this._y = y;
    }
    /* GETTERS */
    get x() {
        return this._x;
    }
    get y() {
        return this._y;
    }
    /* SETTERS */
    set x(x) {
        this._x = x;
    }
    set y(y) {
        this._y = y;
    }
    normalize() {
        const magnitude = this.magnitude();
        this._x = this._x / magnitude;
        this._y = this._y / magnitude;
    }
}
