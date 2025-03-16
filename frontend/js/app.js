/**
 * Main application module
 * Coordinates game initialization, state management, and user interactions
 */
class GameApp {
    constructor() {
        this.currentGameId = null;
        this.currentGameType = null;
        this.currentGameState = null;
        this.gameAdapter = null;
        
        // Initialize event listeners
        this.initEventListeners();
        
        // Load available games on startup
        this.loadAvailableGames();
    }
    
    /**
     * Initialize event listeners for UI elements
     */
    initEventListeners() {
        // Game control buttons
        ui.aiMoveBtn.addEventListener('click', () => this.makeAiMove());
        ui.newGameBtn.addEventListener('click', () => this.startNewGame());
        ui.backBtn.addEventListener('click', () => this.showGameSelector());
        
        // Game over dialog buttons
        ui.playAgainBtn.addEventListener('click', () => {
            ui.hideGameOverDialog();
            this.startNewGame();
        });
        
        ui.selectGameBtn.addEventListener('click', () => {
            ui.hideGameOverDialog();
            this.showGameSelector();
        });
    }
    
    /**
     * Load the list of available games from the server
     */
    async loadAvailableGames() {
        try {
            const data = await api.getAvailableGames();
            if (data.games && data.games.length > 0) {
                ui.renderGameList(data.games, (gameType) => this.selectGame(gameType));
            } else {
                ui.showError('No games available');
            }
        } catch (error) {
            ui.showError('Failed to load available games');
            console.error(error);
        }
    }
    
    /**
     * Handle game selection
     * @param {string} gameType - The selected game type
     */
    selectGame(gameType) {
        this.currentGameType = gameType;
        
        // Create the appropriate game adapter
        if (gameType === 'tic_tac_toe') {
            this.gameAdapter = new TicTacToeAdapter();
        } else if (gameType === 'go_9x9') {
            this.gameAdapter = new Go9x9Adapter();
        } else if (gameType === 'go_19x19') {
            this.gameAdapter = new Go19x19Adapter();
        } else {
            ui.showError('Unsupported game type');
            return;
        }
        
        // Start the game
        this.startNewGame();
    }
    
    /**
     * Start a new game with the current game type
     */
    async startNewGame() {
        if (!this.currentGameType) {
            ui.showError('No game selected');
            return;
        }
        
        try {
            const difficulty = ui.getSelectedDifficulty();
            const data = await api.createGame(this.currentGameType, difficulty);
            
            if (data.id && data.state) {
                this.currentGameId = data.id;
                this.currentGameState = data.state;
                
                ui.showGameBoard();
                this.updateGameDisplay();
                
                // If human goes first, fetch action positions
                if (this.currentGameState.current_player === 0) {
                    this.loadActionPositions();
                }
            } else {
                ui.showError('Failed to start game');
            }
        } catch (error) {
            ui.showError('Failed to start game');
            console.error(error);
        }
    }
    
    /**
     * Show the game selector screen
     */
    showGameSelector() {
        this.currentGameId = null;
        this.currentGameState = null;
        ui.showGameSelector();
    }
    
    /**
     * Update the game display with the current state
     */
    updateGameDisplay() {
        if (!this.currentGameState || !this.gameAdapter) return;
        
        ui.updateGameBoard(this.currentGameState, this.gameAdapter);
        
        // Load action positions if it's human's turn
        if (this.currentGameState.current_player === 0 && !this.currentGameState.is_terminal) {
            this.loadActionPositions();
        }
    }
    
    /**
     * Load the legal action positions for the current game state
     */
    async loadActionPositions() {
        if (!this.currentGameId) return;
        
        try {
            const actionPositions = await api.getActionPositions(this.currentGameId);
            this.gameAdapter.createActionOverlay(
                actionPositions, 
                (action) => this.makeMove(action)
            );
        } catch (error) {
            console.error('Failed to load action positions:', error);
        }
    }
    
    /**
     * Make a move in the current game
     * @param {number} action - The action index to perform
     */
    async makeMove(action) {
        if (!this.currentGameId) return;
        
        try {
            const data = await api.makeMove(this.currentGameId, action);
            this.currentGameState = data.state;
            this.updateGameDisplay();
            
            // If it's AI's turn and game is not over, automatically make AI move
            if (this.currentGameState.current_player === 1 && !this.currentGameState.is_terminal) {
                // Small delay to show the human move before AI responds
                setTimeout(() => this.makeAiMove(), 500);
            }
        } catch (error) {
            ui.showError('Invalid move');
            console.error(error);
        }
    }
    
    /**
     * Request the AI to make a move
     */
    async makeAiMove() {
        if (!this.currentGameId) return;
        
        if (this.currentGameState.current_player !== 1 || this.currentGameState.is_terminal) {
            return;
        }
        
        try {
            ui.gameStatusElem.textContent = 'AI is thinking...';
            
            const data = await api.makeAiMove(this.currentGameId);
            this.currentGameState = data.state;
            this.updateGameDisplay();
        } catch (error) {
            ui.showError('Failed to make AI move');
            console.error(error);
        }
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.gameApp = new GameApp();
});
