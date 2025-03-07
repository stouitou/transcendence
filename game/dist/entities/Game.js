import { Ball } from './Ball.js';
import { Paddle } from './Paddle.js';
import { Score } from './Score.js';
// export allows to use this class in another file
export class Game {
    /* CONSTRUCTOR */
    constructor() {
        this._round = 3;
        this._beginning = true;
        this._ball = new Ball;
        this._paddleRight = new Paddle(1);
        this._paddleLeft = new Paddle(2);
        this._score = new Score;
        // this.launch();
    }
    /* METHODS */
    launch() {
        const loop = () => {
            if (this._round === 0)
                return;
            // Launch movement
            if (this._beginning)
                this._ball.move(this._ball.startingSpeed);
            else
                this._ball.move(this._ball.speed);
            this._paddleLeft.move();
            this._paddleRight.move();
            this._paddleLeft.updatePosition();
            this._paddleRight.updatePosition();
            this._ball.updatePosition();
            // If touch a paddle...
            if (this._paddleLeft.collision(this._ball)) {
                this._beginning = false;
                this._ball.bounce(this._paddleLeft);
            }
            else if (this._paddleRight.collision(this._ball)) {
                this._beginning = false;
                this._ball.bounce(this._paddleRight);
            }
            // ...or touch a wall...
            else if (this._ball.top <= 0 || this._ball.bottom >= window.innerHeight)
                this._ball.direction.y *= -1;
            // ...or get out the field
            else if (this._ball.right <= 0 || this._ball.left >= window.innerWidth) {
                this._score.increaseScore(this._ball.right);
                this._beginning = true;
                this._ball.spawn();
                this._round--;
            }
            requestAnimationFrame(loop);
        };
        loop();
    }
}
