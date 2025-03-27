import { Display } from "./Display.js";
import { Player } from "../entities/Player.js";

export class	Versus extends Display {

	/* ATTRIBUTES */
	private readonly	_right: HTMLDivElement;
	private readonly	_left: HTMLDivElement;

	private readonly	_font: string = "system-ui";		// typeface of the text
	private readonly	_color: string = "rgb(0, 0, 0)";	// color of the text
	private readonly	_size: number = 70;					// size of the text in pixel
	private readonly	_vertical: number = 0;				// vertical position in percentage
	private readonly	_horizontal: number = 5;			// horizontal position in percentage

	/* CONSTRUCTOR */
	constructor (player1: Player, player2: Player, canvas: HTMLCanvasElement) {
		super(canvas);

		this._right = document.createElement("div");
		this._right.textContent = player1.name;
		this._right.style.font = `${this._font}`;
		this._right.style.color = `${this._color}`;
		this._right.style.fontSize = `${this._size}px`;
		this._right.style.top = `${this._field.top + (this._vertical / 100 * this._field.height)}px`;
		this._right.style.right = `${this._field.right - (this._horizontal / 100 * this._field.width)}px`;
		this._right.style.position = "absolute";
		
		this._left = document.createElement("div");
		this._left.textContent = player2.name;
		this._left.style.font = `${this._font}`;
		this._left.style.color = `${this._font}`;
		this._left.style.fontSize = `${this._size}px`;
		this._left.style.top = `${this._field.top + (this._vertical / 100 * this._field.height)}px`;
		this._left.style.left = `${this._field.left + (this._horizontal / 100 * this._field.width)}px`;
		this._left.style.position = "absolute";
	}

	/* METHODS */
	public display () {
		this._gameContainer.appendChild(this._right);
		this._gameContainer.appendChild(this._left);
		setInterval(() => {
			this._right.remove();
			this._left.remove();
		}, 4000);
	}
}