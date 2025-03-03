export class Direction {

	private readonly _x: number;
	private readonly _y: number;

	/* CONSTRUCTOR */
	public constructor(angle: number) {
		const radius = angle * Math.PI / 180;
		this._x = Math.sin(radius);
		this._y = Math.cos(radius);
	}
}