/* import React, { useEffect } from 'react';
import '../assets/pong';

const GameComponentLoader: React.FC = () => {
    useEffect(() => {
        const loadScript = async () => {
            const script = document.createElement('script');
            script.type = 'module';
            script.src = 'https://localhost:4433/frontend-pong-module/app/src/component/oneVSone.ts';
            document.head.appendChild(script);
        };

        loadScript();
    }, []);

    return (
        <div style={{ width: '600px', height: '500px' }}>
            <pong-game></pong-game>
        </div>
    );
}; */
export class PongComponent extends HTMLElement {
    private options = {
        control: {
            rightPlayer: {
                up: 'ArrowUp',
                down: 'ArrowDown'
            },
            leftPlayer: {
                up: 'z',
                down: 's',
            }
        },
        FPS: 60,
        maxScore: 5,
		botEnabled: true, // Option pour activer le bot
		botDifficulty: 'extreme', // Difficulté du bot
    };

    private controls = {
        leftPlayerUp: false,
        rightPlayerUp: false,
        leftPlayerDown: false,
        rightPlayerDown: false,
        /* ballUp: true,
        ballRight: true, */
		ballUp: Math.random() < 0.5,
		ballRight: Math.random() < 0.5,
        ballSpeed: 5,
        leftBarSpeed: 5,
        rightBarSpeed: 5,
        score: {
            right: 0,
            left: 0,
        }
    };

