import { Display } from "./Display.js";
import { Player } from "../entities/Player.js";

export class	Versus extends Display {

	/* ATTRIBUTES */
	private readonly	_right: HTMLDivElement;
	private readonly	_left: HTMLDivElement;

	private readonly	_font: string = "system-ui";		// typeface of the text
	private readonly	_color: string = "rgb(255, 0, 0)";	// color of the text
	private readonly	_size: number = 70;					// size of the text in pixel

	/* CONSTRUCTOR */
	constructor (players: Player[], canvas: HTMLDivElement) {
		super(canvas);

		this._right = document.createElement("div");
		this._right.textContent = players[0].name;
		this._right.style.font = `${this._font}`;
		this._right.style.color = `${this._color}`;
		this._right.style.fontSize = `${this._size}px`;
		this._right.style.top = "2%";
		this._right.style.right = "2%";
		this._right.style.position = "absolute";
		
		this._left = document.createElement("div");
		this._left.textContent = players[1].name;
		this._left.style.font = `${this._font}`;
		this._left.style.color = `${this._color}`;
		this._left.style.fontSize = `${this._size}px`;
		this._left.style.top = "2%";
		this._left.style.left = "2%";
		this._left.style.position = "absolute";
	}

	/* METHODS */
	public display () {
		this._canvas.appendChild(this._right);
		this._canvas.appendChild(this._left);
		setInterval(() => {
			this._right.remove();
			this._left.remove();
		}, 4000);
	}
}