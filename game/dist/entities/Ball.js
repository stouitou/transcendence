import { Direction } from './Direction.js';
// export allows to use this class in another file
export class Ball {
    /* CONSTRUCTOR */
    constructor() {
        this._diameter = 30;
        this._radius = this._diameter / 2;
        this._color = 'rgb(0, 0, 0)';
        // For the movement
        this._speed = 8;
        this._startingSpeed = 4;
        // Creates the ball object
        this._element = document.createElement('div');
        // Gives the ball basic values
        this._element.style.width = `${this._diameter}px`;
        this._element.style.height = `${this._diameter}px`;
        this._element.style.backgroundColor = this._color; // color of the ball
        this._element.style.borderRadius = '50%'; // makes it round
        this._element.style.position = 'absolute'; // doesn't interact with other objects or text
        // Gives the ball a random direction and position
        this._direction = new Direction(0, 0);
        this.spawn();
        this._top = this._element.offsetTop;
        this._bottom = this._top + this._diameter;
        this._left = this._element.offsetLeft;
        this._right = this._left + this._diameter;
    }
    /* GETTERS */
    get element() {
        return this._element;
    }
    get diameter() {
        return this._diameter;
    }
    get direction() {
        return this._direction;
    }
    get speed() {
        return this._speed;
    }
    get startingSpeed() {
        return this._startingSpeed;
    }
    get top() {
        return this._top;
    }
    get bottom() {
        return this._bottom;
    }
    get left() {
        return this._left;
    }
    get right() {
        return this._right;
    }
    /* METHODS */
    // Update current position
    updatePosition() {
        this._top = this._element.offsetTop;
        this._bottom = this._top + this._diameter;
        this._left = this._element.offsetLeft;
        this._right = this._left + this._diameter;
    }
    spawn() {
        // Randomize position
        const pos = (Math.random() * 100) / 3;
        this._element.style.top = `calc(33% - ${this._radius}px + ${pos}%)`; // random vertically (from 33% to 66% of the window)
        this._element.style.left = `calc(50% - ${this._radius}px)`; // centered horizontally (15px is half the size of the ball)
        // Ramdomize direction
        const add = Math.random() * 30;
        this._direction.x = Math.sin((45 + add) * Math.PI / 180); // compute x direction depending on an angle between 45 and 75 degrees
        this._direction.y = Math.cos((45 + add) * Math.PI / 180); // compute y direction depending on an angle between 45 and 75 degrees
        let base = Math.round(Math.random()); // random integer between 0 and 1
        if (base === 0)
            this._direction.x *= -1;
        base = Math.round(Math.random());
        if (base === 0)
            this._direction.y *= -1;
        // if spawn up and direction down, do we need to manage differently ?
    }
    move(speed) {
        this._direction.normalize();
        const currentLeft = this._element.offsetLeft;
        const currentTop = this._element.offsetTop;
        this._element.style.left = `${currentLeft + (speed * this._direction.x)}px`;
        this._element.style.top = `${currentTop + (speed * this._direction.y)}px`;
    }
    bounce(paddle) {
        this._direction.x *= -1;
        // Position the ball outside of the paddle to avoid being blocked
        if (this._left < paddle.right && this._left > paddle.left)
            this._element.style.left = `${paddle.right}px`;
        else if (this._right > paddle.left && this._right < paddle.right)
            this._element.style.left = `calc(${paddle.left - this._diameter} - 1)px`;
        // Formula for the rebound : θrebound ​= θmax ​× (2 × ((yimpact ​− ypaddle) / paddle height)​)
        const impact = 2 * (((this._top + this._radius) - (paddle.top + (paddle.height / 2))) / paddle.height);
        const angle = ((55 * Math.PI / 180) * impact) + (5 * Math.PI / 180); // get an angle between 5 and 60 degrees
        this._direction.x = Math.cos(angle) * Math.sign(this._direction.x);
        this._direction.y = Math.sin(angle);
    }
}
