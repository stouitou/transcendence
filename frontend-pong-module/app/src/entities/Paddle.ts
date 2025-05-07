import { Ball } from "./Ball.ts";
import { Coordinates } from "../Interfaces/Coordinates.interface.ts";
import { Ground } from "../Interfaces/Ground.interface.ts";
import { Limits } from "../Interfaces/Limits.interface.ts";
import { Player } from "./Player.ts";
import { Position } from "../Interfaces/Position.interface.ts";
import * as Design from "./Design";

export class Paddle {
	private readonly	_ground: Ground;
	private readonly	_owner: Player;

	private readonly	_width: number = 20;
	private readonly	_height: number = 120;

	private				_limits: Limits;
	private readonly	_speed: number = 3;

	private				_position: Position;
	private				_coordinates!: Coordinates;

	constructor (ground: Ground, owner: Player) {
		this._ground = ground;
		this._limits = { up: 0, down: this._ground.height, left: 0, right: this._ground.width };

		this._owner = owner;
		let	x = 3;
		let	y = 5;
		switch (this._owner.location) {
			case 0:
			case 1:
				y = (this._ground.height / 2) - (this._height / 2);
				if (this._owner.location === 0)
					x = this._ground.width - 5 - this._width;
				else if (this._owner.location === 1)
					x = 5;
				this._coordinates = {
					top: y,
					bottom: y + this._height,
					left: x,
					right: x + this._width,
					center: { x: x + (this._width / 2), y: y + (this._height / 2) }
				};
				break;
			case 2:
			case 3:
				x = (this._ground.width / 2) - (this._height / 2);
				if (this._owner.location === 2)
					y = this._ground.height - 5 - this._width;
				else if (this._owner.location === 3)
					y = 5;
				this._coordinates = {
					top: y,
					bottom: y + this._width,
					left: x,
					right: x + this._height,
					center: { x: x + (this._height / 2), y: y + (this._width / 2) }
				};
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

	/* ---------- setters ---------- */
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
		
		this.updateCoordinates();
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
			this._ground.field,
			this._position.x,
			this._position.y,
			width,
			height
		);
	}

	collision (ball: Ball) {
		if (
			ball.coordinates.right > this._coordinates.left  &&
			ball.coordinates.left < this._coordinates.right &&
			ball.coordinates.bottom > this._coordinates.top   &&
			ball.coordinates.top < this._coordinates.bottom
		) {
			this._owner.historiqueGame.totalBouncesPerPlayer++;
			const	side: string = this.getSideCollision(ball);
			ball.bounce(this, side);
			return true;
		}
		return false;
	}

	/* ---------- internals ---------- */
	private getSideCollision (ball: Ball) : string {
		const dxLeft = Math.abs(ball.position.x - this._coordinates.left);
		const dxRight = Math.abs(ball.position.x - this._coordinates.right);
		const dyTop = Math.abs(ball.position.y - this._coordinates.top);
		const dyBottom = Math.abs(ball.position.y - this._coordinates.bottom);

		const	possibleSides: { side: string, dist: number }[] = [];

		if (ball.direction.x > 0)	possibleSides.push( { side: 'left', dist: dxLeft });
		if (ball.direction.x < 0)	possibleSides.push( { side: 'right', dist: dxRight });
		if (ball.direction.y > 0)	possibleSides.push( { side: 'top', dist: dyTop });
		if (ball.direction.y < 0)	possibleSides.push( { side: 'bottom', dist: dyBottom });

		if (possibleSides.length === 0)	return 'left' ;

		let	best = possibleSides[0];
		for (const side of possibleSides) {
			if (side.dist < best.dist)	best = side;
		}

		return best.side ;
	}

	private updateCoordinates () {
		switch (this._owner.location) {
			case 0:
			case 1:
				this._coordinates = {
					top: this._position.y,
					bottom: this._position.y + this._height,
					left: this._position.x,
					right: this._position.x + this._width,
					center: {
						x: this._position.x + (this._width / 2),
						y: this._position.y + (this._height / 2)
					}
				};
				break ;
			case 2:
			case 3:
				this._coordinates = {
					top: this._position.y,
					bottom: this._position.y + this._width,
					left: this._position.x,
					right: this._position.x + this._height,
					center: {
						x: this._position.x + (this._height / 2),
						y: this._position.y + (this._width / 2)
					}
				};
				break ;
		}
	}
}
