import { Display } from "./Display.js";
import { Player } from "../entities/Player.js";

export class	Board extends Display {

	/* ATTRIBUTES */
	private readonly	_right: HTMLDivElement;
	private readonly	_left: HTMLDivElement;

	private readonly	_font: string = "system-ui";		// typeface of the text
	private readonly	_color: string = "rgb(0, 0, 0)";	// color of the text
	private readonly	_opacity: number = 1;				// opacity of the text
	private readonly	_size: number = 70;					// size of the text in pixel
	private readonly	_vertical: number = 0;				// vertical position in percentage
	private readonly	_horizontal: number = 25;			// horizontal position in percentage

	private readonly	_player1: Player;
	private	readonly	_player2: Player;

	/* CONSTRUCTOR */
	constructor(player1: Player, player2: Player, canvas: HTMLCanvasElement) {
		super(canvas);

		this._player1 = player1;
		this._player2 = player2;

		// Score of the first player (on the right)
		this._right = document.createElement("div");

		this._right.textContent = `${this._player1.score}`;
		this._right.style.font = `${this._font}`;
		this._right.style.color = `${this._color}`;
		this._right.style.opacity = `${this._opacity}`;
		this._right.style.fontSize = `${this._size}px`;
		this._right.style.top = `${this._canvas.offsetTop + this._vertical / 100 * this._canvas.height}px`;
		this._right.style.left = `${this._canvas.offsetLeft + ((100 - this._horizontal) / 100 * this._canvas.width)}px`;
		this._right.style.position = 'absolute';

		// Score of the second player (on the left)
		this._left = document.createElement("div");

		this._left.textContent = `${this._player2.score}`;
		this._left.style.font = `${this._font}`;
		this._left.style.color = `${this._color}`;
		this._left.style.fontSize = `${this._size}px`;
		this._left.style.top = `${this._canvas.offsetTop}px`;
		this._left.style.left = `${this._canvas.offsetLeft + (this._horizontal / 100 * this._canvas.width)}px`;
		this._left.style.position = 'absolute';
	}
	
	/* GETTERS */
	public get player1 () {
		return this._player1;
	}
	
	public get player2 () {
		return this._player2;
	}	
	
	/* METHODS */
	public display () {
		// const	gameContainer = this._canvas.parentleft as HTMLleft;
		// gameContainer.appendChild(this._right);
		this._gameContainer.appendChild(this._right);
		// const	gameContainer = this._canvas.parentleft as HTMLleft;
		// gameContainer.appendChild(this._left);
		this._gameContainer.appendChild(this._left);
	}

	public score(ball: number) {

		// Update scores & contents
		if (ball >= window.innerWidth) {
			this._player2.incrementScore();
			this._left.textContent = `${this._player2.score}`;
		}
		else {
			this._player1.incrementScore();
			this._right.textContent = `${this._player1.score}`;
		}
	}
}