// export allows to use this class in another file
// import { vector } from "../types/Ball.types";
import { Direction } from './Direction.js';

export class Ball {

	/* PRIVATE ATTRIBUTES */
	private readonly _element: HTMLDivElement;
	private readonly _diameter: number = 30;
	private readonly _color: string = 'rgb(0, 0, 0)';
	private readonly _speed: number = 8;
	private _direction: Direction;

	/* CONSTRUCTOR */
	public constructor() {

		// Creates the ball object
		this._element = document.createElement('div');
		this._element.classList.add('ball');

		// Gives the ball all its values
		this._element.style.width = `${this._diameter}px`;
		this._element.style.height = `${this._diameter}px`;
		this._element.style.backgroundColor = this._color;					// color of the ball
		this._element.style.borderRadius = '50%';							// makes it round
		// this._element.style.top = `calc(50% - ${this._diameter}px)`;		// centered vertically (15px is half the size of the ball)
		this._element.style.left = `calc(50% - ${this._diameter / 2}px)`;	// centered horizontally (15px is half the size of the ball)
		this._element.style.position = 'absolute';							// doesn't interact with other objects or text

		this._direction = new Direction(0, 0);
		this.spawn();

		// "Draws" the ball in the window
		document.body.appendChild(this._element);
	}

	public get direction() {
		return this._direction;
	}

	public spawn() {
		const pos = (Math.random() * 100) / 3;

		this._element.style.top = `calc(33% - ${this._diameter / 2}px + ${pos}%)`;	// centered vertically (15px is half the size of the ball)

		const add = Math.random() * 30;

		this._direction.x = Math.sin((45 + add) * Math.PI / 180);
		this._direction.y = Math.cos((45 + add) * Math.PI / 180);

		let base = Math.random();
		if (base < 0.5)
			this._direction.x *= -1;
		base = Math.random();
		if (base < 0.5)
			this._direction.y *= -1;
		// if spawn up and direction down, do we nedd to manage differently ?
	}

	public move() {
		this._direction.normalize();
		const currentLeft = this._element.offsetLeft;
		const currentTop = this._element.offsetTop;
		this._element.style.left = `${currentLeft + (this._speed * this._direction.x)}px`
		this._element.style.top = `${currentTop + (this._speed * this._direction.y)}px`
	}

	// public moveRight() {
	// 	console.log("move right");
	// 	let currentRight = this._element.offsetLeft + this._diameter;
	// 	console.log("in move right, before, this._element.style.left: ", this._element.style.left);
	// 	console.log("in move right, current right: ", currentRight);
	// 	console.log("in move right, speed: ", this._speed);
	// 	console.log("in move right, diameter: ", this._diameter);
	// 	this._element.style.left = `${currentRight + this._speed - this._diameter}px`;
	// 	console.log("in move right, after, this._element.style.left: ", this._element.style.left);
	// }

	// public moveLeft() {
	// 	console.log("move left");
	// 	let currentLeft = this._element.offsetLeft;
	// 	console.log("in move left, before, this._element.style.left: ", this._element.style.left);
	// 	console.log("in move left, current left: ", currentLeft);
	// 	console.log("in move left, speed: ", this._speed);
	// 	console.log("in move left, diameter: ", this._diameter);
	// 	this._element.style.left = `${currentLeft - this._speed}px`;
	// 	console.log("in move left, after, this._element.style.left: ", this._element.style.left);
	// }
}
