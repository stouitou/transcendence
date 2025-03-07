export class Score {
    constructor() {
        this._scoreLeft = 0;
        this._scoreRigth = 0;
        this._score = this._scoreLeft.toString() + " - " + this._scoreRigth.toString();
        this._color = 'rgb(0, 0, 0)';
        this._size = 70;
        this._msg = document.createElement('div');
        this._msg.textContent = this._score;
        this._msg.style.position = "absolute";
        this._msg.style.color = this._color;
        this._msg.style.fontSize = `${this._size}px`;
        this._msg.style.top = "10%";
        this._msg.style.left = "50%";
        this._msg.style.transform = "translateX(-50%)";
        this._msg.style.opacity = "0.3";
        document.body.appendChild(this._msg);
    }
    /* GETTER / SETTER */
    get scoreLeft() {
        return this._scoreLeft;
    }
    get scoreRigth() {
        return this._scoreRigth;
    }
    getScore() {
        return this._score;
    }
    set scoreLeft(newScore) {
        this.scoreLeft = newScore;
        this.setScore();
    }
    set scoreRigth(newScore) {
        this._scoreRigth = newScore;
        this.setScore();
    }
    setScore() {
        this._score = this._scoreLeft.toString() + " - " + this._scoreRigth.toString();
        this.displayScores();
    }
    /* INCREMENTATION DU SCORE */
    incrScore(ball) {
        if (ball > 600)
            this._scoreLeft += 1;
        else
            this._scoreRigth += 1;
        this.setScore();
    }
    displayScores() {
        console.log("getScore", this.getScore());
        this._msg.textContent = this._score;
        //document.body.appendChild(this.msg);
    }
}
