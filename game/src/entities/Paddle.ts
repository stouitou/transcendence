// export allows to use this class in another file
export class Paddle {

	/* PRIVATE ATTRIBUTES */
	private readonly _element: HTMLDivElement;
	private readonly _width: number = 20;
	private readonly _height: number = 120;
	private readonly _color: string = 'rgb(255, 0, 0)';
	private _position: string;
	private readonly _speed: number = 5;
	private _keys: { [key: string]: boolean } = {};

	/* CONSTRUCTOR */
	public constructor(position: 'left' | 'right') {

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
		
		if (position === 'left')
			this._element.style.left = `calc(5% - ${this._width / 2}px)`;
		else if (position === 'right')
			this._element.style.right = `calc(5% + ${this._width / 2}px)`;

		// "Draws" the paddle in the window
		document.body.appendChild(this._element);

		// Arrow function makes this referring to the paddle and not to the document
		document.addEventListener('keydown', (event) => this._keys[event.key] = true);
		document.addEventListener('keyup', (event) => this._keys[event.key] = false);
		// modify document to be able to move paddles anytime
	}

	public get element() {
		return this._element;
	};

	public get width() {
		return this._width;
	};

	public get height() {
		return this._height;
	};

	public get keys() {
		return this._keys;
	};

	public move() {
		// Fetch the x value of the top of the paddle, and the keys that are being pressed
		let currentTop = this._element.offsetTop;
		const moveUp = (this._keys['ArrowUp'] && this._position === 'right') || (this._keys['s'] && this._position === 'left');
		const moveDown = (this._keys['ArrowDown'] && this._position === 'right') || (this._keys['x'] && this._position === 'left');

		// Move subsequently
		if (moveUp) {
			this._element.style.top = `${Math.max(0, currentTop - this._speed)}px`;
		}
		if (moveDown) {
			this._element.style.top = `${Math.min(window.innerHeight - this._element.offsetHeight, currentTop + this._speed)}px`;
		}
	}
}
