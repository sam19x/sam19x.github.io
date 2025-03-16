class Tetris {
    constructor(width = 10, height = 20) {
        this.width = width;
        this.height = height;
        this.grid = Array(height).fill().map(() => Array(width).fill(0));
        this.score = 0;
        this.gameOver = false;
        this.speedLevel = 1;

        // Define tetromino shapes and colors
        this.shapes = {
            'I': [[1, 1, 1, 1]], // Cyan
            'O': [[1, 1], [1, 1]], // Yellow
            'T': [[0, 1, 0], [1, 1, 1]], // Purple
            'S': [[0, 1, 1], [1, 1, 0]], // Green
            'Z': [[1, 1, 0], [0, 1, 1]], // Red
            'J': [[1, 0, 0], [1, 1, 1]], // Blue
            'L': [[0, 0, 1], [1, 1, 1]]  // Orange
        };

        this.colors = {
            'I': '#00f0f0',
            'O': '#f0f000',
            'T': '#a000f0',
            'S': '#00f000',
            'Z': '#f00000',
            'J': '#0000f0',
            'L': '#f0a000'
        };

        this.currentPiece = null;
        this.nextPiece = this.generatePiece();
    }

    generatePiece() {
        const pieces = Object.keys(this.shapes);
        const type = pieces[Math.floor(Math.random() * pieces.length)];
        const shape = this.shapes[type];
        return {
            type,
            shape: JSON.parse(JSON.stringify(shape)),
            x: Math.floor((this.width - shape[0].length) / 2),
            y: 0
        };
    }

    rotate(piece) {
        const newShape = Array(piece.shape[0].length).fill()
            .map(() => Array(piece.shape.length).fill(0));

        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                newShape[x][piece.shape.length - 1 - y] = piece.shape[y][x];
            }
        }

        const rotated = {
            ...piece,
            shape: newShape
        };

        return this.isValidMove(rotated) ? rotated : piece;
    }

    isValidMove(piece) {
        return piece.shape.every((row, dy) =>
            row.every((value, dx) =>
                value === 0 ||
                (piece.x + dx >= 0 &&
                 piece.x + dx < this.width &&
                 piece.y + dy < this.height &&
                 !this.grid[piece.y + dy]?.[piece.x + dx])
            )
        );
    }

    movePiece(dx, dy) {
        const newPiece = {
            ...this.currentPiece,
            x: this.currentPiece.x + dx,
            y: this.currentPiece.y + dy
        };

        if (this.isValidMove(newPiece)) {
            this.currentPiece = newPiece;
            return true;
        }
        return false;
    }

    mergePiece() {
        this.currentPiece.shape.forEach((row, dy) => {
            row.forEach((value, dx) => {
                if (value) {
                    const y = this.currentPiece.y + dy;
                    const x = this.currentPiece.x + dx;
                    if (y >= 0 && y < this.height) {
                        this.grid[y][x] = this.currentPiece.type;
                    }
                }
            });
        });
        // Add points for successfully placing a piece
        this.score += 10;
    }

    clearLines() {
        let linesCleared = 0;
        for (let y = this.height - 1; y >= 0; y--) {
            if (this.grid[y].every(cell => cell !== 0)) {
                this.grid.splice(y, 1);
                this.grid.unshift(Array(this.width).fill(0));
                linesCleared++;
                y++; // Check the same row again since we moved lines down
            }
        }
        // Updated scoring system
        if (linesCleared > 0) {
            // Score more points for clearing multiple lines at once
            const linePoints = [0, 100, 300, 500, 800];
            this.score += linePoints[linesCleared];

            // Increase speed level more frequently - every 3 lines cleared
            if (Math.floor(this.score / 300) > (this.speedLevel - 1)) {
                this.speedLevel++;
            }
        }
    }

    spawnPiece() {
        this.currentPiece = this.nextPiece;
        this.nextPiece = this.generatePiece();

        if (!this.isValidMove(this.currentPiece)) {
            this.gameOver = true;
        }
    }

    tick() {
        if (this.gameOver) return;

        if (!this.currentPiece) {
            this.spawnPiece();
            return;
        }

        if (!this.movePiece(0, 1)) {
            this.mergePiece();
            this.clearLines();
            this.spawnPiece();
        }
    }

    hardDrop() {
        while (this.movePiece(0, 1)) {}
        this.tick();
    }
}