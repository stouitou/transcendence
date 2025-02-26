document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById("pongCanvas");
    const ctx = canvas.getContext("2d");

    let ball = { x: canvas.width / 2, y: canvas.height / 2, dx: 2, dy: 2, radius: 10 };

    function drawBall() {
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = "#fff";
        ctx.fill();
        ctx.closePath();
    }

    function updateGame() {
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
});
