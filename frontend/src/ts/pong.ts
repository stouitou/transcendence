
import '../css/input.css';


document.addEventListener('DOMContentLoaded', () => {
    
    // Retrieve the canvas element and ensure it exists
    const canvas = document.getElementById("pongCanvas") as HTMLCanvasElement | null;
    if (!canvas) {
      throw new Error("Canvas element not found");
    }
  
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("2D context not available");
    }
  
    // Define a type for the ball
    interface Ball {
      x: number;
      y: number;
      dx: number;
      dy: number;
      radius: number;
    }
  
    // Initialize the ball
    let ball: Ball = {
      x: canvas.width / 2,
      y: canvas.height / 2,
      dx: 2,
      dy: 2,
      radius: 10,
    };
  
    // Function to draw the ball on the canvas
    function drawBall(): void {
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fillStyle = "#fff";
      ctx.fill();
      ctx.closePath();
    }
  
    // Update game state and redraw
    function updateGame(): void {
      // Clear the canvas with a dark background
      ctx.fillStyle = "#333";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drawBall();
  
      // Update ball's position
      ball.x += ball.dx;
      ball.y += ball.dy;
  
      // Reverse direction when hitting left or right boundaries
      if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
        ball.dx *= -1;
      }
  
      // Reverse direction when hitting top or bottom boundaries
      if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
        ball.dy *= -1;
      }
    }
  
    // Call updateGame every 8 milliseconds
    setInterval(updateGame, 8);
  });
  
