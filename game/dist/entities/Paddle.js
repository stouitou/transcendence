// export allows to use this class in another file
export class Paddle {
    /* CONSTRUCTOR */
    constructor(location = 1 | 2) {
        this._width = 20;
        this._height = 120;
        this._color = 'rgb(0, 0, 0)';
        this._speed = 5;
        this._keys = {};
        this._pause = false;
        this._location = location;
        // Creates the paddle object
        this._element = document.createElement('div');
        this._element.classList.add('paddle');
        // Gives the paddle all its values
        this._element.style.width = `${this._width}px`;
        this._element.style.height = `${this._height}px`;
        this._element.style.backgroundColor = `${this._color}`;
        this._element.style.position = 'absolute';
        this._element.style.top = `calc(50% - ${this._height / 2}px)`; // this._element.style.top = `${(window.innerHeight / 2) - (this._height / 2)}px`;
        if (location === 2)
            this._element.style.left = `calc(5% - ${this._width / 2}px)`;
        else if (location === 1)
            this._element.style.right = `calc(5% + ${this._width / 2}px)`;
        // "Draws" the paddle in the window
        document.body.appendChild(this._element);
        // Update position
        this._top = this._element.offsetTop;
        this._bottom = this._top + this._height;
        this._left = this._element.offsetLeft;
        this._right = this._left + this._width;
        // Arrow function makes this referring to the paddle and not to the document
        this.eventListeners();
        // document.addEventListener('keydown', (event) => this._keys[event.key] = true);
        // document.addEventListener('keyup', (event) => this._keys[event.key] = false);
        // modify document to be able to move paddles anytime
    }
    /* GETTERS */
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
    get top() {
        return this._top;
    }
    ;
    get bottom() {
        return this._bottom;
    }
    ;
    get left() {
        return this._left;
    }
    ;
    get right() {
        return this._right;
    }
    ;
    get keys() {
        return this._keys;
    }
    ;
    get pause() {
        return this._pause;
    }
    ;
    set pause(value) {
        this._pause = value;
    }
    /* METHODS */
    move() {
        if (this._pause)
            return;
        // Fetch the x value of the top of 
        // the paddle, and the keys that are being pressed
        const moveUp = (this._keys['ArrowUp'] && this._location === 1) || (this._keys['s'] && this._location === 2);
        const moveDown = (this._keys['ArrowDown'] && this._location === 1) || (this._keys['x'] && this._location === 2);
        // Move subsequently
        if (moveUp) {
            this._element.style.top = `${Math.max(0, this._top - this._speed)}px`;
        }
        if (moveDown) {
            this._element.style.top = `${Math.min(window.innerHeight - this._height, this._top + this._speed)}px`;
        }
    }
    // Update current position
    updatePosition() {
        this._top = this._element.offsetTop;
        this._bottom = this._top + this._height;
        this._left = this._element.offsetLeft;
        this._right = this._left + this._width;
    }
    collision(ball) {
        if (ball.right >= this._left &&
            ball.left <= this._right &&
            ball.bottom >= this._top &&
            ball.top <= this._bottom)
            return (true);
    }
    eventListeners() {
        document.addEventListener('keydown', (event) => this._keys[event.key] = true);
        document.addEventListener('keyup', (event) => this._keys[event.key] = false);
    }
}
