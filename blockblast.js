// Block Blast Game - Evan Calculator (Enhanced Version)

class BlockBlastGame {
    constructor() {
        this.gridSize = 8;
        this.grid = [];
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('evan_bb_highscore')) || 0;
        this.pieces = [null, null, null];
        this.selectedPiece = null;
        this.selectedPieceIndex = -1;
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        this.colorIndex = 0;
        this.combo = 0;
        this.level = 1;
        this.fallInterval = null;
        this.fallSpeed = 8000; // Start with 8 seconds between falls
        this.isGameOver = false;

        // Combo messages
        this.comboMessages = [
            { min: 1, text: 'Good!', color: '#10b981' },
            { min: 2, text: 'Great!', color: '#3b82f6' },
            { min: 3, text: 'Excellent!', color: '#8b5cf6' },
            { min: 4, text: 'Amazing!', color: '#ec4899' },
            { min: 5, text: 'INCREDIBLE!', color: '#f59e0b' },
            { min: 6, text: 'UNSTOPPABLE!', color: '#ef4444' }
        ];

        // All possible tetromino-like shapes
        this.shapes = [
            // Single
            [[1]],
            // Line 2
            [[1, 1]],
            [[1], [1]],
            // Line 3
            [[1, 1, 1]],
            [[1], [1], [1]],
            // Line 4
            [[1, 1, 1, 1]],
            [[1], [1], [1], [1]],
            // Line 5
            [[1, 1, 1, 1, 1]],
            [[1], [1], [1], [1], [1]],
            // Square 2x2
            [[1, 1], [1, 1]],
            // Square 3x3
            [[1, 1, 1], [1, 1, 1], [1, 1, 1]],
            // L shapes
            [[1, 0], [1, 0], [1, 1]],
            [[1, 1, 1], [1, 0, 0]],
            [[1, 1], [0, 1], [0, 1]],
            [[0, 0, 1], [1, 1, 1]],
            // J shapes
            [[0, 1], [0, 1], [1, 1]],
            [[1, 0, 0], [1, 1, 1]],
            [[1, 1], [1, 0], [1, 0]],
            [[1, 1, 1], [0, 0, 1]],
            // T shapes
            [[1, 1, 1], [0, 1, 0]],
            [[1, 0], [1, 1], [1, 0]],
            [[0, 1, 0], [1, 1, 1]],
            [[0, 1], [1, 1], [0, 1]],
            // S shapes
            [[0, 1, 1], [1, 1, 0]],
            [[1, 0], [1, 1], [0, 1]],
            // Z shapes
            [[1, 1, 0], [0, 1, 1]],
            [[0, 1], [1, 1], [1, 0]],
            // Corner shapes
            [[1, 1], [1, 0]],
            [[1, 1], [0, 1]],
            [[1, 0], [1, 1]],
            [[0, 1], [1, 1]],
            // Big L
            [[1, 0, 0], [1, 0, 0], [1, 1, 1]],
            [[1, 1, 1], [0, 0, 1], [0, 0, 1]],
            [[1, 1, 1], [1, 0, 0], [1, 0, 0]],
            [[0, 0, 1], [0, 0, 1], [1, 1, 1]],
        ];

        // Falling block shapes (simpler shapes for falling)
        this.fallingShapes = [
            [[1]],
            [[1, 1]],
            [[1], [1]],
            [[1, 1, 1]],
            [[1, 1], [1, 0]],
            [[1, 1], [0, 1]],
        ];

