export class Score {
	private _scoreLeft: number = 0;
	private _scoreRigth: number = 0;
	private _score: string = this._scoreLeft.toString() + " - " + this._scoreRigth.toString();

	private readonly _color: string = 'rgb(0, 0, 0)';
	private readonly _size: number = 70;
	private readonly _msg: HTMLDivElement;

	public constructor() {
		this._msg = document.createElement('div');

		this._msg.textContent = this._score;
		this._msg.style.position = "absolute";
		this._msg.style.color = this._color;
		this._msg.style.fontSize = `${this._size}px`
		this._msg.style.top = "10%";
		this._msg.style.left = "50%";
		this._msg.style.transform = "translateX(-50%)";
		this._msg.style.opacity = "0.3"

		document.body.appendChild(this._msg);
	}

	/* GETTER / SETTER */
	public get scoreLeft () {
		return this._scoreLeft;
	}

	public get scoreRigth () {
		return this._scoreRigth;
	}

	public getScore () {
		return this._score;
	}

	public set scoreLeft (newScore: number) {
		this.scoreLeft = newScore;
		this.setScore();
	}

	public set scoreRigth (newScore: number) {
		this._scoreRigth = newScore;
		this.setScore();
	}

	public setScore () {
		this._score = this._scoreLeft.toString() + " - " + this._scoreRigth.toString();
		this.displayScores();
	}

	/* INCREMENTATION DU SCORE */
	public incrScore (ball: number) {
		if (ball > 600)
			this._scoreLeft += 1;
		else
			this._scoreRigth += 1;
		this.setScore();
	}

	public displayScores () {
		console.log("getScore", this.getScore());
		this._msg.textContent = this._score;
		//document.body.appendChild(this.msg);
	}
}