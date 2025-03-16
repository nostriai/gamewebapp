/**
 * Game adapter for Go
 * Handles game-specific rendering and interactions
 */
class GoAdapter extends GameAdapter {
    /**
     * Create a new Go adapter
     * @param {string} boardSize - The size of the board ("9x9" or "19x19")
     */
    constructor(boardSize) {
        super(`go_${boardSize}`);
        this.boardSize = boardSize;
        this.size = parseInt(boardSize.split('x')[0]);
    }
    
    /**
     * Process the game state and render the board
     * @param {Object} state - The game state from the server
     * @returns {string} HTML content for the board
     */
    renderBoard(state) {
        // For Go, we can use the SVG from PGX
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
        
        // Get pass button and configure it if needed
        const passBtn = document.getElementById('pass-btn');
        let hasPassMove = false;
        
        actionPositions.positions.forEach(position => {
            // Handle pass move
            if (position.is_pass) {
                hasPassMove = true;
                passBtn.classList.remove('hidden');
                passBtn.onclick = () => onMoveSelected(position.action);
                return;
            }
            
            // Create spot for regular move
            const spot = document.createElement('div');
            spot.className = 'action-spot';
            
            // Position the spot based on percentages
            spot.style.left = `${position.x_percent}%`;
            spot.style.top = `${position.y_percent}%`;
            
            // Add click event listener
            spot.addEventListener('click', () => {
                onMoveSelected(position.action);
            });
            
            overlay.appendChild(spot);
        });
        
        // Hide pass button if no pass move available
        if (!hasPassMove) {
            passBtn.classList.add('hidden');
        }
    }
    
    /**
     * Update game-specific controls based on the current state
     * @param {Object} state - The game state from the server
     */
    updateControls(state) {
        // Get control elements
        const aiMoveBtn = document.getElementById('ai-move-btn');
        
        // Show AI move button only when it's AI's turn
        aiMoveBtn.disabled = state.current_player === 0 || state.is_terminal;
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
            return 'You won! You captured more territory.';
        } else if (rewards[0] < 0) {
            return 'AI won by capturing more territory.';
        } else {
            return 'Game ended in a draw.';
        }
    }
    
    /**
     * Get a more user-friendly display name for the game
     * @returns {string} Formatted game title
     */
    getFormattedTitle() {
        return `Go (${this.boardSize})`;
    }
}

// Create specific adapters for different board sizes
class Go9x9Adapter extends GoAdapter {
    constructor() {
        super('9x9');
    }
}

class Go19x19Adapter extends GoAdapter {
    constructor() {
        super('19x19');
    }
}