    private socket: WebSocket | null = null;
	private gameRunning = false;
	//bot Options
    private botReactionTime: number = 300; // Default reaction time in ms
    private botMoveInterval: number | null = null;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot!.innerHTML = ` <style>
		:host {
			display: block;
			position: relative;
			width: 100%;
			height: 80vh;
		}
                body, html {
                    margin: 0;
                    padding: 0;
                    width: 100%;
                    height: 100%;
                }
                * {
                    box-sizing: border-box;
                }
                .pong {
                    position: absolute;
                    top: 0;
                    left: 0;
                    bottom: 0;
                    right: 0;
                    background-color:rgb(72, 74, 75);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                .bar {
                    position: absolute;
                    width: 20px;
                    height: 80px;
                    background-color:rgb(255, 255, 255);
                    opacity: .9;
                }
                .bar.left {
                    left: 20px;
                }
                .bar.right {
                    right: 20px;
                }
                .ball {
                    width: 40px;
                    height: 40px;
                    position: absolute;
                    background-color: #004052;
                    border-radius: 100%;
                    opacity: .8;
                }
                .pong-title {
                    font-family: sans-serif;
                    color: #B4C8CF;
                    font-weight: bold;
                    font-size: 6rem;
                }
                .score {
                    font-family: sans-serif;
                    position: absolute;
                    color:rgb(255, 255, 255);
                    font-weight: bold;
                    font-size: 4rem;
                    bottom: 5px;
                    margin: 0;
                    padding: 0;
                }
                .score.left {
                    left: 10px
                }
                .score.right {
                    right: 10px
                }
                .controls {
                    position: absolute;
					z-index: 1;
                    top: 50px;
                    left: 50%;
                    transform: translateX(-50%);
                    display: flex;
                    gap: 10px;
                }
                .controls button {
                    padding: 10px 20px;
                    font-size: 16px;
                    cursor: pointer;
                    border: none;
                    border-radius: 5px;
                    background-color: #007bff;
                    color: white;
                }
                .controls button:hover {
                    background-color: #0056b3;
                }
                .pong-container {
                    position: relative;
                    height: 100%;
                    width: 80vw;
                    margin: 0 auto;
                    

                }
            </style>
            <div class="pong-container">
            <div class="controls">
                <button id="local">Local Game</button>
                <button id="multiplayer">Multiplayer Game</button>
            </div>
                <div class="pong">
                    <p class="score left">0</p>
                    <div class="bar left"></div>
                    <div class="ball"></div>
                    <div class="bar right"></div>
                    <p class="score right">0</p>
                    <p class="pong-title">Pong</p>
                </div>
            </div>
        `;
    }


    connectedCallback() {
        this.initGame();
        this.shadowRoot!.querySelector('#local')!.addEventListener('click', () => this.startLocalGame());
        this.shadowRoot!.querySelector('#multiplayer')!.addEventListener('click', () => this.startMultiplayerGame());
		this.setBotDifficulty(this.options.botDifficulty);
    }

    startLocalGame() {
		console.log('startLocalGame');
		this.resetGame();
        this.initGame();
    }

    startMultiplayerGame() {
        this.connectWebSocket();
		this.resetGame();
        this.initGame();
    }
    
		resetGame() {
			this.controls = {
				leftPlayerUp: false,
				rightPlayerUp: false,
				leftPlayerDown: false,
				rightPlayerDown: false,				
				ballUp: Math.random() < 0.5,
				ballRight: Math.random() < 0.5,
				ballSpeed: 4,
				leftBarSpeed: 5,
				rightBarSpeed: 5,
				score: {
					right: 0,
					left: 0,
				}
			};
			this.updateScore();
		}

	initGame() {
			if (!this.gameRunning) {
				this.gameRunning = true;
				document.addEventListener('keydown', this.handleKeyDown.bind(this));
				document.addEventListener('keyup', this.handleKeyUp.bind(this));
				if (this.options.botEnabled) {
					this.startBot();
				}
				this.gameLoop();
			}
		}

    handleKeyDown(event: KeyboardEvent) {
        if (event.key === this.options.control.rightPlayer.up) {
            this.controls.rightPlayerUp = true;
        }
        if (event.key === this.options.control.rightPlayer.down) {
            this.controls.rightPlayerDown = true;
        }
        if (event.key === this.options.control.leftPlayer.up) {
            this.controls.leftPlayerUp = true;
        }
        if (event.key === this.options.control.leftPlayer.down) {
            this.controls.leftPlayerDown = true;
        }
    }

    handleKeyUp(event: KeyboardEvent) {
        if (event.key === this.options.control.rightPlayer.up) {
            this.controls.rightPlayerUp = false;
        }
        if (event.key === this.options.control.rightPlayer.down) {
            this.controls.rightPlayerDown = false;
        }
        if (event.key === this.options.control.leftPlayer.up) {
            this.controls.leftPlayerUp = false;
        }
        if (event.key === this.options.control.leftPlayer.down) {
            this.controls.leftPlayerDown = false;
        }
    }

    hasCollision(firstElement: HTMLElement, secondElement: HTMLElement) {
        if (firstElement.offsetLeft > secondElement.offsetLeft + secondElement.offsetWidth) {
            return false;
        }
        if (firstElement.offsetLeft + firstElement.offsetWidth < secondElement.offsetLeft) {
            return false;
        }
        if (firstElement.offsetTop > secondElement.offsetTop + secondElement.offsetHeight) {
            return false;
        }
        if (firstElement.offsetTop + firstElement.offsetHeight < secondElement.offsetTop) {
            return false;
        }
        return true;
    }

    clamp(num: number, min: number, max: number) {
        return Math.min(Math.max(num, min), max);
    }

    moveBall() {
        const ball = this.shadowRoot!.querySelector('.ball') as HTMLElement;
        const verticalPosition = ball.offsetTop;
        const horizontalPosition = ball.offsetLeft;
        const pong = this.shadowRoot!.querySelector('.pong') as HTMLElement;
        const viewportWidth = pong.clientWidth;
        const viewportHeight = pong.clientHeight;

        const newVerticalPosition = this.controls.ballUp
            ? this.clamp(verticalPosition - this.controls.ballSpeed, 0, viewportHeight - ball.offsetHeight)
            : this.clamp(verticalPosition + this.controls.ballSpeed, 0, viewportHeight - ball.offsetHeight);

        const newHorizontalPosition = this.controls.ballRight
            ? this.clamp(horizontalPosition + this.controls.ballSpeed, 0, viewportWidth - ball.offsetWidth)
            : this.clamp(horizontalPosition - this.controls.ballSpeed, 0, viewportWidth - ball.offsetWidth);

        ball.style.top = `${newVerticalPosition}px`;
        ball.style.left = `${newHorizontalPosition}px`;
    }

    changeControl() {
        const ball = this.shadowRoot!.querySelector('.ball') as HTMLElement;
        const newVerticalPosition = ball.offsetTop;
        const newHorizontalPosition = ball.offsetLeft;
        const pong = this.shadowRoot!.querySelector('.pong') as HTMLElement;
        const viewportWidth = pong.clientWidth;
        const viewportHeight = pong.clientHeight;

        if (newVerticalPosition === 0) {
            this.controls.ballUp = false;
        }

        if (newVerticalPosition === viewportHeight - ball.offsetHeight) {
            this.controls.ballUp = true;
        }

        if (newHorizontalPosition === 0) {
            this.controls.ballRight = true;
            this.controls.score.right += 1;
			ball.style.top = `${viewportHeight / 2}px`;
			ball.style.left = `${viewportWidth / 2}px`;
            this.sendScore();
        }

        if (newHorizontalPosition === viewportWidth - ball.offsetWidth) {
            this.controls.ballRight = false;
            this.controls.score.left += 1;
			ball.style.top = `${viewportHeight / 2}px`;
			ball.style.left = `${viewportWidth / 2}px`;
            this.sendScore();
        }

        if (this.hasCollision(ball, this.shadowRoot!.querySelector('.bar.right') as HTMLElement)) {
            this.controls.ballRight = false;
            this.controls.ballUp = this.controls.rightPlayerUp
                ? true
                : this.controls.rightPlayerDown
                    ? false
                    : this.controls.ballUp;
        }

        if (this.hasCollision(ball, this.shadowRoot!.querySelector('.bar.left') as HTMLElement)) {
            this.controls.ballRight = true;
            this.controls.ballUp = this.controls.leftPlayerUp
                ? true
                : this.controls.leftPlayerDown
                    ? false
                    : this.controls.ballUp;
        }
    }

    moveBar(bar: HTMLElement, up: boolean, down: boolean, speed: number) {
        const verticalPosition = bar.offsetTop;
		const pong = this.shadowRoot!.querySelector('.pong') as HTMLElement;
        const min = 0;
        const max = pong.clientHeight - bar.offsetHeight;

        const newPosition = up
            ? this.clamp(verticalPosition - speed, min, max)
            : down
                ? this.clamp(verticalPosition + speed, min, max)
                : verticalPosition;

        bar.style.top = `${newPosition}px`;
    }

    moveBot() {
        const ball = this.shadowRoot!.querySelector('.ball') as HTMLElement;
        const leftBar = this.shadowRoot!.querySelector('.bar.left') as HTMLElement;
        const ballCenter = ball.offsetTop + ball.offsetHeight / 2;
        const barCenter = leftBar.offsetTop + leftBar.offsetHeight / 2;

        if (ballCenter < barCenter) {
            this.controls.leftPlayerUp = true;
            this.controls.leftPlayerDown = false;
        } else {
            this.controls.leftPlayerUp = false;
            this.controls.leftPlayerDown = true;
        }
    }

    startBot() {
        if (this.botMoveInterval) {
            clearInterval(this.botMoveInterval);
        }

        this.botMoveInterval = window.setInterval(() => {
            this.moveBot();
        }, this.botReactionTime);
    }

    setBotDifficulty(difficulty: string) {
        switch (difficulty) {
            case 'easy':
                this.botReactionTime = 500;
                this.controls.leftBarSpeed = 3;
                break;
            case 'medium':
                this.botReactionTime = 300;
                this.controls.leftBarSpeed = 5;
                break;
            case 'hard':
                this.botReactionTime = 100;
                this.controls.leftBarSpeed = 7;
                break;
			case 'extreme':
					this.botReactionTime = 1;
					this.controls.leftBarSpeed = 10;
					break;
            default:
                this.botReactionTime = 300;
                this.controls.leftBarSpeed = 5;
                break;
        }
    }

    updateScore() {
        const leftScore = this.shadowRoot!.querySelector('.score.left') as HTMLElement;
        const rightScore = this.shadowRoot!.querySelector('.score.right') as HTMLElement;

        leftScore.innerText = this.controls.score.left.toString();
        rightScore.innerText = this.controls.score.right.toString();
    }

    gameLoop() {
        this.moveBall();
        this.moveBar(
            this.shadowRoot!.querySelector('.bar.right') as HTMLElement,
            this.controls.rightPlayerUp,
            this.controls.rightPlayerDown,
            this.controls.rightBarSpeed,
        );
        this.moveBar(
            this.shadowRoot!.querySelector('.bar.left') as HTMLElement,
            this.controls.leftPlayerUp,
            this.controls.leftPlayerDown,
            this.controls.leftBarSpeed,
        );

        this.changeControl();
        this.updateScore();
        requestAnimationFrame(this.gameLoop.bind(this));

    }

    sendScore() {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({ type: 'score', score: this.controls.score }));
        }
    }

    connectWebSocket() {
        this.socket = new WebSocket('wss://localhost:4433/ws');
        this.socket.onopen = () => {
            console.log('WebSocket connection established');
        };
        this.socket.onmessage = (event) => {
            console.log('Received message:', event.data);
            // Handle incoming messages
        };
        this.socket.onclose = () => {
            console.log('WebSocket connection closed');
        };
        this.socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    }
}

/* customElements.define('pong-game', PongComponent); */