/**
 * API module for communicating with the PGX backend server
 */
class PgxApi {
    constructor(baseUrl = '/api') {
        this.baseUrl = baseUrl;
    }
    
    /**
     * Get the list of available games
     * @returns {Promise<Object>} Object containing the list of available games
     */
    async getAvailableGames() {
        try {
            const response = await fetch(`${this.baseUrl}/available-games`);
            if (!response.ok) {
                throw new Error(`Failed to fetch available games: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching available games:', error);
            throw error;
        }
    }
    
    /**
     * Create a new game session
     * @param {string} gameType - The type of game to create (e.g., "tic_tac_toe", "go_9x9")
     * @param {string} aiDifficulty - The AI difficulty level (easy, medium, hard)
     * @returns {Promise<Object>} Object containing the game session ID and initial state
     */
    async createGame(gameType, aiDifficulty = 'medium') {
        try {
            const response = await fetch(`${this.baseUrl}/games`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ game_type: gameType, ai_difficulty: aiDifficulty })
            });
            
            if (!response.ok) {
                throw new Error(`Failed to create game: ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error creating game:', error);
            throw error;
        }
    }
    
    /**
     * Get the current state of a game
     * @param {string} gameId - The game session ID
     * @returns {Promise<Object>} Object containing the game state
     */
    async getGameState(gameId) {
        try {
            const response = await fetch(`${this.baseUrl}/games/${gameId}`);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch game state: ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching game state:', error);
            throw error;
        }
    }
    
    /**
     * Make a move in the game
     * @param {string} gameId - The game session ID
     * @param {number} action - The action index to perform
     * @returns {Promise<Object>} Object containing the updated game state
     */
    async makeMove(gameId, action) {
        try {
            const response = await fetch(`${this.baseUrl}/games/${gameId}/move`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ action })
            });
            
            if (!response.ok) {
                throw new Error(`Failed to make move: ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error making move:', error);
            throw error;
        }
    }
    
    /**
     * Request the AI to make a move
     * @param {string} gameId - The game session ID
     * @returns {Promise<Object>} Object containing the updated game state after AI's move
     */
    async makeAiMove(gameId) {
        try {
            const response = await fetch(`${this.baseUrl}/games/${gameId}/ai-move`);
            
            if (!response.ok) {
                throw new Error(`Failed to make AI move: ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error making AI move:', error);
            throw error;
        }
    }
    
    /**
     * Get the positions of legal actions for the current game state
     * @param {string} gameId - The game session ID
     * @returns {Promise<Object>} Object containing action positions
     */
    async getActionPositions(gameId) {
        try {
            const response = await fetch(`${this.baseUrl}/games/${gameId}/action-positions`);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch action positions: ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching action positions:', error);
            throw error;
        }
    }
}

// Create a global API instance
const api = new PgxApi();
