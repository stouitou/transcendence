import { Object } from "./Object.ts";
import { Direction } from "../entities/Direction";

export class	BallObject extends Object {

	private	readonly	_color: string = 'rgb(255, 0, 0)';
	private readonly	_diameter: number = 30;
	private readonly	_radius: number = this._diameter / 2;

	private readonly	_speed: number = 8;
	private				_direction!: Direction;

	private				_x!: number;
	private				_y!: number;


	constructor (canvas: HTMLCanvasElement) {
		super(canvas);
		this.spawn();
	}

	get color () {
		return this._color ;
	}

	get diameter () {
		return this._diameter ;
	}

	get radius () {
		return this._radius ;
	}

	get speed () {
		return this._speed ;
	}

	get direction () {
		return this._direction ;
	}

	get x () {
		return this._x ;
	}

	get y () {
		return this._y ;
	}

	spawn () {
		this._x = (this._fieldWidth / 2);
		this._y = (33 + ((Math.random() * 100) / 3)) / 100 * this._fieldHeight;
		
		// Ramdomize direction
		const add = Math.random() * 30;
		
		let	x = Math.sin((45 + add) * Math.PI / 180);	// compute x direction depending on an angle between 45 and 75 degrees
		let	y = Math.cos((45 + add) * Math.PI / 180);	// compute y direction depending on an angle between 45 and 75 degrees
		
		let base = Math.round(Math.random());	// random integer between 0 and 1
		if (base === 0)
			x *= -1;
		base = Math.round(Math.random());
		if (base === 0)
			y *= -1;
		this._direction = new Direction(x, y);
	}
	
	move () {
		this.updatePosition();
		this.draw();
	}

	private draw () {
		this._field.fillStyle = this._color;
		this._field.beginPath();
		this._field.arc(this._x, this._y, this._radius, 0, Math.PI * 2);
		this._field.fill();
	}

	private updatePosition () {
		this._x += this._direction.x;
		this._y += this._direction.y;
	}
}