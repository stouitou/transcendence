export class Score {

	/* PRIVATE ATTRIBUTES */
	private readonly _score: HTMLDivElement;
	private readonly _font: string = 'Arial';
	private readonly _color: string = 'rgb(0, 0, 0)';
	private readonly _size: number = 70;
	private readonly _opacity: number = 0.4;

	private _player2: number = 0;
	private _player1: number = 0;
	private _message: string = this._player2 + " - " + this._player1;

	/* CONSTRUCTOR */
	public constructor() {
		this._score = document.createElement('div');

		this._score.textContent = this._message;
		this._score.style.font = `${this._font}`;
		this._score.style.color = this._color;
		this._score.style.fontSize = `${this._size}px`;
		this._score.style.opacity = `${this._opacity}`;
		this._score.style.top = "10%";
		this._score.style.left = "50%";
		this._score.style.position = "absolute";
		this._score.style.transform = "translateX(-50%)";

		document.body.appendChild(this._score);
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

	public setMessage () {
		this._message = this._player2 + " - " + this._player1;
		this.displayScores();
	}

	/* METHODS */
	public increaseScore (ball: number) {
		if (ball > window.innerWidth)
			this._player2 += 1;
		else
			this._player1 += 1;
		this.setMessage();
	}

	public displayScores () {
		this._score.textContent = this._message;
	}
}