document.addEventListener('DOMContentLoaded', () => {
    const gameCanvas = document.getElementById('gameCanvas');
    const nextPieceCanvas = document.getElementById('nextPieceCanvas');
    const scoreElement = document.getElementById('score');
    const startButton = document.getElementById('startButton');

    const ctx = gameCanvas.getContext('2d');
    const nextCtx = nextPieceCanvas.getContext('2d');

    const BLOCK_SIZE = 30;
    const BASE_GAME_SPEED = 300; // Base time in milliseconds between piece drops
    let game = null;
    let gameLoop = null;
    let lastDropTime = 0;
    let controlsMap = {};
    let discoveredControls = new Set();

    // Available letters for controls (excluding commonly used keys)
    const availableKeys = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
        .filter(key => !['F', 'R', 'P', 'M'].includes(key));

    function generateRandomControls() {
        const shuffled = [...availableKeys].sort(() => Math.random() - 0.5);
        return {
            left: shuffled[0],
            right: shuffled[1],
            rotate: shuffled[2],
            softDrop: shuffled[3],
            hardDrop: shuffled[4]
        };
    }

    function drawBlock(context, x, y, color) {
        context.fillStyle = color;
        context.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);

        // Add highlight effect
        context.fillStyle = 'rgba(255, 255, 255, 0.2)';
        context.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE / 4);
    }

    function drawGame() {
        // Clear canvas
        ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

        // Draw grid
        game.grid.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    drawBlock(ctx, x, y, game.colors[value]);
                }
            });
        });

        // Draw current piece
        if (game.currentPiece) {
            game.currentPiece.shape.forEach((row, dy) => {
                row.forEach((value, dx) => {
                    if (value) {
                        drawBlock(
                            ctx,
                            game.currentPiece.x + dx,
                            game.currentPiece.y + dy,
                            game.colors[game.currentPiece.type]
                        );
                    }
                });
            });
        }
    }

    function drawNextPiece() {
        nextCtx.clearRect(0, 0, nextPieceCanvas.width, nextPieceCanvas.height);

        if (game.nextPiece) {
            const offsetX = (nextPieceCanvas.width / BLOCK_SIZE - game.nextPiece.shape[0].length) / 2;
            const offsetY = (nextPieceCanvas.height / BLOCK_SIZE - game.nextPiece.shape.length) / 2;

            game.nextPiece.shape.forEach((row, dy) => {
                row.forEach((value, dx) => {
                    if (value) {
                        drawBlock(
                            nextCtx,
                            offsetX + dx,
                            offsetY + dy,
                            game.colors[game.nextPiece.type]
                        );
                    }
                });
            });
        }
    }

    function updateScore() {
        scoreElement.textContent = game.score;
    }

    function updateControls() {
        const controlsDiv = document.querySelector('.controls');
        controlsDiv.innerHTML = '<h3>Controls</h3>';

        const controlDescriptions = {
            left: '← Move Left',
            right: '→ Move Right',
            rotate: '↻ Rotate',
            softDrop: '↓ Soft Drop',
            hardDrop: '⬇ Hard Drop'
        };

        for (const [action, key] of Object.entries(controlsMap)) {
            if (discoveredControls.has(action)) {
                controlsDiv.innerHTML += `<p>${key} : ${controlDescriptions[action]}</p>`;
            } else {
                controlsDiv.innerHTML += `<p>? : ${controlDescriptions[action]}</p>`;
            }
        }
    }

    function gameOver() {
        cancelAnimationFrame(gameLoop);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

        ctx.fillStyle = '#ffffff';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', gameCanvas.width / 2, gameCanvas.height / 2);

        startButton.textContent = 'Play Again';
        startButton.disabled = false;
    }

    function update(timestamp) {
        if (!game.gameOver) {
            const currentSpeed = BASE_GAME_SPEED / (game.speedLevel * 1.2); // More dramatic speed increase
            if (timestamp - lastDropTime > currentSpeed) {
                game.tick();
                lastDropTime = timestamp;
            }

            drawGame();
            drawNextPiece();
            updateScore();
            gameLoop = requestAnimationFrame(update);
        } else {
            gameOver();
        }
    }

    function handleKeyPress(event) {
        if (game.gameOver) {
            return; //Removed Enter key handling for restart.
        }

        const key = event.key.toUpperCase();
        let actionTaken = false;

        // Check if the pressed key matches any of our controls
        Object.entries(controlsMap).forEach(([action, controlKey]) => {
            if (key === controlKey) {
                discoveredControls.add(action);
                switch (action) {
                    case 'left':
                        actionTaken = game.movePiece(-1, 0);
                        break;
                    case 'right':
                        actionTaken = game.movePiece(1, 0);
                        break;
                    case 'softDrop':
                        actionTaken = game.movePiece(0, 1);
                        break;
                    case 'rotate':
                        game.currentPiece = game.rotate(game.currentPiece);
                        actionTaken = true;
                        break;
                    case 'hardDrop':
                        game.hardDrop();
                        actionTaken = true;
                        break;
                }
            }
        });

        if (actionTaken) {
            updateControls();
            drawGame();
        }
    }

    function startGame() {
        game = new Tetris();
        controlsMap = generateRandomControls();
        discoveredControls.clear();
        startButton.disabled = true;
        document.addEventListener('keydown', handleKeyPress);
        lastDropTime = performance.now();
        updateControls();
        gameLoop = requestAnimationFrame(update);
    }

    startButton.addEventListener('click', startGame);
});