import { Ball } from "./Ball.js";

// export allows to use this class in another file
export class Paddle {

	/* PRIVATE ATTRIBUTES */
	private readonly _element: HTMLDivElement;
	private readonly _width: number = 20;
	private readonly _height: number = 120;
	private readonly _color: string = 'rgb(0, 0, 0)';
	private _position: number;
	private readonly _speed: number = 5;
	private _keys: { [key: string]: boolean } = {};
	
	// Fetch current coordinates
	private _top: number;
	private _bottom: number;
	private _left: number;
	private _right: number;

	/* CONSTRUCTOR */
	public constructor(position: 1 | 2) {

		// Creates the paddle object
		this._element = document.createElement('div');
		this._element.classList.add('ball');

		// Gives the paddle all its values
		this._position = position;
		this._element.style.width = `${this._width}px`;
		this._element.style.height = `${this._height}px`;
		this._element.style.backgroundColor = `${this._color}`;
		this._element.style.position = 'absolute';
		this._element.style.top = `calc(50% - ${this._height / 2}px)`;	// this._element.style.top = `${(window.innerHeight / 2) - (this._height / 2)}px`;

		if (position === 2)
			this._element.style.left = `calc(5% - ${this._width / 2}px)`;
		else if (position === 1)
			this._element.style.right = `calc(5% + ${this._width / 2}px)`;

		this._top = this._element.offsetTop;
		this._bottom = this._top + this._height;	
		this._left = this._element.offsetLeft;
		this._right = this._left + this._width;

		// "Draws" the paddle in the window
		document.body.appendChild(this._element);

		// Arrow function makes this referring to the paddle and not to the document
		document.addEventListener('keydown', (event) => this._keys[event.key] = true);
		document.addEventListener('keyup', (event) => this._keys[event.key] = false);
		// modify document to be able to move paddles anytime
	}

	/* GETTERS */
	public get element() {
		return this._element;
	};

	public get width() {
		return this._width;
	};

	public get height() {
		return this._height;
	};

	public get top() {
		return this._top;
	};

	public get bottom() {
		return this._bottom;
	};

	public get left() {
		return this._left;
	};

	public get right() {
		return this._right;
	};

	public get keys() {
		return this._keys;
	};

	/* METHODS */
	public move() {
		// Fetch the x value of the top of the paddle, and the keys that are being pressed
		const moveUp = (this._keys['ArrowUp'] && this._position === 1) || (this._keys['s'] && this._position === 2);
		const moveDown = (this._keys['ArrowDown'] && this._position === 1) || (this._keys['x'] && this._position === 2);

		// Move subsequently
		if (moveUp) {
			this._element.style.top = `${Math.max(0, this._top - this._speed)}px`;
		}
		if (moveDown) {
			this._element.style.top = `${Math.min(window.innerHeight - this._height, this._top + this._speed)}px`;
		}
	}

	// Update current position
	public updatePosition () {
		this._top = this._element.offsetTop;
		this._bottom = this._top + this._height;	
		this._left = this._element.offsetLeft;
		this._right = this._left + this._width;
	}

	public collision (ball: Ball) {
		if (ball.right >= this._left &&
			ball.left <= this._right &&
			ball.bottom >= this._top &&
			ball.top <= this._bottom)
			return (true);
	}
}
