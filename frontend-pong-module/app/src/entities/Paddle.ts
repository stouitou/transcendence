import { Object } from "./Object.ts";
import { Ball } from "./Ball.ts";
import { Player } from "./Player.ts";
import * as Design from "./Design";
import { Position } from "../Interfaces/Position.interface.ts";
import { Coordinates } from "../Interfaces/Coordinates.interface.ts";

export class Paddle extends Object {
	private readonly	_owner: Player;

	private readonly	_color: string = 'rgb(255, 0, 0)';
	private readonly	_width: number = 20;
	private readonly	_height: number = 120;

	private readonly	_speed: number = 3;
	private				_moveUp: boolean = false;
	private				_moveDown: boolean = false;
	private				_moveLeft: boolean = false;
	private				_moveRight: boolean =  false;

	private				_position: Position;
	private				_coordinates!: Coordinates;

	constructor (canvas: HTMLCanvasElement, owner: Player) {
		super(canvas);

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
		console.log('position: ', this._position);
	}

	/* ---------- getters ---------- */
	get owner () { return this._owner ; }
	get width () { return this._width ; }
	get height () { return this._height ; }
	get speed () { return this._speed ; }
	get moveUp () { return this._moveUp ; }
	get moveDown () { return this._moveDown ; }
	get	position () { return this._position ; }
	get	coordinates () { return this._coordinates ; }

	/* ---------- setters ---------- */
	set moveUp (moveUp: boolean) { this._moveUp = moveUp; }
	set moveDown (moveDown: boolean) { this._moveDown = moveDown; }

	/* ---------- main API ---------- */
	update (ball: Ball) {
		if (this._owner.role === 'bot') {
			if (this._owner.location === 0 || this._owner.location === 1)
				this.followBallVertical(ball);
			else if (this._owner.location === 2 || this._owner.location === 3) 
				this.followBallHorizontal(ball);
			}

		if (this._moveUp && this._coordinates.top > 0)
			this._position.y -= this._speed;
		if (this._moveDown && this._coordinates.bottom < this._fieldHeight)
			this._position.y += this._speed;

		if (this._moveRight && this._coordinates.right < this._fieldWidth)
			this._position.x += this._speed;
		if (this._moveLeft && this._coordinates.left > 0)
			this._position.x -= this._speed;
		
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

	/* ---------- internal ---------- */
	private followBallHorizontal (ball: Ball) {
		if (this._position.x + (this._height / 2) > ball.position.x) {
			this._moveLeft = true;
			this._moveRight = false;
		}
		else {
			this._moveLeft = false;
			this._moveRight = true;
		}
	}

	private followBallVertical (ball: Ball) {
		if (this._position.y + (this._height / 2) > ball.position.y) {
			this._moveUp = true;
			this._moveDown = false;
		}
		else {
			this._moveDown = true;
			this._moveUp = false;
		}
	}

	// private eventListener () {
	// 	switch (this._owner.location) {
	// 		case 0:
	// 			document.addEventListener('keydown', (event) => {
	// 				if (event.key === 'ArrowUp')
	// 					this._moveUp = true;
	// 				if (event.key === 'ArrowDown')
	// 					this._moveDown = true;
	// 			});
	// 			document.addEventListener('keyup', (event) => {
	// 				if (event.key === 'ArrowUp')
	// 					this._moveUp = false;
	// 				if (event.key === 'ArrowDown')
	// 					this._moveDown = false;
	// 			});
	// 			break ;
	// 		case 1:
	// 			document.addEventListener('keydown', (event) => {
	// 				if (event.key === 's')
	// 					this._moveUp = true;
	// 				if (event.key === 'x')
	// 					this._moveDown = true;
	// 			});
	// 			document.addEventListener('keyup', (event) => {
	// 				if (event.key === 's')
	// 					this._moveUp = false;
	// 				if (event.key === 'x')
	// 					this._moveDown = false;
	// 			});
	// 			break ;
	// 		case 2:
	// 			document.addEventListener('keydown', (event) => {
	// 				if (event.key === 'ArrowLeft')
	// 					this._moveLeft = true;
	// 				if (event.key === 'ArrowRight')
	// 					this._moveRight = true;
	// 			});
	// 			document.addEventListener('keyup', (event) => {
	// 				if (event.key === 'ArrowLeft')
	// 					this._moveLeft = false;
	// 				if (event.key === 'ArrowRight')
	// 					this._moveRight = false;
	// 			});
	// 			break ;
	// 		case 3:
	// 			document.addEventListener('keydown', (event) => {
	// 				if (event.key === 'a')
	// 					this._moveLeft = true;
	// 				if (event.key === 'd')
	// 					this._moveRight = true;
	// 			});
	// 			document.addEventListener('keyup', (event) => {
	// 				if (event.key === 'a')
	// 					this._moveLeft = false;
	// 				if (event.key === 'd')
	// 					this._moveRight = false;
	// 			});
	// 			break ;
	// 	}
	// }
}
