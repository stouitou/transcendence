export class Score {
    /* CONSTRUCTOR */
    constructor() {
        this._font = 'Arial';
        this._color = 'rgb(0, 0, 0)';
        this._size = 70;
        this._opacity = 0.4;
        this._player2 = 0;
        this._player1 = 0;
        this._message = this._player2 + " - " + this._player1;
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
    get player2() {
        return this._player2;
    }
    get player1() {
        return this._player1;
    }
    get message() {
        return this._message;
    }
    /* SETTER */
    set player2(newScore) {
        this.player2 = newScore;
        this.setMessage();
    }
    set player1(newScore) {
        this._player1 = newScore;
        this.setMessage();
    }
    setMessage() {
        this._message = this._player2 + " - " + this._player1;
        this.displayScores();
    }
    /* METHODS */
    increaseScore(ball) {
        if (ball > window.innerWidth)
            this._player2 += 1;
        else
            this._player1 += 1;
        this.setMessage();
    }
    displayScores() {
        this._score.textContent = this._message;
    }
}
