import { Object } from "./Object.ts";
import { Direction } from "./Direction.ts";
import { Paddle } from "./Paddle.ts";
import { Player } from "./Player.ts";

export class	Ball extends Object {

	private	readonly	_color: string = 'rgb(255, 0, 0)';
	private readonly	_diameter: number = 30;
	private readonly	_radius: number = this._diameter / 2;

	private readonly	_speed: number = 8;
	private				_direction!: Direction;
	private				_rebound: boolean = false;

	private				_x!: number;
	private				_y!: number;

	private				_top!: number;
	private				_bottom!: number;
	private				_left!: number;
	private				_right!: number;

	private				_lastHit: Player | null = null;

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

	get rebound () {
		return this._rebound ;
	}

	get x () {
		return this._x ;
	}

	get y () {
		return this._y ;
	}

	get top () {
		return this._top ;
	}

	get bottom () {
		return this._bottom ;
	}

	get left () {
		return this._left ;
	}

	get right () {
		return this._right ;
	}

	spawn () {
		this._x = (this._fieldWidth / 2);
		this._y = (33 + ((Math.random() * 100) / 3)) / 100 * this._fieldHeight;
		
		// Ramdomize direction
		const add: number = Math.random() * 30;
		
		let	x: number = Math.sin((45 + add) * Math.PI / 180);	// compute x direction depending on an angle between 45 and 75 degrees
		let	y: number = Math.cos((45 + add) * Math.PI / 180);	// compute y direction depending on an angle between 45 and 75 degrees
		
		const base: number = Math.random() * 4;	// random integer between 0 and 4
		if (base < 2)
			x *= -1;
		if (base >= 1 && base < 3)
			y *= -1;
		this._direction = new Direction(x, y);
	}

	move () {
		this.updatePosition();
		this.draw();
	}

	bounce (paddle: Paddle) {
		this._rebound = true;
		this._lastHit = paddle.owner;

		this._direction.x *= -1;	

		if (paddle.location === 0 || paddle.location === 1) {
			// Formula for the rebound : θrebound ​= θmax ​× (2 × ((yimpact ​− ypaddle) / paddle height)​)
			const impact: number = 2 * ((this._y - (paddle.y + (paddle.height / 2))) / paddle.height);
			const angle = ((55 * Math.PI / 180) * impact) + (5 * Math.PI / 180);	// get an angle between 5 and 60 degrees
			this._direction.x = Math.cos(angle) * Math.sign(this._direction.x);
			this._direction.y = Math.sin(angle);
		}
		else {
			const impact: number = 2 * ((this._y - (paddle.y + (paddle.height / 2))) / paddle.height);
			const angle: number = ((5 * Math.PI / 180) * impact) + (55 * Math.PI / 180);	// get an angle between 5 and 60 degrees
			this._direction.x = Math.sin(angle) * Math.sign(this._direction.x);
			this._direction.y = -Math.cos(angle);
		}
	}

	out (players: Player[]) {
		if (this._right < 0 || this._left > this._fieldWidth || this._bottom < 0 || this._top > this._fieldHeight) {
			if (this._left > this._fieldWidth) {
				if (this._lastHit === null || this._lastHit.location === 0) {
					players[0].losePoint();
				}
				else if (this._lastHit)
					this._lastHit.score();
			}
			else if (this._right < 0) {
				if (this._lastHit === null || this._lastHit.location === 1) {
					players[1].losePoint();
				}
				else if (this._lastHit)
					this._lastHit.score();
			}
			else if (this._top > this._fieldHeight) {
				if (this._lastHit === null || this._lastHit.location === 2) {
					players[2].losePoint();
				}
				else if (this._lastHit)
					this._lastHit.score();
			}
			else if (this._bottom < 0) {
				if (this._lastHit === null || this._lastHit.location === 3) {
					players[3].losePoint();
				}
				else if (this._lastHit)
					this._lastHit.score();
			}
			this._lastHit = null;
			this._rebound = false;
			return true ;
		}
		// if (this._right < 0) {
		// 	players[0].score();
		// 	this._rebound = false;
		// 	return true;
		// }
		// else if (this._left > this._fieldWidth) {
		// 	players[1].score();
		// 	this._rebound = false;
		// 	return true;
		// }
		// else if (this._bottom < 0 || this._top > this._fieldHeight){
		// 	this._rebound = false;
		// 	return true;
		// }
		return false;
	}

	private draw () {
		this._field.fillStyle = this._color;
		this._field.beginPath();
		this._field.arc(this._x, this._y, this._radius, 0, Math.PI * 2);
		this._field.fill();
	}

	private updatePosition () {
		let	speed: number = this._speed;
		if (!this._rebound)
			speed /= 2;

		this._x += this._direction.x * speed;
		this._y += this._direction.y * speed;
		this._top = this._y - this._radius;
		this._bottom = this._y + this._radius;
		this._left = this._x - this._radius;
		this._right = this._x + this._radius;
	}
}