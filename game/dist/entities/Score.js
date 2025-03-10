export class Score {
    /* CONSTRUCTOR */
    constructor() {
        this._font = 'system-ui';
        this._color = 'rgb(0, 0, 0)';
        this._size = 70;
        this._opacity = 0.4;
        this._player2 = 0;
        this._player1 = 0;
        this._score = this._player2 + " - " + this._player1;
        this._board = document.createElement('div');
        this._board.textContent = this._score;
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
    get player2() {
        return this._player2;
    }
    get player1() {
        return this._player1;
    }
    get message() {
        return this._score;
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
    /* METHODS */
    setMessage() {
        this._score = this._player2 + " - " + this._player1;
        this.displayScores();
    }
    increaseScore(ball) {
        if (ball > window.innerWidth)
            this._player2 += 1;
        else
            this._player1 += 1;
        this.setMessage();
    }
    displayScores() {
        this._board.textContent = this._score;
    }
}
