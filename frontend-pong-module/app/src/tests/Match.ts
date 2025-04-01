import { BallObject } from "./BallObject";
import { PaddleObject } from "./PaddleObject";

export class	Match {

	private readonly	_field: CanvasRenderingContext2D;
	private readonly	_width: number;
	private readonly	_height: number;

	private readonly	_color: string = 'rgb(0, 0, 0)';

	private readonly	_ball: BallObject;
	private readonly	_paddles: PaddleObject[] = [];

	private				_break: boolean = false;


	constructor (canvas: HTMLCanvasElement, numberOfPlayers: number) {
		this._field = canvas.getContext('2d')!;
		this._width = canvas.width;
		this._height = canvas.height;

		this._field.fillStyle = this._color;
		this._field.fillRect(0, 0, this._width, this._height);
		
		this._ball = new BallObject(canvas);
		for (let i = 0; i < numberOfPlayers; i++) {
			this._paddles[i] = new PaddleObject(canvas, i);
		}

		this.eventListener();

		this.launch();
	}
	
	async launch () : Promise<void> {

		return new Promise((resolve) => {
			const	loop = () => {
				if (this._ball.out())
					resolve();

				if (!this._break) {
					this.refresh();
				}

				requestAnimationFrame(loop);
			})
		}

	private refresh () {

		this._field.clearRect(0, 0, this._width, this._height);

		this._field.fillStyle = this._color;
		this._field.fillRect(0, 0, this._width, this._height);

		this._ball.move();
		for (let i = 0; i < this._paddles.length; i++) {
			this._paddles[i].move();
		}
	}

	private eventListener () {
		document.addEventListener('keydown', (event) => {
			if (event.key === ' ') {
				this._break = !this._break;
			}
		})
	}
}