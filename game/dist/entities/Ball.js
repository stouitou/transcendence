// export allows to use this class in another file
export class Ball {
    /* CONSTRUCTOR */
    constructor() {
        this._diameter = 30;
        this._color = 'rgb(0, 0, 0)';
        this._speed = 4;
        // Creates the ball object
        this._element = document.createElement('div');
        this._element.classList.add('ball');
        // Gives the ball all its values
        this._element.style.width = `${this._diameter}px`;
        this._element.style.height = `${this._diameter}px`;
        this._element.style.backgroundColor = this._color; // color of the ball
        this._element.style.borderRadius = '50%'; // makes it round
        this._element.style.top = `calc(50% - ${this._diameter}px)`; // centered vertically (15px is half the size of the ball)
        this._element.style.left = `calc(50% - ${this._diameter}px)`; // centered horizontally (15px is half the size of the ball)
        this._element.style.position = 'absolute'; // doesn't interact with other objects or text
        // "Draws" the ball in the window
        document.body.appendChild(this._element);
        if (Math.random() < 0.5)
            this._moveRight();
        else
            this._moveLeft();
    }
    _moveRight() {
        let currentRight = this._element.offsetLeft + this._diameter;
    }
    _moveLeft() {
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
