// export allows to use this class in another file
export class Paddle {
    /* CONSTRUCTOR */
    constructor(position) {
        this._width = 20;
        this._height = 120;
        this._color = 'rgb(255, 0, 0)';
        this._speed = 5;
        this.keys = {};
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
        // "Draws" the paddle in the window
        document.body.appendChild(this._element);
        // Arrow function makes this referring to the paddle and not to the document
        document.addEventListener('keydown', (event) => this.keys[event.key] = true);
        document.addEventListener('keyup', (event) => this.keys[event.key] = false);
        // Launch animation to be able to move the paddle with keyboard
        this._animate();
    }
    _animate() {
        const loop = () => {
            // Fetch the x value of the top of the paddle, and the keys that are being pressed
            let currentTop = this._element.offsetTop;
            const moveUp = (this.keys['ArrowUp'] && this._position === 'right') || (this.keys['s'] && this._position === 'left');
            const moveDown = (this.keys['ArrowDown'] && this._position === 'right') || (this.keys['x'] && this._position === 'left');
            // Move subsequently
            if (moveUp) {
                this._element.style.top = `${Math.max(0, currentTop - this._speed)}px`;
            }
            if (moveDown) {
                this._element.style.top = `${Math.min(window.innerHeight - this._element.offsetHeight, currentTop + this._speed)}px`;
            }
            // Function called when browser refreshes pages
            requestAnimationFrame(loop);
        };
        loop();
    }
}
