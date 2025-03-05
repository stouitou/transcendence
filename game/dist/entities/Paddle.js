// export allows to use this class in another file
export class Paddle {
    /* CONSTRUCTOR */
    constructor(position) {
        this._width = 20;
        this._height = 120;
        this._color = 'rgb(255, 0, 0)';
        this._speed = 5;
        this._keys = {};
        // Creates the paddle object
        this._element = document.createElement('div');
        this._element.classList.add('ball');
        // Gives the paddle all its values
        this._position = position;
        this._element.style.width = `${this._width}px`;
        this._element.style.height = `${this._height}px`;
        this._element.style.backgroundColor = `${this._color}`;
        this._element.style.position = 'absolute';
        this._element.style.top = `calc(50% - ${this._height / 2}px)`; // this._element.style.top = `${(window.innerHeight / 2) - (this._height / 2)}px`;
        if (position === 'left')
            this._element.style.left = `calc(5% - ${this._width / 2}px)`;
        else if (position === 'right')
            this._element.style.right = `calc(5% + ${this._width / 2}px)`;
        this._top = this._element.offsetTop;
        this._bottom = this._top + this._height;
        this._left = this._element.offsetLeft;
        this._right = this._left + this._width;
        // "Draws" the paddle in the window
        document.body.appendChild(this._element);
        // Arrow function makes this referring to the paddle and not to the document
        document.addEventListener('keydown', (event) => this._keys[event.key] = true);
        document.addEventListener('keyup', (event) => this._keys[event.key] = false);
        // modify document to be able to move paddles anytime
    }
    get element() {
        return this._element;
    }
    ;
    get width() {
        return this._width;
    }
    ;
    get height() {
        return this._height;
    }
    ;
    get keys() {
        return this._keys;
    }
    ;
    move() {
        // Fetch the x value of the top of the paddle, and the keys that are being pressed
        let currentTop = this._element.offsetTop;
        const moveUp = (this._keys['ArrowUp'] && this._position === 'right') || (this._keys['s'] && this._position === 'left');
        const moveDown = (this._keys['ArrowDown'] && this._position === 'right') || (this._keys['x'] && this._position === 'left');
        // Move subsequently
        if (moveUp) {
            this._element.style.top = `${Math.max(0, currentTop - this._speed)}px`;
        }
        if (moveDown) {
            this._element.style.top = `${Math.min(window.innerHeight - this._element.offsetHeight, currentTop + this._speed)}px`;
        }
    }
    updatePosition() {
        this._top = this._element.offsetTop;
        this._bottom = this._top + this._height;
        this._left = this._element.offsetLeft;
        this._right = this._left + this._width;
    }
    checkCollision(ball) {
        this.updatePosition();
        ball.updatePosition();
        if (ball.bottom >= this._top &&
            ball.top <= this._bottom &&
            ball.left <= this._right &&
            // ball.left >= this._left &&
            ball.direction.x < 0) {
            console.log("1");
            ball.direction.x *= -1;
        }
        if (ball.bottom >= this._top &&
            ball.top <= this._bottom &&
            ball.right >= this._left &&
            // ball.right >= this._right &&
            ball.direction.x > 0) {
            console.log("2");
            ball.direction.x *= -1;
        }
        if (ball.right >= this._left &&
            ball.left <= this._right &&
            ball.bottom <= this._top &&
            ball.top >= this._bottom) {
            console.log("3");
            ball.direction.y *= -1;
        }
    }
}
// let paddleBottom: number = this._paddleLeft.element.offsetTop + this._paddleLeft.height;
// let paddleLeftRightEdge: number = this._paddleLeft.element.offsetLeft + this._paddleLeft.width;
// let ballCenter: number = this._ball.element.offsetLeft + this._ball.diameter / 2;
// if (this._ball.element.offsetTop + this._ball.diameter >= this._paddleLeft.element.offsetTop &&
// 	this._ball.element.offsetTop <= paddleBottom &&
// this._ball.element.offsetLeft <= paddleLeftRightEdge &&
// 	this._ball.element.offsetLeft >= this._paddleLeft.element.offsetLeft &&
//  this._ball.direction.x < 0) {
// 		this._ball.direction.x = -1;
// }
// else if ((ballCenter >= this._paddleLeft.element.offsetLeft && ballCenter <= paddleLeftRightEdge) &&
// (this._ball.element.offsetTop + this._ball.diameter >= this._paddleLeft.element.offsetTop &&
// this._ball.element.offsetTop <= paddleBottom) && this._ball.direction.x <= 0) {
// 	this._ball.direction.x= -1;
// 	this._ball.direction.y *= -1;
