import { Ball } from "./Ball.js";
import { Display } from "../display/Display.js";

// export allows to use this class in another file
export class Paddle extends Display {

	/* ATTRIBUTES */
	private readonly _element: HTMLDivElement;
	private readonly _width: number = 20;
	private readonly _height: number = 120;
	private readonly _color: string = "rgb(255, 0, 0)";

	private readonly _speed: number = 5;
	private _keys: { [key: string]: boolean } = {};
	private readonly _location: number;

	// Fetch current coordinates
	private _top!: number;
	private _bottom!: number;
	private _left!: number;
	private _right!: number;

	/* CONSTRUCTOR */
	constructor(location: number = 1 | 2, canvas: HTMLDivElement) {
		super(canvas);

		this._location = location;

		// Creates the paddle object
		this._element = document.createElement("div");
		// Gives the paddle all its values
		this._element.style.width = `${this._width}px`;
		this._element.style.height = `${this._height}px`;
		this._element.style.backgroundColor = `${this._color}`;
		this._element.style.position = "absolute";
		this._element.style.margin = "0%";
		this._element.style.padding = "0%";
		this._element.style.top = "50%";
		this._element.style.transform = "translateY(-50%)";

		if (location === 1) {
			this._element.style.right = "1%";
		}
		else if (location === 2) {
			this._element.style.left = "1%";
		}
		// "Draws" the paddle in the game area
		this._canvas.appendChild(this._element);

		this.updatePosition();

		this.eventListeners();
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
	// Update current position
	public updatePosition() {
		this._top = this._element.offsetTop;
		this._bottom = this._top + this._height;
		this._left = this._element.offsetLeft;
		this._right = this._left + this._width;
	}

	public move() {
		// Fetch the x value of the top of the paddle, and the keys that are being pressed
		const moveUp = (this._keys['ArrowUp'] && this._location === 1) || (this._keys['s'] && this._location === 2);
		const moveDown = (this._keys['ArrowDown'] && this._location === 1) || (this._keys['x'] && this._location === 2);

		// Move subsequently
		if (moveUp) {
			this._element.style.top = `${Math.max(0, this._top - this._speed)}px`;
		}
		if (moveDown) {
			this._element.style.top = `${Math.min(this._canvas.offsetHeight - this._height, this._top + this._speed)}px`;
		}
	}

	public collision(ball: Ball) {
		if (ball.right >= this._left &&
			ball.left <= this._right &&
			ball.bottom >= this._top &&
			ball.top <= this._bottom)
			return (true);
	}

	private eventListeners() {
		document.addEventListener('keydown', (event) => this._keys[event.key] = true);
		document.addEventListener('keyup', (event) => this._keys[event.key] = false);
	}
}
