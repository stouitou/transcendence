import { Display } from "./Display.js";
import { Player } from "../entities/Player.js";
import { Ball } from "../entities/Ball.js";

export class	Board extends Display {

	/* ATTRIBUTES */
	private readonly	_right: HTMLDivElement;
	private readonly	_left: HTMLDivElement;
	private readonly	_botom: HTMLDListElement | null = null;

	private readonly	_font: string = "system-ui";		// typeface of the text
	private readonly	_color: string = "rgb(255, 0, 0)";	// color of the text
	private readonly	_opacity: number = 1;				// opacity of the text
	private readonly	_size: number = 70;					// size of the text in pixel
	private readonly	_vertical: number = 0;				// vertical position in percentage
	private readonly	_horizontal: number = 25;			// horizontal position in percentage

	private readonly	_player1: Player;
	private	readonly	_player2: Player;
	private readonly	_player3: Player | null = null;

	/* CONSTRUCTOR */
	constructor(players: Player[], canvas: HTMLCanvasElement) {
		super(canvas);

		this._player1 = players[0];
		this._player2 = players[1];
		// Score of the first player (on the right)
		this._right = document.createElement("div");

		this._right.textContent = `${this._player1.score}`;
		// this._right.textContent = "right";
		this._right.style.font = `${this._font}`;
		this._right.style.color = `${this._color}`;
		this._right.style.opacity = `${this._opacity}`;
		this._right.style.fontSize = `${this._size}px`;
		this._right.style.position = "absolute";
		this._right.style.top = "2%";
		this._right.style.right = "30%";
		this._right.style.transform = "translateX(50%)";
		
		// Score of the second player (on the left)
		this._left = document.createElement("div");
		
		this._left.textContent = `${this._player2.score}`;
		this._left.style.font = `${this._font}`;
		this._left.style.color = `${this._color}`;
		this._left.style.fontSize = `${this._size}px`;
		this._left.style.position = "absolute";
		this._left.style.top = "2%";
		this._left.style.left = "30%";
		this._right.style.transform = "translateX(50%)";

		// if (players[2]) {
		// 	this._player3 = players[2];
			
		// 	if(!this._botom) {
		// 	this._botom = document.createElement("div");

		// 	this._botom.textContent = `${this._player3.score}`;
		// 	this._botom.style.font = `${this._font}`;
		// 	this._botom.style.color = `${this._color}`;
		// 	this._botom.style.fontSize = `${this._size}px`;
		// 	this._botom.style.top = `${this._canvas.offsetTop}px`;
		// 	this._botom.style.left = `${this._canvas.offsetLeft + (this._horizontal / 100 * this._canvas.width)}px`;
		// 	this._botom.style.position = 'absolute';
		// 	this._botom.textContent = `${this._player2.score}`; }
		// }
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
		// this._canvas.appendChild(this._right);
		// this._canvas.appendChild(this._left);
	}

	public score(ball: Ball) {

		// Update scores & contents
		if (ball.left >= this._canvas.offsetWidth) {
			this._player2.incrementScore();
			this._left.textContent = `${this._player2.score}`;
		}
		else if (ball.right <= 0) {
			this._player1.incrementScore();
			this._right.textContent = `${this._player1.score}`;
		}
	}
}