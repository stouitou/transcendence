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
	constructor(location: number = 1 | 2 | 3 | 4, canvas: HTMLDivElement) {
		super(canvas);

		this._location = location;

		// Creates the paddle object
		this._element = document.createElement("div");
		// Gives the paddle all its values
		
		this._element.style.backgroundColor = `${this._color}`;
		this._element.style.position = "absolute";
		this._element.style.margin = "0%";
		this._element.style.padding = "0%";
		
		if (location === 1 || location === 2) {
			this._element.style.width = `${this._width}px`;
			this._element.style.height = `${this._height}px`;
			// this._element.style.top = "50%";
			this._element.style.top = `calc(${this._canvas.offsetHeight} / 2 - ${this._height} / 2)px`;

			if (location === 1) {
				this._element.style.right = "1%";
			}
			else if (location === 2) {
				this._element.style.left = "1%";
			}
		}
		else if (location === 3 || location === 4) {
			this._element.style.width = `${this._height}px`;
			this._element.style.height = `${this._width}px`;
			this._element.style.left = `calc(${this._canvas.offsetWidth} / 2 - ${this._width} / 2)px`;
			// this._element.style.transform = "translateX(-50%)";

			if (location === 3) {
				this._element.style.bottom = "1%"; 
			}
			else if (location === 4) {
				this._element.style.top = "1%";
			}
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

	public get location() {
		return this._location;
	};

	/* METHODS */
	// Update current position
	public updatePosition() {
		if (this._location === 1 || this._location === 2) {
			this._top = this._element.offsetTop;
			this._bottom = this._top + this._height;
			this._left = this._element.offsetLeft;
			this._right = this._left + this._width;
		}
		else {
			this._top = this._element.offsetTop;
			this._bottom = this._top + this._width;
			this._left = this._element.offsetLeft;
			this._right = this._left + this._height;
		}

	}

	public move() {
		// Fetch the x value of the top of the paddle, and the keys that are being pressed
		const moveUp = (this._keys['ArrowUp'] && this._location === 1) || (this._keys['s'] && this._location === 2);
		const moveDown = (this._keys['ArrowDown'] && this._location === 1) || (this._keys['x'] && this._location === 2);

		const	moveRigth = (this._keys['ArrowRight'] && this._location === 3);// || (this._keys['d'] && this._location === 4);
		const	moveLeft = (this._keys['ArrowLeft'] && this._location === 3);// || (this._keys['a'] && this._location === 4);
		//console.log("moveRigth", moveRigth);

		// Move subsequently
		if (moveUp) {
			// console.log("Top");
			this._element.style.top = `${Math.max(0, this._top - this._speed)}px`;
		}
		if (moveDown) {
			// console.log("Down");
			this._element.style.top = `${Math.min(this._canvas.offsetHeight - this._height, this._top + this._speed)}px`;
		}
		if (moveLeft) {
			// console.log("Rigth"); 
			this._element.style.left = `${Math.max(0, this._left - this._speed)}px`;
		}
		if (moveRigth) {
			// console.log("Left");
			this._element.style.left = `${Math.min(this._canvas.offsetWidth - this._height, this._left + this._speed)}px`;
		}
	}

	public collision(ball: Ball) {
		if (ball.right >= this._left &&
			ball.left <= this._right &&
			ball.bottom >= this._top &&
			ball.top <= this._bottom) {
				console.log("collision");
				ball.bounce(this); 
				return (true);
			}
	}

	private eventListeners() {
		document.addEventListener('keydown', (event) => this._keys[event.key] = true);
		document.addEventListener('keyup', (event) => this._keys[event.key] = false);
	}
}
