/**
 * UI module for handling the user interface components
 */
class UI {
    constructor() {
        // Game elements
        this.gameSelector = document.getElementById('game-selector');
        this.gameContainer = document.getElementById('game-container');
        this.gameList = document.getElementById('game-list');
        this.gameBoard = document.getElementById('game-board');
        this.actionOverlay = document.getElementById('action-overlay');
        this.gameTitle = document.getElementById('game-title');
        this.currentPlayerElem = document.getElementById('current-player');
        this.gameStatusElem = document.getElementById('game-status');
        
        // Controls
        this.aiMoveBtn = document.getElementById('ai-move-btn');
        this.passBtn = document.getElementById('pass-btn');
        this.newGameBtn = document.getElementById('new-game-btn');
        this.backBtn = document.getElementById('back-btn');
        
        // Dialog elements
        this.gameOverDialog = document.getElementById('game-over-dialog');
        this.gameResultElem = document.getElementById('game-result');
        this.playAgainBtn = document.getElementById('play-again-btn');
        this.selectGameBtn = document.getElementById('select-game-btn');
    }
    
    /**
     * Show the game selection screen
     */
    showGameSelector() {
        this.gameSelector.classList.remove('hidden');
        this.gameContainer.classList.add('hidden');
        this.hideGameOverDialog();
    }
    
    /**
     * Show the game board screen
     */
    showGameBoard() {
        this.gameSelector.classList.add('hidden');
        this.gameContainer.classList.remove('hidden');
    }
    
    /**
     * Render the list of available games
     * @param {Array} games - Array of available game types
     * @param {Function} onGameSelected - Callback function when a game is selected
     */
    renderGameList(games, onGameSelected) {
        this.gameList.innerHTML = '';
        
        const gameAdapters = {
            'tic_tac_toe': new TicTacToeAdapter(),
            'go_9x9': new Go9x9Adapter(),
            'go_19x19': new Go19x19Adapter()
        };
        
        games.forEach(gameType => {
            const adapter = gameAdapters[gameType];
            if (!adapter) return; // Skip unsupported games
            
            const card = document.createElement('div');
            card.className = 'game-card';
            
            // Get formatted title from adapter
            const title = adapter.getFormattedTitle();
            
            card.innerHTML = `
                <h3>${title}</h3>
                <p>Play against AI</p>
            `;
            
            card.addEventListener('click', () => {
                onGameSelected(gameType);
            });
            
            this.gameList.appendChild(card);
        });
    }
    
    /**
     * Get the selected AI difficulty level
     * @returns {string} The selected difficulty (easy, medium, hard)
     */
    getSelectedDifficulty() {
        const difficultyRadios = document.querySelectorAll('input[name="difficulty"]');
        let selectedDifficulty = 'medium';
        
        difficultyRadios.forEach(radio => {
            if (radio.checked) {
                selectedDifficulty = radio.value;
            }
        });
        
        return selectedDifficulty;
    }
    
    /**
     * Update the game board with the current state
     * @param {Object} state - The game state from the server
     * @param {GameAdapter} adapter - The game adapter for the current game
     */
    updateGameBoard(state, adapter) {
        // Set the game title
        this.gameTitle.textContent = adapter.getFormattedTitle();
        
        // Update the board with SVG content
        this.gameBoard.innerHTML = adapter.renderBoard(state);
        
        // Update player information
        this.currentPlayerElem.textContent = adapter.getPlayerName(state.current_player);
        
        // Update game status
        if (state.is_terminal) {
            this.gameStatusElem.textContent = 'Game Over';
            this.showGameOverDialog(adapter.formatGameResult(state));
        } else {
            this.gameStatusElem.textContent = state.current_player === 0 ? 'Your turn' : 'AI is thinking...';
        }
        
        // Update controls based on game state
        adapter.updateControls(state);
    }
    
    /**
     * Show the game over dialog with the result message
     * @param {string} resultMessage - The game result message
     */
    showGameOverDialog(resultMessage) {
        this.gameResultElem.textContent = resultMessage;
        this.gameOverDialog.classList.remove('hidden');
    }
    
    /**
     * Hide the game over dialog
     */
    hideGameOverDialog() {
        this.gameOverDialog.classList.add('hidden');
    }
    
    /**
     * Show an error message to the user
     * @param {string} message - The error message to display
     */
    showError(message) {
        alert(message);
    }
}

// Create a global UI instance
const ui = new UI();
