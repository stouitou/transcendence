import { Ball } from './Ball';
import { Player } from "./Player";
import { Position } from '@src/types/gameUtils.type';

export class	Bot {

	private readonly	_player: Player;
	private readonly	_level: number;
	//private				_targetSide: string | null = null;
	private readonly	_tolerance: number = 20;	// tolerance to avoid vibrations
	CANVAS_HEIGHT = 600;
	CANVAS_WIDTH = 800;

	constructor (level: number, player: Player) {
		this._player = player;
		this._level = level;
		this.move = this.move.bind(this);
		this.followBallHorizontal = this.followBallHorizontal.bind(this);
		this.followBallVertical = this.followBallVertical.bind(this);
		this.repositionToCenterHorizontal = this.repositionToCenterHorizontal.bind(this);
		this.repositionToCenterVertical = this.repositionToCenterVertical.bind(this);
	}

	move (ball: Ball) {
		switch (this._player.index) {
			case 0:
			case 1:
				this.followBallVertical(ball);
				break ;
			case 2:
			case 3:
				this.followBallHorizontal(ball);
				break ;
		}
	}

	private followBallHorizontal (ball: Ball) {
		if (!this._player.paddle)	{ return ; }
	
		const	{ paddle } = this._player;
		const	target = paddle.position.x + paddle.size.width / 2;			// middle of the paddle
		const	noise = (Math.random() - 0.5) * Math.pow(this._level, 4);	// noise depending on the bot level
		const	ballPosition: Position = { x: ball.position.x + noise, y: ball.position.y + noise };
			// Go back to the center of the canvas if ball go away
		if (
			ball.velocity.y < 0 && this._player.index === 2 ||
			ball.velocity.y > 0 && this._player.index === 3
		) {
			this.repositionToCenterHorizontal();
			return ;
		}
	

			// Détermine le seuil de déclenchement selon le niveau
			const minTrigger = 0.2 + 0.15 * (this._level - 1); // lvl 1: 0.2, lvl 5: 0.8
			let triggerZone = 0;
			if (this._player.index === 2) { // Défend le bas
				triggerZone = this.CANVAS_HEIGHT * minTrigger;
				if (ball.position.y < this.CANVAS_HEIGHT - triggerZone) {
					this._player.directionReceived = null;
					return;
				}
			}
			if (this._player.index === 3) { // Défend le haut
				triggerZone = this.CANVAS_HEIGHT * minTrigger;
				if (ball.position.y > triggerZone) {
					this._player.directionReceived = null;
					return;
				}
			}
		// Check if the bot needs to move
		if (Math.abs(target - ballPosition.x) > this._tolerance) {
			if (target > ballPosition.x) {
				this._player.directionReceived = "left";
			} else if (target < ballPosition.x) {
				this._player.directionReceived = "right";
			}
		} else {
			// Stop movement if possition is ok
			this._player.directionReceived = null;
		}
	}
	
	private followBallVertical (ball: Ball) {
		if (!this._player.paddle)	{ return ; }
	
		const	{ paddle } = this._player;
		const	target = paddle.position.y + paddle.size.height / 2;		// middle of the paddle
		const	noise = (Math.random() - 0.5) * Math.pow(this._level, 4);	// noise depending on the bot level
		const	ballPosition: Position = { x: ball.position.x + noise, y: ball.position.y + noise };
	
		// Go back to the center of the canvas if ball go away
		if (
			ball.velocity.x < 0 && this._player.index === 0 ||
			ball.velocity.x > 0 && this._player.index === 1
		) {
			this.repositionToCenterVertical();
			return;
		}

	 // Détermine le seuil de déclenchement selon le niveau
    const minTrigger = 0.2 + 0.15 * (this._level - 1); // lvl 1: 0.2, lvl 5: 0.8
    let triggerZone = 0;

    if (this._player.index === 0) { // Défend le bas
        triggerZone = this.CANVAS_WIDTH * minTrigger;
        if (ball.position.x < this.CANVAS_WIDTH - triggerZone) {
            this._player.directionReceived = null;
            return;
        }
    }
    if (this._player.index === 1) { // Défend le haut
        triggerZone = this.CANVAS_WIDTH * minTrigger;
        if (ball.position.x > triggerZone) {
            this._player.directionReceived = null;
            return;
        }
    }
	
		// Check if the bot needs to move
		if (Math.abs(target - ballPosition.y) > this._tolerance) {
			if (target > ballPosition.y) {
				this._player.directionReceived = "up";
			} else if (target < ballPosition.y) {
				this._player.directionReceived = "down";
			}
		} else {
			// Stop movement if possition is ok
			this._player.directionReceived = null;
		}
	}
	
	private repositionToCenterHorizontal () {
		if (!this._player.paddle)	{ return ; }

		const	{ paddle } = this._player;
		const	center = this.CANVAS_WIDTH / 2;
		const	target = paddle.position.x + paddle.size.width / 2;
	
		if (Math.abs(target - center) > this._tolerance) {
			if (target > center) {
				this._player.directionReceived = "left";
			} else if (target < center) {
				this._player.directionReceived = "right";
			}
		} else {
			this._player.directionReceived = null;
		}
	}
	
	private repositionToCenterVertical () {
		if (!this._player.paddle)	{ return; }

		const	{ paddle } = this._player;
		const	center = this.CANVAS_HEIGHT / 2;
		const	target = paddle.position.y + paddle.size.height / 2;
	
		if (Math.abs(target - center) > this._tolerance) {
			if (target > center) {
				this._player.directionReceived = "up";
			} else if (target < center) {
				this._player.directionReceived = "down";
			}
		} else {
			this._player.directionReceived = null;
		}
	}
}