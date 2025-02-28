// export allows to use this class in another file
export class Ball {

	/* PRIVATE ATTRIBUTES */
	private readonly _element: HTMLDivElement;
	private readonly _diameter: number = 30;
	private readonly _color: string = 'rgb(0, 0, 0)';
	private readonly _speed: number = 8;

	/* CONSTRUCTOR */
	public constructor() {
		// Creates the ball object
		this._element = document.createElement('div');
		this._element.classList.add('ball');

		// Gives the ball all its values
		this._element.style.width = `${this._diameter}px`;
		this._element.style.height = `${this._diameter}px`;
		this._element.style.backgroundColor = this._color;				// color of the ball
		this._element.style.borderRadius = '50%';						// makes it round
		// this._element.style.top = `calc(50% - ${this._diameter}px)`;	// centered vertically (15px is half the size of the ball)
		this._element.style.left = `calc(50% - ${this._diameter / 2}px)`;	// centered horizontally (15px is half the size of the ball)
		this._element.style.position = 'absolute';						// doesn't interact with other objects or text
		this.spawn();

		// "Draws" the ball in the window
		document.body.appendChild(this._element);

		// this._animate();
	}

	public spawn() {
		const pos = (Math.random() * 100) / 2;

		this._element.style.top = `calc(25% - ${this._diameter / 2}px + ${pos}%)`;	// centered vertically (15px is half the size of the ball)
	}

	public moveRight() {
		console.log("move right");
		let currentRight = this._element.offsetLeft + this._diameter;
		console.log("in move right, before, this._element.style.left: ", this._element.style.left);
		console.log("in move right, current right: ", currentRight);
		console.log("in move right, speed: ", this._speed);
		console.log("in move right, diameter: ", this._diameter);
		this._element.style.left = `${currentRight + this._speed - this._diameter}px`;
		console.log("in move right, after, this._element.style.left: ", this._element.style.left);
	}

	public moveLeft() {
		console.log("move left");
		let currentLeft = this._element.offsetLeft;
		console.log("in move left, before, this._element.style.left: ", this._element.style.left);
		console.log("in move left, current left: ", currentLeft);
		console.log("in move left, speed: ", this._speed);
		console.log("in move left, diameter: ", this._diameter);
		this._element.style.left = `${currentLeft - this._speed}px`;
		console.log("in move left, after, this._element.style.left: ", this._element.style.left);
	}
}

// const animateRight = (callback: () => void) => {

// 	const step = 2;

//     const loop = () => {
//     const rectCirle = ball.getBoundingClientRect();
//     let yC = rectCirle.left;
//     yC += step;
//     ball.style.left = `${yC}px`;
    
//     const gameAreaWidthB = window.innerWidth;
//     const ballWidth = rectCirle.width;

//     const rectLeft = paddleLeft.getBoundingClientRect();
//     const rectRigth = paddleRigth.getBoundingClientRect();

//     let xR = rectRigth.left - rectRigth.width - 5;
//     let xL = rectLeft.right;

//     console.log("xR:", xR);
//     console.log("xL:", xL);
//     console.log("yC:", yC);
//		if (yC >= xR && (rectRigth.top < (rectCirle.top + rectCirle.height)) && (rectRigth.top + rectRigth.height) > rectCirle.top && rectRigth.left > rectCirle.left)//         //ball.style.top = '500px';
//         animateLeft(updateGame);
// 			return;
//     }

//         callback();
//         requestAnimationFrame(loop);
//     }

//     requestAnimationFrame(loop);
// };

// const animateLeft = (callback: () => void) => {
//     const step = 2;

//     const loop = () => {
//     const rectCirle = ball.getBoundingClientRect();
//     let yC = rectCirle.left;
//     yC -= step;
//     ball.style.left = `${yC}px`;
    
//     const gameAreaWidthB = window.innerWidth;
//     const ballWidth = rectCirle.width;

//     const rectLeft = paddleLeft.getBoundingClientRect();
//     const rectRigth = paddleRigth.getBoundingClientRect();

//     let xR = rectRigth.left - rectRigth.width;
//     let xL = rectLeft.left - rectLeft.width;

//     console.log("xR:", xR);
//     console.log("xL:", xL);
//     console.log("yC:", yC);
//     if ((yC <= xL && (rectLeft.top < (rectCirle.top + rectCirle.height)) && (rectLeft.top + rectLeft.height) > rectCirle.top && rectLeft.left < rectCirle.left) {
//         //ball.style.top = '500px';
//         //yC = '500px';
//         animateRight(updateGame);
// 			return;
//     }

//         callback();
//         requestAnimationFrame(loop);
//     }

//     requestAnimationFrame(loop);
// };

// // Exemple de callback : tu peux utiliser ce callback pour ajouter des effets supplémentaires
// const updateGame = () => {
//     console.log("La balle a été déplacée !");
// // Tu peux aussi ajouter d'autres mises à jour ou vérifications ici
// };
  
// // Appel de la fonction animate avec le callback
// animateLeft(updateGame);
