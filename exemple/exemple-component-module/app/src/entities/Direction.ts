export class Direction {

	private _x: number;
	private _y: number;

	/* CONSTRUCTOR */
	public constructor(x: number, y: number) {

		this._x = x;
		this._y = y;
	}

	/* GETTERS */
	public get x() {
		return this._x;
	}
	public get y() {
		return this._y;
	}

	/* SETTERS */
	public set x(x: number) {
		this._x = x;
	}
	public set y(y: number) {
		this._y = y;
	}

	private magnitude = () => Math.sqrt(Math.pow(this._x, 2) + Math.pow(this._y, 2));
	public normalize() {
		const magnitude = this.magnitude()
		this._x = this._x / magnitude;
		this._y = this._y / magnitude;
	}
}