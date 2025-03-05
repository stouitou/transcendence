// export allows to use this class in another file
import { Direction } from './Direction.js';

export class Ball {

	/* PRIVATE ATTRIBUTES */
	private readonly _element: HTMLDivElement;
	private readonly _diameter: number = 30;
	private readonly _radius: number = this._diameter / 2;
	private readonly _color: string = 'rgb(0, 0, 0)';
	private readonly _speed: number = 5;
	private _direction: Direction;

	private _top: number;
	private _bottom: number;
	private _left: number;
	private _right: number;
	private _centerX: number;
	private _centerY: number;

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
		// this._element.style.left = `calc(50% - ${this._diameter / 2}px)`;	// centered horizontally (15px is half the size of the ball)
		this._element.style.position = 'absolute';							// doesn't interact with other objects or text

		this._direction = new Direction(0, 0);
		this.spawn();

		this._top = this._element.offsetTop;
		this._bottom = this._top + this._diameter;
		this._left = this._element.offsetLeft;
		this._right = this._left + this._diameter;
		this._centerX = this._left + this._radius;
		this._centerY = this._top + this._radius;
		
		// "Draws" the ball in the window
		document.body.appendChild(this._element);
	}
	
	public get element () {
		return this._element;
	}
	
	public get diameter () {
		return this._diameter;
	}	
	
	public get direction () {
		return this._direction;
	}	

	public get top () {
		return this._top;
	}	
	
	public get bottom () {
		return this._bottom;
	}	
	
	public get left () {
		return this._left;
	}	
	
	public get right () {
		return this._right;
	}	
	
	public get centerX () {
		return this._centerX;
	}	
	
	public get centerY () {
		return this._centerY;
	}	
	
	public updatePosition() {
		this._top = this._element.offsetTop;
		this._bottom = this._top + this._diameter;
		this._left = this._element.offsetLeft;
		this._right = this._left + this._diameter;
		this._centerX = this._left + this._radius;
		this._centerY = this._top + this._radius;
	}

	public spawn() {
		const pos = (Math.random() * 100) / 3;

		this._element.style.top = `calc(33% - ${this._radius}px + ${pos}%)`;	// centered vertically (15px is half the size of the ball)
		this._element.style.left = `calc(50% - ${this._radius}px)`;	// centered horizontally (15px is half the size of the ball)

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
}
