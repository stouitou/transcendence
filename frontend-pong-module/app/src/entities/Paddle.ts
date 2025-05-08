import { Object } from "./Object.ts";
import { Ball } from "./Ball.ts";
import { Player } from "./Player.ts";
import * as Design from "./Design";
import { Position } from "../Interfaces/Position.interface.ts";
import { Coordinates } from "../Interfaces/Coordinates.interface.ts";
import { Limits } from "../Interfaces/Limits.interface.ts";

export class Paddle extends Object {
	private readonly	_owner: Player;

	private readonly	_width: number = 20;
	private readonly	_height: number = 120;

	private				_limits: Limits;
	private readonly	_speed: number = 3;

	private				_position: Position;
	private				_coordinates!: Coordinates;

	constructor (canvas: HTMLCanvasElement, owner: Player) {
		super(canvas);
		this._limits = { up: 0, down: this._fieldHeight, left: 0, right: this._fieldWidth };

		this._owner = owner;
		let	x = 3;
		let	y = 5;
		switch (this._owner.location) {
			case 0:
			case 1:
				y = (this._fieldHeight / 2) - (this._height / 2);
				if (this._owner.location === 0)
					x = this._fieldWidth - 5 - this._width;
				else if (this._owner.location === 1)
					x = 5;
				this._coordinates = { top: y, bottom: y + this._height, left: x, right: x + this._width };
				break;
			case 2:
			case 3:
				x = (this._fieldWidth / 2) - (this._height / 2);
				if (this._owner.location === 2)
					y = this._fieldHeight - 5 - this._width;
				else if (this._owner.location === 3)
					y = 5;
				this._coordinates = { top: y, bottom: y + this._width, left: x, right: x + this._height };
				break;
		}
		this._position = { x: x, y: y};
	}

	/* ---------- getters ---------- */
	get owner ()		{ return this._owner ; }
	get width ()		{ return this._width ; }
	get height ()		{ return this._height ; }
	get limits ()		{ return this._limits ; }
	get speed ()		{ return this._speed ; }
	get	position ()		{ return this._position ; }
	get	coordinates () 	{ return this._coordinates ; }

	set limits (limits: Limits)	{ this._limits = limits; }

	/* ---------- main API ---------- */
	update () {
		if (this._owner.direction) {
			switch (this._owner.direction) {
				case 'up':
					if (this._coordinates.top > this._limits.up)						this._position.y -= this._speed;
					break ;
				case 'down':
					if (this._coordinates.bottom < this._limits.down)	this._position.y += this._speed;
					break ;
				case 'left':
					if (this._coordinates.left > this._limits.left)						this._position.x -= this._speed;
					break ;
				case 'right':
					if (this._coordinates.right < this._limits.right)		this._position.x += this._speed;
					break ;
			}
		}
		
		this._coordinates.left = this._position.x;
		this._coordinates.top = this._position.y;
		if (this._owner.location === 0 || this._owner.location === 1) {
			this._coordinates.bottom = this._position.y + this._height;
			this._coordinates.right = this._position.x + this._width;
		}
		if (this._owner.location === 2 || this._owner.location === 3) {
			this._coordinates.bottom = this._position.y + this._width ;
			this._coordinates.right = this._position.x + this._height;
		}
	}

	/** DESIGN‑ONLY CHANGE: use rounded‑rect helper */
	draw() {
		let height: number = 0;
		let width: number = 0;

		switch (this.owner.location) {
			case 0:
			case 1:
				height = this._height;
				width = this._width;
				break;
			case 2:
			case 3:
				height = this._width;
				width = this._height;
				break;
		}
		Design.drawPaddle(
			this._field,
			this._position.x,
			this._position.y,
			width,
			height
		);
	}

	collision (ball: Ball) {
		if (
			ball.position.x + ball.radius > this._coordinates.left  &&
			ball.position.x - ball.radius < this._coordinates.right &&
			ball.position.y + ball.radius > this._coordinates.top   &&
			ball.position.y - ball.radius < this._coordinates.bottom
		) {
			const	side: string = this.getSideCollision(ball);
			ball.bounce(this, side);
			return true;
		}
		return false;
	}

	private getSideCollision (ball: Ball) : string {
		const dxLeft = Math.abs(ball.position.x - this._coordinates.left);
		const dxRight = Math.abs(ball.position.x - this._coordinates.right);
		const dyTop = Math.abs(ball.position.y - this._coordinates.top);
		const dyBottom = Math.abs(ball.position.y - this._coordinates.bottom);

		const minDist = Math.min(dxLeft, dxRight, dyTop, dyBottom);

		switch (minDist) {
			case dxLeft:	return 'left' ;
			case dxRight:	return 'right' ;
			case dyTop:		return 'top' ;
			case dyBottom:	return 'bottom' ;
		}
		return 'left' ;
	}
}
