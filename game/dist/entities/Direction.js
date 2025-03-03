export class Direction {
    /* CONSTRUCTOR */
    constructor(angle) {
        const radius = angle * Math.PI / 180;
        this._x = Math.sin(radius);
        this._y = Math.cos(radius);
    }
}
