// export allows to use this class in another file
// import { vector } from "../types/Ball.types";
import { Direction } from './Direction.js';
export class Ball {
    /* CONSTRUCTOR */
    constructor() {
        this._diameter = 30;
        this._color = 'rgb(0, 0, 0)';
        this._speed = 8;
        // Creates the ball object
        this._element = document.createElement('div');
        this._element.classList.add('ball');
        // Gives the ball all its values
        this._element.style.width = `${this._diameter}px`;
        this._element.style.height = `${this._diameter}px`;
        this._element.style.backgroundColor = this._color; // color of the ball
        this._element.style.borderRadius = '50%'; // makes it round
        // this._element.style.top = `calc(50% - ${this._diameter}px)`;		// centered vertically (15px is half the size of the ball)
        this._element.style.left = `calc(50% - ${this._diameter / 2}px)`; // centered horizontally (15px is half the size of the ball)
        this._element.style.position = 'absolute'; // doesn't interact with other objects or text
        this._direction = new Direction(0, 0);
        this.spawn();
        // "Draws" the ball in the window
        document.body.appendChild(this._element);
    }
    get direction() {
        return this._direction;
    }
    spawn() {
        const pos = (Math.random() * 100) / 3;
        this._element.style.top = `calc(33% - ${this._diameter / 2}px + ${pos}%)`; // centered vertically (15px is half the size of the ball)
        const add = Math.random() * 30;
        this._direction.x = Math.sin((45 + add) * Math.PI / 180);
        this._direction.y = Math.cos((45 + add) * Math.PI / 180);
        let base = Math.random();
        if (base < 0.5)
            this._direction.x *= -1;
        base = Math.random();
        if (base < 0.5)
            this._direction.y *= -1;
    }
    move() {
        this._direction.normalize();
        const currentLeft = this._element.offsetLeft;
        const currentTop = this._element.offsetTop;
        this._element.style.left = `${currentLeft + (this._speed * this._direction.x)}px`;
        this._element.style.top = `${currentTop + (this._speed * this._direction.y)}px`;
    }
}
