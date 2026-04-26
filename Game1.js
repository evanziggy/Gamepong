// Canvas setup
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game objects
const paddleWidth = 10;
const paddleHeight = 80;
const ballSize = 8;
const speed = 5;

// Player paddle
const playerPaddle = {
    x: 15,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    maxSpeed: 6,
    color: '#00ff00'
};

// Computer paddle
const computerPaddle = {
    x: canvas.width - paddleWidth - 15,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 4,
    color: '#ff0000'
};

// Ball
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: ballSize,
    dx: speed,
    dy: speed,
    maxSpeed: 8,
    color: '#ffff00'
};

// Score
let playerScore = 0;
let computerScore = 0;
let gameRunning = false;

// Input handling
const keys = {
    ArrowUp: false,
    ArrowDown: false
};

let mouseY = canvas.height / 2;

// Event listeners
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') keys.ArrowUp = true;
    if (e.key === 'ArrowDown') keys.ArrowDown = true;
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowUp') keys.ArrowUp = false;
    if (e.key === 'ArrowDown') keys.ArrowDown = false;
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseY = e.clientY - rect.top;
});

canvas.addEventListener('click', () => {
    if (!gameRunning) {
        gameRunning = true;
        resetBall();
    }
});

// Update player paddle position
function updatePlayerPaddle() {
    // Arrow key control
    if (keys.ArrowUp) {
        playerPaddle.dy = -playerPaddle.maxSpeed;
    } else if (keys.ArrowDown) {
        playerPaddle.dy = playerPaddle.maxSpeed;
    } else {
        playerPaddle.dy = 0;
    }

    // Mouse control (optional smoothing)
    const paddleCenter = playerPaddle.y + playerPaddle.height / 2;
    const diff = mouseY - paddleCenter;
    if (Math.abs(diff) > 5) {
        playerPaddle.dy = Math.max(-playerPaddle.maxSpeed, Math.min(playerPaddle.maxSpeed, diff * 0.1));
    } else {
        if (!keys.ArrowUp && !keys.ArrowDown) {
            playerPaddle.dy = 0;
        }
    }

    // Update position
    playerPaddle.y += playerPaddle.dy;

    // Collision with walls
    if (playerPaddle.y < 0) playerPaddle.y = 0;
    if (playerPaddle.y + playerPaddle.height > canvas.height) {
        playerPaddle.y = canvas.height - playerPaddle.height;
    }
}

// Update computer paddle (AI)
function updateComputerPaddle() {
    const computerCenter = computerPaddle.y + computerPaddle.height / 2;
    const diff = ball.y - computerCenter;

    // AI difficulty - tracks ball with slight delay
    if (Math.abs(diff) > 10) {
        computerPaddle.dy = Math.sign(diff) * computerPaddle.speed;
    } else {
        computerPaddle.dy = 0;
    }

    computerPaddle.y += computerPaddle.dy;

    // Collision with walls
    if (computerPaddle.y < 0) computerPaddle.y = 0;
    if (computerPaddle.y + computerPaddle.height > canvas.height) {
        computerPaddle.y = canvas.height - computerPaddle.height;
    }
}

// Update ball position
function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Top and bottom wall collision
    if (ball.y - ball.size < 0 || ball.y + ball.size > canvas.height) {
        ball.dy = -ball.dy;
        ball.y = Math.max(ball.size, Math.min(canvas.height - ball.size, ball.y));
    }

    // Left and right wall collision (score)
    if (ball.x - ball.size < 0) {
        computerScore++;
        updateScore();
        resetBall();
    }
    if (ball.x + ball.size > canvas.width) {
        playerScore++;
        updateScore();
        resetBall();
    }

    // Paddle collision
    checkPaddleCollision(playerPaddle);
    checkPaddleCollision(computerPaddle);
}

// Check collision with paddle
function checkPaddleCollision(paddle) {
    if (
        ball.x - ball.size < paddle.x + paddle.width &&
        ball.x + ball.size > paddle.x &&
        ball.y - ball.size < paddle.y + paddle.height &&
        ball.y + ball.size > paddle.y
    ) {
        // Reverse ball direction
        ball.dx = -ball.dx;

        // Add spin based on where ball hits paddle
        const hitPos = (ball.y - paddle.y) / paddle.height;
        const angle = (hitPos - 0.5) * 0.75; // Max ±0.75 radians
        
        const speed = Math.sqrt(ball.dx ** 2 + ball.dy ** 2);
        ball.dx = Math.cos(angle) * speed * (ball.dx > 0 ? -1 : 1);
        ball.dy = Math.sin(angle) * speed;

        // Prevent ball from getting stuck
        if (ball.dx > 0) {
            ball.x = paddle.x + paddle.width + ball.size;
        } else {
            ball.x = paddle.x - ball.size;
        }

        // Increase speed slightly (cap at maxSpeed)
        const newSpeed = Math.sqrt(ball.dx ** 2 + ball.dy ** 2);
        if (newSpeed < ball.maxSpeed) {
            const speedIncrease = 1.05;
            ball.dx *= speedIncrease;
            ball.dy *= speedIncrease;
        }
    }
}

// Reset ball to center
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = speed * (Math.random() > 0.5 ? 1 : -1);
    ball.dy = speed * (Math.random() - 0.5) * 2;
    gameRunning = false;
}

// Update score display
function updateScore() {
    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('computerScore').textContent = computerScore;
}

// Draw functions
function drawRect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

function drawCircle(x, y, radius, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}

function drawCenterLine() {
    ctx.strokeStyle = '#00ff00';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

// Render game
function render() {
    // Clear canvas
    drawRect(0, 0, canvas.width, canvas.height, '#000');

    // Draw center line
    drawCenterLine();

    // Draw paddles
    drawRect(playerPaddle.x, playerPaddle.y, playerPaddle.width, playerPaddle.height, playerPaddle.color);
    drawRect(computerPaddle.x, computerPaddle.y, computerPaddle.width, computerPaddle.height, computerPaddle.color);

    // Draw ball
    drawCircle(ball.x, ball.y, ball.size, ball.color);

    // Draw start message
    if (!gameRunning) {
        ctx.fillStyle = '#00ff00';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('CLICK TO START', canvas.width / 2, canvas.height / 2 + 50);
    }
}

// Main game loop
function gameLoop() {
    if (gameRunning) {
        updatePlayerPaddle();
        updateComputerPaddle();
        updateBall();
    } else {
        updatePlayerPaddle();
    }

    render();
    requestAnimationFrame(gameLoop);
}

// Start the game
resetBall();
gameLoop();
