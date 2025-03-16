/**
 * Game adapter for Tic-tac-toe
 * Handles game-specific rendering and interactions
 */
class TicTacToeAdapter extends GameAdapter {
    /**
     * Create a new Tic-tac-toe adapter
     */
    constructor() {
        super('tic_tac_toe');
    }
    
    /**
     * Process the game state and render the board
     * @param {Object} state - The game state from the server
     * @returns {string} HTML content for the board
     */
    renderBoard(state) {
        // For Tic-tac-toe, we can just use the SVG from PGX
        return state.svg;
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
            return 'You won! Three in a row!';
        } else if (rewards[0] < 0) {
            return 'AI won with three in a row.';
        } else {
            return 'Game ended in a draw. Board is full.';
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
}
