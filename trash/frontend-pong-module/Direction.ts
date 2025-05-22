export class Direction {

	private _x: number;
	private _y: number;

	/* CONSTRUCTOR */
	constructor(x: number, y: number) {
		this._x = x;
		this._y = y;
		this.normalize();
	}

	/* ---------- getters ---------- */
	get x ()	{ return this._x ; }
	get y ()	{ return this._y ; }

	/* ---------- setters ---------- */
	set x (x: number)	{ this._x = x; }
	set y (y: number)	{ this._y = y; }

	/* ---------- core behaviour ---------- */
	normalize = () => {
		const	magnitude = this.magnitude();
		this._x = this._x / magnitude;
		this._y = this._y / magnitude;
	}

	/* ---------- internals ---------- */
	private magnitude = () => Math.sqrt(Math.pow(this._x, 2) + Math.pow(this._y, 2));
}