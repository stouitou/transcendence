var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Ball } from './Ball.js';
import { Board } from './Board.js';
// export allows to use this class in another file
export class Game {
    /* CONSTRUCTOR */
    constructor(player1, player2) {
        this._round = 3;
        this._winner = null;
        this._beginning = true;
        this._break = false;
        this._ball = new Ball();
        this._board = new Board(player1, player2);
        this._player1 = player1;
        player1.paddle = 1;
        this._player2 = player2;
        player2.paddle = 2;
        this._pause = document.createElement('div');
        this._pause.textContent = "pause";
        this._pause.style.font = 'system-ui';
        this._pause.style.color = 'rgb(255, 0, 0)';
        this._pause.style.fontSize = '80px';
        this._pause.style.top = "5%";
        this._pause.style.left = "50%";
        this._pause.style.position = "absolute";
        this._pause.style.transform = "translate(-50%, -50%)";
        this._pause.style.display = "none";
        document.body.appendChild(this._pause);
        this.break();
    }
    get winner() {
        return this._winner;
    }
    startCountdown() {
        return new Promise((resolve) => {
            const counter = document.createElement('div');
            const countdown = ["3", "2", "1", "GO!", ""];
            counter.textContent = countdown[0];
            counter.style.font = 'system-ui';
            counter.style.color = 'rgb(100, 100, 100)';
            counter.style.fontSize = '300px';
            counter.style.top = "50%";
            counter.style.left = "50%";
            counter.style.position = "absolute";
            counter.style.transform = "translate(-50%, -50%)";
            document.body.appendChild(counter);
            for (let x = 1; x < countdown.length; x++) {
                setTimeout(() => {
                    counter.textContent = countdown[x];
                    if (x === countdown.length - 1)
                        resolve();
                }, x * 1000);
            }
        });
    }
    /* METHODS */
    launch() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.startCountdown();
            return new Promise((resolve) => {
                const loop = () => {
                    if (this._player1.paddle == null || this._player2.paddle == null)
                        throw "Bad initialization for the game";
                    if (this._round === 0) {
                        this._player1.setInfoEndGame(this._player2);
                        console.log(this._player1);
                        this._player2.setInfoEndGame(this._player1);
                        console.log(this._player2);
                        resolve();
                        return;
                    }
                    // Launch movement
                    if (this._break)
                        this._ball.move(0);
                    else if (this._beginning)
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
                    // else if (this._ball.top <= 0 || this._ball.bottom >= window.innerHeight)
                    // 	this._ball.direction.y *= -1;
                    // Avoid the ball being blocked in the middle of the wall ?
                    else if (this._ball.top <= 0) {
                        this._ball.element.style.top = '0px';
                        this._ball.direction.y *= -1;
                    }
                    else if (this._ball.bottom >= window.innerHeight) {
                        this._ball.element.style.top = `calc(${window.innerHeight - this._ball.diameter})px`;
                        this._ball.direction.y *= -1;
                    }
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
        });
    }
    break() {
        document.addEventListener('keydown', (event) => {
            if (event.key === " " && this._break == false) {
                if (this._player1.paddle == null || this._player2.paddle == null)
                    throw "Bad initialization for the game";
                this._player1.paddle.pause = true;
                this._player2.paddle.pause = true;
                this._break = true;
                this.displayPause();
            }
            else if (event.key === " " && this._break == true) {
                if (this._player1.paddle == null || this._player2.paddle == null)
                    throw "Bad initialization for the game";
                this._player1.paddle.pause = false;
                this._player2.paddle.pause = false;
                this._break = false;
                this.displayPause();
            }
            // this._player1.paddle.eventListeners();
            // this._player2.paddle.eventListeners();
        });
    }
    displayPause() {
        if (this._break)
            this._pause.style.display = "block";
        else
            this._pause.style.display = "none";
    }
}
