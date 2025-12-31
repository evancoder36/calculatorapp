// Block Blast Game - Evan Calculator

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

        this.init();
    }

    init() {
        this.createGrid();
        this.generateNewPieces();
        this.updateScoreDisplay();
        this.bindEvents();
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

        if (rowsToClear.length === 0 && colsToClear.length === 0) return;

        // Calculate bonus score
        const linesCleared = rowsToClear.length + colsToClear.length;
        const bonus = linesCleared * linesCleared * 10;
        this.score += bonus + (linesCleared * this.gridSize);

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
        const gameOverEl = document.getElementById('bbGameOver');
        const finalScoreEl = document.getElementById('bbFinalScore');

        if (finalScoreEl) finalScoreEl.textContent = this.score;
        if (gameOverEl) gameOverEl.style.display = 'flex';
    }

    restart() {
        this.score = 0;
        this.pieces = [null, null, null];
        this.colorIndex = 0;

        // Hide game over screen
        const gameOverEl = document.getElementById('bbGameOver');
        if (gameOverEl) gameOverEl.style.display = 'none';

        // Reset grid
        this.createGrid();
        this.generateNewPieces();
        this.updateScoreDisplay();
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
