import uuid
import jax
import pgx
from typing import Dict, Any, Optional, List
import time

class GameSession:
    def __init__(self, game_type: str, ai_difficulty: str = "medium"):
        self.id = str(uuid.uuid4())
        self.game_type = game_type
        self.created_at = time.time()
        self.ai_difficulty = ai_difficulty
        
        # Initialize the game environment
        self.env = pgx.make(game_type)
        # Initialize with a random key
        self.state = self.env.init(jax.random.PRNGKey(int(time.time())))
        self.history = []
        
        # Save the initial state
        self._save_state()
    
    def _create_ai_player(self):
        """Create an appropriate AI player based on game type and difficulty"""
        # For now, we'll just use a random player
        return None
    
    def _save_state(self):
        """Save the current state to history"""
        self.history.append(self.get_state())
    
    def get_state(self) -> Dict[str, Any]:
        """Get the current state in a serializable format"""
        return {
            "svg": self.state.to_svg(),
            "current_player": int(self.state.current_player),
            "is_terminal": bool(self.state.terminated),
            "legal_actions": self.state.legal_action_mask.nonzero()[0].tolist(),
            "rewards": self.state.rewards.tolist(),
            "step_count": int(self.state._step_count),
            "game_type": self.game_type
        }
    
    def apply_move(self, action: int) -> bool:
        """Apply a human player move"""
        if self.state.terminated:
            return False
        
        if not self.state.legal_action_mask[action]:
            return False
            
        self.state = self.env.step(self.state, action)
        self._save_state()
        return True
    
    def apply_ai_move(self) -> bool:
        """Apply an AI move"""
        if self.state.terminated:
            return False
        
        if int(self.state.current_player) != 1:  # AI is always player 1
            return False
        
        # Get random legal action for now
        legal_actions = self.state.legal_action_mask.nonzero()[0]
        if len(legal_actions) == 0:
            return False
            
        # Generate a new random key
        key = jax.random.PRNGKey(int(time.time() * 1000))
        action = int(jax.random.choice(key, legal_actions))
        
        # Apply the action
        return self.apply_move(action)
    
    def get_action_positions(self) -> Dict[str, Any]:
        """Map legal actions to visual positions on the board"""
        legal_actions = self.state.legal_action_mask.nonzero()[0].tolist()
        
        if self.game_type == "tic_tac_toe":
            positions = []
            for action in legal_actions:
                row = action // 3
                col = action % 3
                
                # Convert to percentage coordinates
                x_percent = (col + 0.5) / 3 * 100
                y_percent = (row + 0.5) / 3 * 100
                
                positions.append({
                    "action": int(action),
                    "x_percent": float(x_percent),
                    "y_percent": float(y_percent),
                    "row": int(row),
                    "col": int(col)
                })
            
        elif self.game_type.startswith("go"):
            size = int(self.game_type.split("_")[1].split("x")[0])
            positions = []
            
            for action in legal_actions:
                # Check if it's a pass move
                if action == size * size:
                    positions.append({
                        "action": int(action),
                        "is_pass": True,
                        "x_percent": 50.0,  # Center of board
                        "y_percent": -10.0,  # Above the board
                    })
                    continue
                
                row = action // size
                col = action % size
                
                # Map to 0-100% coordinates with margins
                margin = 5  # 5% margin
                usable_space = 100 - 2 * margin
                
                x_percent = margin + (col / (size - 1)) * usable_space
                y_percent = margin + (row / (size - 1)) * usable_space
                
                positions.append({
                    "action": int(action),
                    "is_pass": False,
                    "x_percent": float(x_percent),
                    "y_percent": float(y_percent),
                    "row": int(row),
                    "col": int(col)
                })
        else:
            # Default mapping (empty for unhandled games)
            positions = []
        
        return {
            "positions": positions,
            "game_type": self.game_type
        }


class GameSessionManager:
    def __init__(self):
        self.sessions: Dict[str, GameSession] = {}
    
    def create_session(self, game_type: str, ai_difficulty: str = "medium") -> GameSession:
        """Create a new game session"""
        if game_type not in ["tic_tac_toe", "go_9x9", "go_19x19"]:
            raise ValueError(f"Unsupported game type: {game_type}")
        
        session = GameSession(game_type, ai_difficulty)
        self.sessions[session.id] = session
        return session
    
    def get_session(self, session_id: str) -> Optional[GameSession]:
        """Get a game session by ID"""
        return self.sessions.get(session_id)
    
    def cleanup_old_sessions(self, max_age_hours: float = 24.0):
        """Remove sessions older than max_age_hours"""
        current_time = time.time()
        session_ids_to_remove = []
        
        for session_id, session in self.sessions.items():
            age_hours = (current_time - session.created_at) / 3600
            if age_hours > max_age_hours:
                session_ids_to_remove.append(session_id)
        
        for session_id in session_ids_to_remove:
            del self.sessions[session_id]
