export class Score {

	/* PRIVATE ATTRIBUTES */
	private readonly _board: HTMLDivElement;
	private readonly _font: string = 'system-ui';
	private readonly _color: string = 'rgb(0, 0, 0)';
	private readonly _size: number = 70;
	private readonly _opacity: number = 0.4;

	private _player2: number = 0;
	private _player1: number = 0;
	private _message: string = this._player2 + " - " + this._player1;

	/* CONSTRUCTOR */
	public constructor() {
		this._board = document.createElement('div');

		this._board.textContent = this._message;
		this._board.style.font = `${this._font}`;
		this._board.style.color = this._color;
		this._board.style.fontSize = `${this._size}px`;
		this._board.style.opacity = `${this._opacity}`;
		this._board.style.top = "10%";
		this._board.style.left = "50%";
		this._board.style.position = "absolute";
		this._board.style.transform = "translateX(-50%)";

		document.body.appendChild(this._board);
	}

	/* GETTERS */
	public get player2 () {
		return this._player2;
	}

	public get player1 () {
		return this._player1;
	}

	public get message () {
		return this._message;
	}

	/* SETTER */
	public set player2 (newScore: number) {
		this.player2 = newScore;
		this.setMessage();
	}

	public set player1 (newScore: number) {
		this._player1 = newScore;
		this.setMessage();
	}

	/* METHODS */
	public setMessage () {
		this._message = this._player2 + " - " + this._player1;
		this.displayScores();
	}

	public increaseScore (ball: number) {
		if (ball > window.innerWidth)
			this._player2 += 1;
		else
			this._player1 += 1;
		this.setMessage();
	}

	public displayScores () {
		this._board.textContent = this._message;
	}
}