export class Board {
    /* CONSTRUCTOR */
    constructor(player1, player2) {
        this._font = 'system-ui';
        this._color = 'rgb(0, 0, 0)';
        this._size = 70;
        this._opacity = 0.4;
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
    get player1() {
        return this._player1;
    }
    get player2() {
        return this._player2;
    }
    get posting() {
        return this._posting;
    }
    /* METHODS */
    score(ball) {
        if (ball >= window.innerWidth)
            this._player2.incrementScore();
        else
            this._player1.incrementScore();
        this._posting = this._player2.score + " - " + this._player1.score;
        this._element.textContent = this._posting;
    }
}
