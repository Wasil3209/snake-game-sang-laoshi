// Get canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const restartButton = document.getElementById('restartButton');

// Game settings
const gridSize = 20;      // 20x20 grid
const cellSize = 20;      // 20px per cell
let snake = [
    [10, 10],   // head
    [9, 10],
    [8, 10]
];
let direction = 'RIGHT';   // current moving direction
let nextDirection = 'RIGHT';
let food = [15, 10];
let score = 0;
let gameLoop;
let gameActive = true;

// Initialize game
function init() {
    // Random initial food
    generateRandomFood();
    // Draw everything
    draw();
    // Start game loop
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(update, 100);  // move every 100ms
}

// Generate food at a random position not occupied by the snake
function generateRandomFood() {
    let newFood;
    do {
        newFood = [
            Math.floor(Math.random() * gridSize),
            Math.floor(Math.random() * gridSize)
        ];
    } while (snake.some(segment => segment[0] === newFood[0] && segment[1] === newFood[1]));
    food = newFood;
}

// Draw everything on canvas
function draw() {
    // Clear canvas
    ctx.fillStyle = '#1e2a36';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw snake
    snake.forEach((segment, index) => {
        // Head darker / tail lighter
        if (index === 0) {
            ctx.fillStyle = '#2ecc71';
        } else {
            ctx.fillStyle = '#27ae60';
        }
        ctx.fillRect(segment[0] * cellSize, segment[1] * cellSize, cellSize - 1, cellSize - 1);
        // Add a little eye for the head
        if (index === 0) {
            ctx.fillStyle = 'white';
            ctx.fillRect(segment[0] * cellSize + 14, segment[1] * cellSize + 5, 3, 3);
            ctx.fillRect(segment[0] * cellSize + 14, segment[1] * cellSize + 12, 3, 3);
        }
    });
    
    // Draw food
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(food[0] * cellSize, food[1] * cellSize, cellSize - 1, cellSize - 1);
}

// Update game state (move snake, check collisions, eat food)
function update() {
    if (!gameActive) return;
    
    // Apply the queued direction (prevent opposite)
    if ((nextDirection === 'RIGHT' && direction !== 'LEFT') ||
        (nextDirection === 'LEFT' && direction !== 'RIGHT') ||
        (nextDirection === 'UP' && direction !== 'DOWN') ||
        (nextDirection === 'DOWN' && direction !== 'UP')) {
        direction = nextDirection;
    }
    
    // Calculate new head position
    let newHead = [...snake[0]];
    switch (direction) {
        case 'RIGHT': newHead[0]++; break;
        case 'LEFT':  newHead[0]--; break;
        case 'UP':    newHead[1]--; break;
        case 'DOWN':  newHead[1]++; break;
    }
    
    // Check collision with walls
    if (newHead[0] < 0 || newHead[0] >= gridSize || newHead[1] < 0 || newHead[1] >= gridSize) {
        gameOver();
        return;
    }
    
    // Check collision with self (excluding the tail that will be removed if no food)
    let selfCollision = false;
    for (let i = 0; i < snake.length; i++) {
        if (snake[i][0] === newHead[0] && snake[i][1] === newHead[1]) {
            selfCollision = true;
            break;
        }
    }
    if (selfCollision) {
        gameOver();
        return;
    }
    
    // Check if food is eaten
    const ateFood = (newHead[0] === food[0] && newHead[1] === food[1]);
    
    // Move snake: insert new head, remove tail if not eating
    snake.unshift(newHead);
    if (!ateFood) {
        snake.pop();
    } else {
        // Increase score and generate new food
        score++;
        scoreElement.textContent = score;
        generateRandomFood();
    }
    
    // Redraw canvas
    draw();
}

// Game over function
function gameOver() {
    gameActive = false;
    clearInterval(gameLoop);
    
    // Display game over message on canvas
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f1c40f';
    ctx.font = 'bold 24px "Segoe UI"';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width/2, canvas.height/2 - 20);
    ctx.font = '16px "Segoe UI"';
    ctx.fillText('Click Restart to play again', canvas.width/2, canvas.height/2 + 20);
}

// Restart the game
function restartGame() {
    // Reset variables
    snake = [
        [10, 10],
        [9, 10],
        [8, 10]
    ];
    direction = 'RIGHT';
    nextDirection = 'RIGHT';
    score = 0;
    scoreElement.textContent = '0';
    gameActive = true;
    
    // Generate food not on snake
    generateRandomFood();
    
    // Clear previous interval and start new game loop
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(update, 100);
    
    // Draw initial state
    draw();
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (!gameActive) return;  // no controls when game is over
    
    const key = e.key;
    if (key === 'ArrowUp') {
        nextDirection = 'UP';
        e.preventDefault();
    } else if (key === 'ArrowDown') {
        nextDirection = 'DOWN';
        e.preventDefault();
    } else if (key === 'ArrowLeft') {
        nextDirection = 'LEFT';
        e.preventDefault();
    } else if (key === 'ArrowRight') {
        nextDirection = 'RIGHT';
        e.preventDefault();
    }
});

// Restart button event
restartButton.addEventListener('click', () => {
    restartGame();
});

// Start the game
init();
