/**
 * Base game adapter class that provides common functionality for all games
 */
class GameAdapter {
    /**
     * Create a new game adapter
     * @param {string} gameType - The type of game (e.g., "tic_tac_toe", "go_9x9")
     */
    constructor(gameType) {
        this.gameType = gameType;
    }
    
    /**
     * Process the game state and render the board
     * @param {Object} state - The game state from the server
     * @returns {string} HTML content for the board
     */
    renderBoard(state) {
        // Default implementation just renders the SVG
        return state.svg;
    }
    
    /**
     * Create interactive elements for making moves
     * @param {Object} actionPositions - The positions data for legal actions
     * @param {Function} onMoveSelected - Callback function when a move is selected
     */
    createActionOverlay(actionPositions, onMoveSelected) {
        const overlay = document.getElementById('action-overlay');
        overlay.innerHTML = '';
        
        // Get the game board dimensions
        const boardRect = document.getElementById('game-board').getBoundingClientRect();
        
        actionPositions.positions.forEach(position => {
            const spot = document.createElement('div');
            spot.className = 'action-spot';
            
            // Position the spot based on percentages
            spot.style.left = `${position.x_percent}%`;
            spot.style.top = `${position.y_percent}%`;
            
            // Add a data attribute for the action
            spot.dataset.action = position.action;
            
            // Add click event listener
            spot.addEventListener('click', () => {
                onMoveSelected(position.action);
            });
            
            overlay.appendChild(spot);
        });
    }
    
    /**
     * Update game-specific controls based on the current state
     * @param {Object} state - The game state from the server
     */
    updateControls(state) {
        // Get control elements
        const aiMoveBtn = document.getElementById('ai-move-btn');
        const passBtn = document.getElementById('pass-btn');
        
        // By default, show AI move button only when it's AI's turn
        aiMoveBtn.disabled = state.current_player === 0 || state.is_terminal;
        
        // Hide pass button by default
        passBtn.classList.add('hidden');
    }
    
    /**
     * Format the game result message
     * @param {Object} state - The game state from the server
     * @returns {string} Formatted game result message
     */
    formatGameResult(state) {
        if (!state.is_terminal) {
            return '';
        }
        
        const rewards = state.rewards;
        
        if (rewards[0] > 0) {
            return 'You won!';
        } else if (rewards[0] < 0) {
            return 'AI won!';
        } else {
            return 'Game ended in a draw.';
        }
    }
    
    /**
     * Format the game title for display
     * @returns {string} Formatted game title
     */
    getFormattedTitle() {
        return this.gameType
            .replace(/_/g, ' ')
            .replace(/\b\w/g, c => c.toUpperCase());
    }
    
    /**
     * Get translated player name based on current player index
     * @param {number} currentPlayer - The current player index (0 for human, 1 for AI)
     * @returns {string} Player name
     */
    getPlayerName(currentPlayer) {
        return currentPlayer === 0 ? 'Human' : 'AI';
    }
}
