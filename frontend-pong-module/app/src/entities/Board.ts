import { Player } from "./Player.js";

export class Board {

	/* ATTRIBUTES */
	private readonly	_element: HTMLDivElement;
	private readonly	_font: string = 'system-ui';
	private readonly	_color: string = 'rgb(0, 0, 0)';
	private readonly	_size: number = 70;
	private readonly	_opacity: number = 0.4;

	private readonly	_player1: Player;
	private	readonly	_player2: Player;
	private				_posting: string;

	/* CONSTRUCTOR */
	constructor(player1: Player, player2: Player) {
		this._player1 = player1;
		this._player2 = player2;
		this._posting = this._player2.score + " - " + this._player1.score;

		this._element = document.createElement('div');
		this._element.textContent = this._posting;
		this._element.style.font = `${this._font}`;
		this._element.style.color = this._color;
		this._element.style.fontSize = `${this._size}px`;
		this._element.style.opacity = `${this._opacity}`;
		this._element.style.top = '10%';
		this._element.style.left = '50%';
		this._element.style.position = 'absolute';
		this._element.style.transform = 'translateX(-50%)';
		document.body.appendChild(this._element);
	}

	/* GETTERS */
	public get player1 () {
		return this._player1;
	}

	public get player2 () {
		return this._player2;
	}	

	public get posting () {
		return this._posting;
	}

	/* METHODS */
	public score(ball: number) {

		if (ball >= window.innerWidth)
			this._player2.incrementScore();
		else
			this._player1.incrementScore();

		this._posting = this._player2.score + " - " + this._player1.score;
		this._element.textContent = this._posting;
	}
}