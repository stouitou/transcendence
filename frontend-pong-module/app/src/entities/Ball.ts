import { CANVAS_HEIGHT, CANVAS_WIDTH } from "../component/classic";
import { Position } from "../Interfaces/Position.interface";
import { Size } from "../Interfaces/Size.interface";
import { Player } from "./Player";

export class	Ball {

	private				_position: Position;
	private readonly	_size: Size;
	private				_speed: number;
	private				_velocity: Position;
	private				_lastHit: Player | null = null;
	private				_lastWallBounce: number | null = null;
	private readonly	_maxBounceCountRound: number = 0;

	constructor (position: Position, size: Size, velocity: Position, speed: number) {
		this._position = position;
		this._size = size;
		this._velocity = velocity;
		this.normalize();
		this._speed = speed;
	}

	get position ()							{ return this._position ; }
	get size ()								{ return this._size ; }
	get speed ()							{ return this._speed ; }
	get velocity ()							{ return this._velocity ; }
	get lastHit () : Player | null			{ return this._lastHit ; }
	get lastWallBounce () : number | null	{ return this._lastWallBounce ; }
	get maxBounceCountRound ()				{ return this._maxBounceCountRound ; }

	set position (position: Position)			{ this._position = position; }
	set speed (speed: number)					{ this._speed = speed; }
	set lastHit (player: Player)				{ this._lastHit = player; }
	set lastWallBounce (wall: number | null)	{ this._lastWallBounce = wall; }

	update () {
		this._position.x += this._velocity.x * this._speed;
		this._position.y += this._velocity.y * this._speed;
	}
	
	reset () {
		this.spawn();
		this._lastHit = null;
		this._lastWallBounce = null;
	}

	private spawn () {
		const	x = CANVAS_WIDTH / 2;
		const	y = (33 + (Math.random() * 100) / 3) / 100 * CANVAS_HEIGHT;
		this._position = { x: x, y: y };

		const	add = Math.random() * 30;
		let		vx = Math.sin((45 + add) * Math.PI / 180);
		let		vy = Math.cos((45 + add) * Math.PI / 180);
		const	base = Math.random() * 4;
		if (base < 2)				vx *= -1;
		if (base >= 1 && base < 3)	vy *= -1;

		this._velocity = { x: vx, y: vy };
		this.normalize();
	}
	
	normalize () {
		const	magnitude = this.magnitude();

		if (magnitude === 0) { this._velocity = { x: 0, y: 0 }; return ; }
		this._velocity.x = this._velocity.x / magnitude;
		this._velocity.y = this._velocity.y / magnitude;
	}

	private magnitude () {
		return Math.sqrt(Math.pow(this._velocity.x, 2) + Math.pow(this._velocity.y, 2)) ;
	}
}