import { Ball } from "./Ball";
import { Paddle } from "./Paddle";

export class	Player{

	protected readonly		_id: string;
	protected readonly		_name: string;
	protected readonly		_role: string;

	protected				_location: number = 0;
	protected				_points: number = 0;
	protected				_paddle: Paddle | null = null;
	protected				_direction: string | null = null;

	protected				_keyPressed: Set<string> = new Set();
	protected				_display: HTMLDivElement;
	protected				_lastWin: boolean = false;

	constructor (json: any) {
		this._id = json.id;
		this._name = json.name;
		if (!this._name)
			this._name = 'Host';
		this._role = json.role;
		if (!this._role)
			this._role = 'user';

		this._display = document.createElement('div');
		this.displayProperties();
	}

	/* ---------- getters ---------- */
	get name () { return this._name ; }
	get role () { return this._role ; }
	get lastWin () { return this._lastWin ; }
	get points () { return this._points ; }
	get location () { return this._location ; }
	get keyPressed () { return this._keyPressed ; }
	get direction (): string | null { return this._direction ; }
	get display () { return this._display ; }
	get paddle () : Paddle | null { return this._paddle ; }

	/* ---------- setters ---------- */
	set points (points: number) { this._points = points; }
	set location (location: number) { this._location = location; }
	set paddle (paddle: Paddle) { this._paddle = paddle; }
	set	direction (direction: string | null) { this._direction = direction; }
	set lastWin (lastWin: boolean) { this._lastWin = lastWin; }

	move (ball: Ball) {
		if (this.role === 'bot') {
			switch (this._location) {
				case 0:
				case 1:
					this.followBallVertical(ball);
					break ;
				case 2:
				case 3:
					this.followBallHorizontal(ball);
					break ;
			}
			return ;
		}

		this._keyPressed.forEach((key) => {
			switch (this._location) {
				case 0:
					if (key === 'ArrowUp')			this._direction = 'up';
					else if (key === 'ArrowDown')	this._direction = 'down';
					break ;
				case 1:
					if (key === 'a')				this._direction = 'up';
					else if (key === 's')			this._direction = 'down';
					break ;
				case 2:
					if (key === 'ArrowLeft')		this._direction = 'left';
					else if (key === 'ArrowRight')	this._direction = 'right';
					break ;
				case 3:
					if (key === 'a')				this._direction = 'left';
					else if (key === 'd')			this._direction = 'right';
					break ;	
			}
		});
	}

	score () {
		this._points++;
		const score: HTMLParagraphElement = this._display.lastElementChild as HTMLParagraphElement;
		score.textContent = `${this._points}`;
	}
	
	losePoint () {
		if (this._points === 0)
			return ;
		this._points--;
		const score: HTMLParagraphElement = this._display.lastElementChild as HTMLParagraphElement;
		score.textContent = `${this._points}`;
	}

	private displayProperties () {
		this._display.style.position = 'relative';
		this._display.style.display = 'flex';
		this._display.style.alignItems = 'space-between';
		this._display.style.width = '50%';
		this._display.style.height = 'auto';
		this._display.style.margin = '5px';
		this._display.style.justifyContent = 'space-between';
	}

	private followBallHorizontal (ball: Ball) {
		if (this._paddle && (this._paddle.position.x + (this._paddle.height / 2) > ball.position.x)) {
			this._direction = 'left';
		}
		else if (this._paddle && (this._paddle.position.x + (this._paddle.height / 2) < ball.position.x)) {
			this._direction = 'right';
		}
	}

	private followBallVertical (ball: Ball) {
		if (this._paddle && (this._paddle.position.y + (this._paddle.height / 2) > ball.position.y)) {
			this._direction = 'up';
		}
		else if (this._paddle && (this._paddle.position.y + (this._paddle.height / 2) < ball.position.y)) {
			this._direction = 'down';
		}
	}

}