import { Display } from "../display/Display";

export class	Pause extends Display {

	/* ATTRIBUTES */
	private readonly	_left: HTMLDivElement;				// left part of the symbol
	private readonly	_right: HTMLDivElement;				// right part of the symbol

	private readonly	_width: number = 17;				// width in pixel
	private readonly	_height: number = 50;				// height in pixel
	private readonly	_color: string = "rgb(0, 0, 0)";	//	color of the symbol
	private readonly	_opacity: number = 0.2;				// opacity of the symbol
	private readonly	_vertical:  number = 5;				// vertical position in percentage
	private readonly	_horizontal:  number = 48;			// horizontal position in percentage

	/* CONSTRUCTOR */
	constructor (canvas: HTMLCanvasElement) {
		super(canvas);

		this._left = document.createElement("div");
		this._left.style.width = `${this._width}px`;
		this._left.style.height = `${this._height}px`;
		this._left.style.backgroundColor = `${this._color}`;
		this._left.style.opacity = `${this._opacity}`;
		this._left.style.bottom = `${this._vertical}%`;
		this._left.style.left = `${this._horizontal}%`;		// horizontal position from the left
		this._left.style.position = "absolute";
		this._left.style.display = "none";
		document.body.appendChild(this._left);

		this._right = document.createElement("div");
		this._right.style.width = `${this._width}px`;
		this._right.style.height = `${this._height}px`;
		this._right.style.backgroundColor = `${this._color}`;
		this._right.style.opacity = `${this._opacity}`;
		this._right.style.bottom = `${this._vertical}%`;
		this._right.style.right = `${this._horizontal}%`;	// horizontal position from the right
		this._right.style.position = "absolute";
		this._right.style.display = "none";
		document.body.appendChild(this._right);
	}

	/* GETTERS */
	public get left () {
		return this._left ;
	}

	public get right () {
		return this._right ;
	}

	/* METHODS */
	public display () {
		this._left.style.display = "block";
		this._right.style.display = "block";
	}

	public hide () {
		this._left.style.display = "none";
		this._right.style.display = "none";
	}
}