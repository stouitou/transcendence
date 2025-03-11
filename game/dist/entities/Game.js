import { Ball } from './Ball.js';
import { Board } from './Board.js';
// export allows to use this class in another file
export class Game {
    /* CONSTRUCTOR */
    constructor(player1, player2) {
        this._round = 3;
        this._beginning = true;
        this._ball = new Ball();
        this._board = new Board(player1, player2);
        this._player1 = player1;
        player1.paddle = 1;
        this._player2 = player2;
        player2.paddle = 2;
    }
    /* METHODS */
    launch() {
        return new Promise((resolve) => {
            const loop = () => {
                if (this._round === 0) {
                    this._player1.setInfoEndGame(this._player2);
                    this._player2.setInfoEndGame(this._player1);
                    resolve();
                    return;
                }
                // Launch movement
                if (this._beginning)
                    this._ball.move(this._ball.startingSpeed);
                else
                    this._ball.move(this._ball.speed);
                this._player1.paddle.move();
                this._player2.paddle.move();
                this._player1.paddle.updatePosition();
                this._player2.paddle.updatePosition();
                this._ball.updatePosition();
                // If touch a paddle...
                if (this._player1.paddle.collision(this._ball)) {
                    this._beginning = false;
                    this._ball.bounce(this._player1.paddle);
                }
                else if (this._player2.paddle.collision(this._ball)) {
                    this._beginning = false;
                    this._ball.bounce(this._player2.paddle);
                }
                // ...or touch a wall...
                else if (this._ball.top <= 0 || this._ball.bottom >= window.innerHeight)
                    this._ball.direction.y *= -1;
                // ...or get out the field
                else if (this._ball.right <= 0 || this._ball.left >= window.innerWidth) {
                    this._board.update(this._ball.right);
                    this._beginning = true;
                    this._ball.spawn();
                    this._round--;
                }
                requestAnimationFrame(loop);
            };
            loop();
        });
    }
}
