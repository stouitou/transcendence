// pongGame.ts
export function startGame(): void {
    const canvas = document.getElementById("pongCanvas") as HTMLCanvasElement | null;
    if (!canvas) {
        throw new Error("Canvas element not found");
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
        throw new Error("2D context not available");
    }

    interface Ball {
        x: number;
        y: number;
        dx: number;
        dy: number;
        radius: number;
    }

    let ball: Ball = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        dx: 2,
        dy: 2,
        radius: 10,
    };

    function drawBall(): void {
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = "#fff";
        ctx.fill();
        ctx.closePath();
    }

    function updateGame(): void {
        ctx.fillStyle = "#333";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawBall();

        ball.x += ball.dx;
        ball.y += ball.dy;

        if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
            ball.dx *= -1;
        }
        if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
            ball.dy *= -1;
        }
    }
    setInterval(updateGame, 8);
}

  