        this.init();
    }

    init() {
        this.createGrid();
        this.addInitialBlocks();
        this.generateNewPieces();
        this.updateScoreDisplay();
        this.bindEvents();
        this.startFallingBlocks();
    }

    createGrid() {
        const gridEl = document.getElementById('bbGrid');
        if (!gridEl) return;

        gridEl.innerHTML = '';
        this.grid = [];

        for (let row = 0; row < this.gridSize; row++) {
            this.grid[row] = [];
            for (let col = 0; col < this.gridSize; col++) {
                const cell = document.createElement('div');
                cell.className = 'bb-cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                gridEl.appendChild(cell);
                this.grid[row][col] = { filled: false, color: 0 };
            }
        }
    }

    addInitialBlocks() {
        // Add random blocks to the bottom 3 rows to make it challenging
        const numInitialBlocks = 8 + Math.floor(Math.random() * 8); // 8-15 blocks

        for (let i = 0; i < numInitialBlocks; i++) {
            const row = this.gridSize - 1 - Math.floor(Math.random() * 3); // Bottom 3 rows
            const col = Math.floor(Math.random() * this.gridSize);
            const color = Math.floor(Math.random() * 5) + 1;

            if (!this.grid[row][col].filled) {
                this.grid[row][col] = { filled: true, color };
                const cell = document.querySelector(`.bb-cell[data-row="${row}"][data-col="${col}"]`);
                if (cell) {
                    cell.classList.add('filled', `color-${color}`);
                }
            }
        }
    }

    startFallingBlocks() {
        if (this.fallInterval) {
            clearInterval(this.fallInterval);
        }

        this.fallInterval = setInterval(() => {
            if (!this.isGameOver) {
                this.addFallingBlock();
            }
        }, this.fallSpeed);
    }

    addFallingBlock() {
        // Pick a random column and add a block from the top
        const shape = this.fallingShapes[Math.floor(Math.random() * this.fallingShapes.length)];
        const color = Math.floor(Math.random() * 5) + 1;
        const shapeWidth = shape[0].length;
        const startCol = Math.floor(Math.random() * (this.gridSize - shapeWidth + 1));

        // Find the lowest available position for this shape
        let targetRow = -1;

        for (let row = 0; row <= this.gridSize - shape.length; row++) {
            let canPlace = true;
            for (let r = 0; r < shape.length; r++) {
                for (let c = 0; c < shape[r].length; c++) {
                    if (shape[r][c]) {
                        if (this.grid[row + r][startCol + c].filled) {
                            canPlace = false;
                            break;
                        }
                    }
                }
                if (!canPlace) break;
            }
            if (canPlace) {
                targetRow = row;
            } else {
                break;
            }
        }

        if (targetRow === -1) {
            // Can't place block at top - game over
            this.gameOver();
            return;
        }

        // Animate the block falling
        this.animateFallingBlock(shape, startCol, targetRow, color);
    }

    animateFallingBlock(shape, startCol, targetRow, color) {
        let currentRow = 0;

        const fall = () => {
            // Clear previous position
            if (currentRow > 0) {
                for (let r = 0; r < shape.length; r++) {
                    for (let c = 0; c < shape[r].length; c++) {
                        if (shape[r][c]) {
                            const prevRow = currentRow - 1 + r;
                            if (prevRow >= 0 && prevRow < this.gridSize) {
                                const cell = document.querySelector(`.bb-cell[data-row="${prevRow}"][data-col="${startCol + c}"]`);
                                if (cell && !this.grid[prevRow][startCol + c].filled) {
                                    cell.classList.remove('falling', `color-${color}`);
                                }
                            }
                        }
                    }
                }
            }

            if (currentRow <= targetRow) {
                // Show at current position
                for (let r = 0; r < shape.length; r++) {
                    for (let c = 0; c < shape[r].length; c++) {
                        if (shape[r][c]) {
                            const row = currentRow + r;
                            if (row >= 0 && row < this.gridSize) {
                                const cell = document.querySelector(`.bb-cell[data-row="${row}"][data-col="${startCol + c}"]`);
                                if (cell) {
                                    cell.classList.add('falling', `color-${color}`);
                                }
                            }
                        }
                    }
                }
                currentRow++;
                setTimeout(fall, 80);
            } else {
                // Place the block permanently
                for (let r = 0; r < shape.length; r++) {
                    for (let c = 0; c < shape[r].length; c++) {
                        if (shape[r][c]) {
                            const row = targetRow + r;
                            this.grid[row][startCol + c] = { filled: true, color };
                            const cell = document.querySelector(`.bb-cell[data-row="${row}"][data-col="${startCol + c}"]`);
                            if (cell) {
                                cell.classList.remove('falling');
                                cell.classList.add('filled', `color-${color}`);
                            }
                        }
                    }
                }

                // Check for line clears
                this.checkAndClearLines();

                // Check if game over
                if (!this.canPlaceAnyPiece()) {
                    this.gameOver();
                }

                // Increase difficulty over time
                this.increaseDifficulty();
            }
        };

        fall();
    }

    increaseDifficulty() {
        // Speed up falling blocks as score increases
        const newLevel = Math.floor(this.score / 100) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
            this.fallSpeed = Math.max(3000, 8000 - (this.level * 500)); // Min 3 seconds
            this.startFallingBlocks();
            this.showComboMessage(`Level ${this.level}!`, '#6366f1');
        }
    }

    generateNewPieces() {
        for (let i = 0; i < 3; i++) {
            if (this.pieces[i] === null) {
                this.pieces[i] = this.generateRandomPiece();
            }
        }
        this.renderPieces();

        // Check if game is over
        if (!this.canPlaceAnyPiece()) {
            this.gameOver();
        }
    }

    generateRandomPiece() {
        const shape = this.shapes[Math.floor(Math.random() * this.shapes.length)];
        const color = (this.colorIndex++ % 5) + 1;
        return { shape, color };
    }

    renderPieces() {
        for (let i = 0; i < 3; i++) {
            const slot = document.getElementById(`pieceSlot${i}`);
            if (!slot) continue;

            slot.innerHTML = '';

            if (this.pieces[i] === null) {
                slot.classList.add('empty');
                continue;
            }

            slot.classList.remove('empty');
            const piece = this.pieces[i];
            const pieceEl = document.createElement('div');
            pieceEl.className = 'draggable-piece';
            pieceEl.dataset.index = i;

            const rows = piece.shape.length;
            const cols = piece.shape[0].length;
            pieceEl.style.gridTemplateColumns = `repeat(${cols}, 20px)`;

            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const cell = document.createElement('div');
                    cell.className = piece.shape[r][c] ? `piece-cell filled color-${piece.color}` : 'piece-cell empty';
                    pieceEl.appendChild(cell);
                }
            }

            slot.appendChild(pieceEl);
        }
    }

    bindEvents() {
        // Mouse events
        document.addEventListener('mousedown', (e) => this.handleDragStart(e));
        document.addEventListener('mousemove', (e) => this.handleDragMove(e));
        document.addEventListener('mouseup', (e) => this.handleDragEnd(e));

        // Touch events
        document.addEventListener('touchstart', (e) => this.handleDragStart(e), { passive: false });
        document.addEventListener('touchmove', (e) => this.handleDragMove(e), { passive: false });
        document.addEventListener('touchend', (e) => this.handleDragEnd(e));

        // Restart button
        document.getElementById('bbRestartBtn')?.addEventListener('click', () => this.restart());
        document.getElementById('bbPlayAgainBtn')?.addEventListener('click', () => this.restart());
    }

    handleDragStart(e) {
        if (this.isGameOver) return;

        const target = e.target.closest('.draggable-piece');
        if (!target) return;

        e.preventDefault();

        const index = parseInt(target.dataset.index);
        if (this.pieces[index] === null) return;

        this.selectedPiece = this.pieces[index];
        this.selectedPieceIndex = index;
        this.isDragging = true;

        const rect = target.getBoundingClientRect();
        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;

        this.dragOffset = {
            x: clientX - rect.left,
            y: clientY - rect.top
        };

        target.classList.add('dragging');
        target.style.left = `${clientX - this.dragOffset.x}px`;
        target.style.top = `${clientY - this.dragOffset.y}px`;
    }

    handleDragMove(e) {
        if (!this.isDragging || !this.selectedPiece) return;

        e.preventDefault();

        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;

        const pieceEl = document.querySelector('.draggable-piece.dragging');
        if (pieceEl) {
            pieceEl.style.left = `${clientX - this.dragOffset.x}px`;
            pieceEl.style.top = `${clientY - this.dragOffset.y}px`;
        }

        // Update preview
        this.clearPreview();
        const gridPos = this.getGridPosition(clientX, clientY);
        if (gridPos) {
            this.showPreview(gridPos.row, gridPos.col);
        }
    }

    handleDragEnd(e) {
        if (!this.isDragging || !this.selectedPiece) return;

        const pieceEl = document.querySelector('.draggable-piece.dragging');
        if (pieceEl) {
            pieceEl.classList.remove('dragging');
            pieceEl.style.left = '';
            pieceEl.style.top = '';
        }

        const clientX = e.clientX || (e.changedTouches && e.changedTouches[0].clientX);
        const clientY = e.clientY || (e.changedTouches && e.changedTouches[0].clientY);

        this.clearPreview();

        if (clientX && clientY) {
            const gridPos = this.getGridPosition(clientX, clientY);
            if (gridPos && this.canPlacePiece(this.selectedPiece.shape, gridPos.row, gridPos.col)) {
                this.placePiece(gridPos.row, gridPos.col);
            }
        }

        this.isDragging = false;
        this.selectedPiece = null;
        this.selectedPieceIndex = -1;
    }

    getGridPosition(clientX, clientY) {
        const gridEl = document.getElementById('bbGrid');
        if (!gridEl) return null;

        const rect = gridEl.getBoundingClientRect();
        const padding = 8;
        const gap = 3;
        const cellSize = (rect.width - padding * 2 - gap * 7) / 8;

        // Offset to center the piece under the cursor
        const pieceShape = this.selectedPiece.shape;
        const offsetX = Math.floor(pieceShape[0].length / 2) * (cellSize + gap);
        const offsetY = Math.floor(pieceShape.length / 2) * (cellSize + gap);

        const x = clientX - rect.left - padding - offsetX;
        const y = clientY - rect.top - padding - offsetY;

        const col = Math.round(x / (cellSize + gap));
        const row = Math.round(y / (cellSize + gap));

        if (row >= 0 && row < this.gridSize && col >= 0 && col < this.gridSize) {
            return { row, col };
        }
        return null;
    }

    canPlacePiece(shape, startRow, startCol) {
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (shape[r][c]) {
                    const row = startRow + r;
                    const col = startCol + c;
                    if (row < 0 || row >= this.gridSize || col < 0 || col >= this.gridSize) {
                        return false;
                    }
                    if (this.grid[row][col].filled) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    showPreview(startRow, startCol) {
        const shape = this.selectedPiece.shape;
        const canPlace = this.canPlacePiece(shape, startRow, startCol);

        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (shape[r][c]) {
                    const row = startRow + r;
                    const col = startCol + c;
                    if (row >= 0 && row < this.gridSize && col >= 0 && col < this.gridSize) {
                        const cell = document.querySelector(`.bb-cell[data-row="${row}"][data-col="${col}"]`);
                        if (cell && !this.grid[row][col].filled) {
                            cell.classList.add(canPlace ? 'preview' : 'preview-invalid');
                        }
                    }
                }
            }
        }
    }

    clearPreview() {
        document.querySelectorAll('.bb-cell.preview, .bb-cell.preview-invalid').forEach(cell => {
            cell.classList.remove('preview', 'preview-invalid');
        });
    }

    placePiece(startRow, startCol) {
        const piece = this.selectedPiece;
        const shape = piece.shape;
        let cellsPlaced = 0;

        // Place the piece
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (shape[r][c]) {
                    const row = startRow + r;
                    const col = startCol + c;
                    this.grid[row][col] = { filled: true, color: piece.color };
                    const cell = document.querySelector(`.bb-cell[data-row="${row}"][data-col="${col}"]`);
                    if (cell) {
                        cell.classList.add('filled', `color-${piece.color}`);
                    }
                    cellsPlaced++;
                }
            }
        }

        // Add score for placing piece
        this.score += cellsPlaced;

        // Remove the used piece
        this.pieces[this.selectedPieceIndex] = null;
        this.renderPieces();

        // Check for line clears
        this.checkAndClearLines();

        // Generate new pieces if all are used
        if (this.pieces.every(p => p === null)) {
            setTimeout(() => {
                this.generateNewPieces();
            }, 300);
        } else {
            // Check for game over
            if (!this.canPlaceAnyPiece()) {
                this.gameOver();
            }
        }

        this.updateScoreDisplay();
    }

    checkAndClearLines() {
        const rowsToClear = [];
        const colsToClear = [];

        // Check rows
        for (let row = 0; row < this.gridSize; row++) {
            if (this.grid[row].every(cell => cell.filled)) {
                rowsToClear.push(row);
            }
        }

        // Check columns
        for (let col = 0; col < this.gridSize; col++) {
            let colFilled = true;
            for (let row = 0; row < this.gridSize; row++) {
                if (!this.grid[row][col].filled) {
                    colFilled = false;
                    break;
                }
            }
            if (colFilled) {
                colsToClear.push(col);
            }
        }

        if (rowsToClear.length === 0 && colsToClear.length === 0) {
            this.combo = 0; // Reset combo if no lines cleared
            return;
        }

        // Increment combo
        this.combo++;

        // Calculate bonus score with combo multiplier
        const linesCleared = rowsToClear.length + colsToClear.length;
        const baseScore = linesCleared * this.gridSize;
        const comboMultiplier = 1 + (this.combo * 0.5);
        const bonus = Math.floor((linesCleared * linesCleared * 10 + baseScore) * comboMultiplier);
        this.score += bonus;

        // Show combo message
        this.showComboFeedback(linesCleared);

        // Animate clearing
        const cellsToClear = new Set();

        rowsToClear.forEach(row => {
            for (let col = 0; col < this.gridSize; col++) {
                cellsToClear.add(`${row}-${col}`);
            }
        });

        colsToClear.forEach(col => {
            for (let row = 0; row < this.gridSize; row++) {
                cellsToClear.add(`${row}-${col}`);
            }
        });

        // Add clearing animation
        cellsToClear.forEach(key => {
            const [row, col] = key.split('-').map(Number);
            const cell = document.querySelector(`.bb-cell[data-row="${row}"][data-col="${col}"]`);
            if (cell) {
                cell.classList.add('clearing');
            }
        });

        // Clear cells after animation
        setTimeout(() => {
            cellsToClear.forEach(key => {
                const [row, col] = key.split('-').map(Number);
                this.grid[row][col] = { filled: false, color: 0 };
                const cell = document.querySelector(`.bb-cell[data-row="${row}"][data-col="${col}"]`);
                if (cell) {
                    cell.className = 'bb-cell';
                }
            });
            this.updateScoreDisplay();
        }, 300);

        this.updateScoreDisplay();
    }

    showComboFeedback(linesCleared) {
        // Find appropriate message based on combo
        let message = this.comboMessages[0];
        for (const msg of this.comboMessages) {
            if (this.combo >= msg.min) {
                message = msg;
            }
        }

        // Add lines cleared info for multiple clears
        let displayText = message.text;
        if (linesCleared > 1) {
            displayText = `${linesCleared}x ${message.text}`;
        }
        if (this.combo > 1) {
            displayText += ` x${this.combo}`;
        }

        this.showComboMessage(displayText, message.color);
    }

    showComboMessage(text, color) {
        // Remove existing message
        const existingMsg = document.querySelector('.combo-message');
        if (existingMsg) {
            existingMsg.remove();
        }

        // Create combo message element
        const msgEl = document.createElement('div');
        msgEl.className = 'combo-message';
        msgEl.textContent = text;
        msgEl.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0);
            font-size: 2rem;
            font-weight: 800;
            color: ${color};
            text-shadow: 0 0 20px ${color}, 0 4px 8px rgba(0,0,0,0.5);
            z-index: 50;
            pointer-events: none;
            animation: comboPopup 0.8s ease-out forwards;
        `;

        const gameArea = document.querySelector('.blockblast-game-area');
        if (gameArea) {
            gameArea.appendChild(msgEl);
            setTimeout(() => msgEl.remove(), 800);
        }
    }

    canPlaceAnyPiece() {
        for (const piece of this.pieces) {
            if (piece === null) continue;
            for (let row = 0; row < this.gridSize; row++) {
                for (let col = 0; col < this.gridSize; col++) {
                    if (this.canPlacePiece(piece.shape, row, col)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    updateScoreDisplay() {
        const scoreEl = document.getElementById('bbScore');
        const highScoreEl = document.getElementById('bbHighScore');

        if (scoreEl) scoreEl.textContent = this.score;
        if (highScoreEl) highScoreEl.textContent = this.highScore;

        // Update high score if needed
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('evan_bb_highscore', this.highScore);
            if (highScoreEl) highScoreEl.textContent = this.highScore;
        }
    }

    gameOver() {
        this.isGameOver = true;

        // Stop falling blocks
        if (this.fallInterval) {
            clearInterval(this.fallInterval);
            this.fallInterval = null;
        }

        const gameOverEl = document.getElementById('bbGameOver');
        const finalScoreEl = document.getElementById('bbFinalScore');

        if (finalScoreEl) finalScoreEl.textContent = this.score;
        if (gameOverEl) gameOverEl.style.display = 'flex';
    }

    restart() {
        this.score = 0;
        this.pieces = [null, null, null];
        this.colorIndex = 0;
        this.combo = 0;
        this.level = 1;
        this.fallSpeed = 8000;
        this.isGameOver = false;

        // Stop existing interval
        if (this.fallInterval) {
            clearInterval(this.fallInterval);
        }

        // Hide game over screen
        const gameOverEl = document.getElementById('bbGameOver');
        if (gameOverEl) gameOverEl.style.display = 'none';

        // Reset grid
        this.createGrid();
        this.addInitialBlocks();
        this.generateNewPieces();
        this.updateScoreDisplay();
        this.startFallingBlocks();
    }
}

// Initialize when DOM is ready and tab is clicked
document.addEventListener('DOMContentLoaded', () => {
    let gameInstance = null;

    // Initialize when the Block Blast tab is clicked
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.dataset.tab === 'blockblast' && !gameInstance) {
                // Small delay to ensure panel is visible
                setTimeout(() => {
                    gameInstance = new BlockBlastGame();
                    window.blockBlastGame = gameInstance;
                }, 100);
            }
        });
    });
});
