import jax
import jax.numpy as jnp
from functools import partial
import chex
from typing import Tuple, List, Optional
import numpy as np  # Keep regular numpy for some operations

import jax
import jax.numpy as jnp
from functools import partial
from jaxtyping import Array, Float, Bool, Int, jaxtyped
from typing import Tuple, List, Optional
import numpy as np  # Keep regular numpy for some operations

from dataclasses import dataclass
from pgx import core
import jax.numpy as jnp
from jaxtyping import Array

@dataclass
class State(core.State):
    """State representation for Checkers game."""
    current_player: Array = jnp.int4(0)
    rewards: Array = jnp.float32([0.0, 0.0])
    terminated: Array = jnp.bool_(False)
    truncated: Array = jnp.bool_(False)
    legal_action_mask: Array = jnp.zeros((8 * 64,), dtype=jnp.bool_)  # 8 move types * 64 positions
    observation: Array = jnp.zeros((15, 8, 8), dtype=jnp.float32)  # Full board state
    _step_count: Array = jnp.int32(0)
    _player_order: Array = jnp.int32([0, 1])

    @property
    def env_id(self) -> core.EnvId:
        return "checkers"

class Checkers:
    """JAX-compatible implementation of Checkers game."""
    def __init__(self):
        self.state: Float[Array, "15 8 8"] = jnp.zeros((15, 8, 8), dtype=jnp.float32)
        self.state = self.init_board(self.state)

    @partial(jax.jit, static_argnums=(0,))
    @jaxtyped
    def step(self, 
            state: Float[Array, "15 8 8"], 
            action: Int[Array, ""]) -> Tuple[Float[Array, "15 8 8"], float, bool]:
        """Execute a move and return (new_state, reward, done)."""
        # ... rest of the implementation ...

    @partial(jax.jit, static_argnums=(0,))
    @jaxtyped
    def legal_actions(self, 
                     state: Float[Array, "15 8 8"]) -> Bool[Array, "512"]:
        """Return binary mask of legal actions."""
        # ... rest of the implementation ...

    @partial(jax.jit, static_argnums=(0,))
    @jaxtyped
    def get_observation(self, 
                       state: Float[Array, "15 8 8"]) -> Float[Array, "6 8 8"]:
        """Convert state to observation format for agents."""
        # ... rest of the implementation ...

class Checkers:
    """JAX-compatible implementation of Checkers game."""
    def __init__(self):
        """Initialize the game state using JAX arrays.
        
        State representation (15, 8, 8):
        - Layers 0-3: Piece positions (P1 men, P1 kings, P2 men, P2 kings)
        - Layer 4: Current player (0 for P1, 1 for P2)
        - Layer 5: Draw timer
        - Layers 6-13: Move indicators (normal: UL,UR,BL,BR, jumps: UL,UR,BL,BR)
        - Layer 14: Parent state action indices
        """
        self.state = jnp.zeros((15, 8, 8), dtype=jnp.float32)
        self.state = self.init_board(self.state)
        
    @partial(jax.jit, static_argnums=(0,))
    def init_board(self, state):
        """Place pieces in starting positions using JAX operations."""
        # Create meshgrid for board coordinates
        y, x = jnp.meshgrid(jnp.arange(8), jnp.arange(8))
        
        # Conditions for piece placement
        valid_squares = (x % 2) != (y % 2)
        p1_rows = x < 3
        p2_rows = x > 4
        
        # Update state with initial piece positions
        state = state.at[0].set(jnp.where(valid_squares & p1_rows, 1., 0.))
        state = state.at[2].set(jnp.where(valid_squares & p2_rows, 1., 0.))
        
        return state

    @partial(jax.jit, static_argnums=(0,))
    def step(self, state, action) -> Tuple[chex.Array, float, bool]:
        """Execute a move and return (new_state, reward, done).
        
        Args:
            state: Current game state array
            action: Action index to execute
            
        Returns:
            new_state: Updated game state
            reward: Reward for this step (-1, 0, or 1)
            done: Whether game is finished
        """
        # Get move from action layers
        move_layer = action // 64  # Which move type (layers 6-13)
        position = action % 64     # Which board position
        x, y = position // 8, position % 8
        
        # Execute move using JAX operations
        new_state = self._execute_move(state, move_layer, x, y)
        
        # Check game ending conditions
        done, reward = self._check_game_over(new_state)
        
        return new_state, reward, done

    @partial(jax.jit, static_argnums=(0,))
    def _execute_move(self, state, move_layer, x, y) -> chex.Array:
        """Execute a move given the move type and position."""
        # Get current player and piece indices
        player = state[4, 0, 0]
        player_idx = player * 2
        
        # Calculate move offsets based on move type
        is_jump = move_layer >= 10
        direction_map = jnp.array([
            [-1, -1],  # UL
            [-1, 1],   # UR
            [1, -1],   # BL
            [1, 1],    # BR
        ])
        
        base_direction = direction_map[move_layer % 4]
        move_offset = jnp.where(is_jump, base_direction * 2, base_direction)
        
        # Calculate new position
        new_x = x + move_offset[0]
        new_y = y + move_offset[1]
        
        # Create new state with moved piece
        new_state = state.copy()
        
        # Handle regular moves
        def handle_regular_move(state):
            # Remove piece from old position
            state = state.at[player_idx:player_idx+2, x, y].set(0)
            
            # Place piece in new position (handle kinging)
            is_king = state[player_idx+1, x, y] == 1
            reaches_end = ((player == 0) & (new_x == 7)) | ((player == 1) & (new_x == 0))
            king_idx = jnp.where(reaches_end | is_king, player_idx+1, player_idx)
            state = state.at[king_idx, new_x, new_y].set(1)
            
            return state
            
        # Handle jumps
        def handle_jump(state):
            # Remove jumped piece
            jumped_x = x + base_direction[0]
            jumped_y = y + base_direction[1]
            opp_idx = (1 - player) * 2
            state = state.at[opp_idx:opp_idx+2, jumped_x, jumped_y].set(0)
            
            # Move piece (same as regular move)
            return handle_regular_move(state)
        
        # Apply move
        new_state = jax.lax.cond(
            is_jump,
            handle_jump,
            handle_regular_move,
            new_state
        )
        
        # Toggle player
        new_state = new_state.at[4].set(1 - player)
        
        # Clear move indicators
        new_state = new_state.at[6:14].set(0)
        
        return new_state

    @partial(jax.jit, static_argnums=(0,))
    def legal_actions(self, state) -> chex.Array:
        """Return binary mask of legal actions.
        
        Returns:
            mask: Binary array of shape (num_actions,) where 1 indicates legal action
        """
        # Calculate total number of possible actions (8 move types * 64 positions)
        num_actions = 8 * 64
        
        # Get move indicators from state
        move_indicators = state[6:14]
        
        # Flatten into binary mask
        legal_mask = move_indicators.reshape(-1)
        
        return legal_mask

    @partial(jax.jit, static_argnums=(0,))
    def _get_legal_moves(self, state) -> chex.Array:
        """Calculate all legal moves for current state."""
        player = state[4, 0, 0]
        player_idx = player * 2
        
        # Get piece positions
        men = state[player_idx]
        kings = state[player_idx + 1]
        opp_men = state[(1-player)*2]
        opp_kings = state[(1-player)*2 + 1]
        
        # Combined board state
        board = jnp.sum(state[0:4], axis=0)
        
        # Direction vectors for moves
        directions = jnp.array([
            [-1, -1],  # UL
            [-1, 1],   # UR
            [1, -1],   # BL
            [1, 1],    # BR
        ])
        
        def check_regular_moves(piece_pos, is_king):
            """Check regular moves for a piece type."""
            moves = jnp.zeros((4, 8, 8))
            
            def check_direction(i, moves):
                dir_x, dir_y = directions[i]
                
                # Filter moves based on direction and piece type
                valid_direction = is_king | (
                    ((player == 0) & (dir_x > 0)) |
                    ((player == 1) & (dir_x < 0))
                )
                
                # Calculate new positions
                new_x = jnp.arange(8)[:, None] + dir_x
                new_y = jnp.arange(8)[None, :] + dir_y
                
                # Check bounds and empty squares
                in_bounds = (new_x >= 0) & (new_x < 8) & (new_y >= 0) & (new_y < 8)
                empty = jnp.where(in_bounds, board[new_x, new_y] == 0, False)
                
                # Update moves array
                moves = moves.at[i].set(
                    jnp.where(piece_pos & valid_direction & in_bounds & empty, 1, 0)
                )
                return moves
                
            moves = jax.lax.fori_loop(0, 4, check_direction, moves)
            return moves
            
        def check_jumps(piece_pos, is_king):
            """Check jump moves for a piece type."""
            jumps = jnp.zeros((4, 8, 8))
            
            def check_direction(i, jumps):
                dir_x, dir_y = directions[i]
                
                # Filter jumps based on direction and piece type
                valid_direction = is_king | (
                    ((player == 0) & (dir_x > 0)) |
                    ((player == 1) & (dir_x < 0))
                )
                
                # Calculate jumped and landing positions
                jumped_x = jnp.arange(8)[:, None] + dir_x
                jumped_y = jnp.arange(8)[None, :] + dir_y
                new_x = jumped_x + dir_x
                new_y = jumped_y + dir_y
                
                # Check bounds and conditions
                in_bounds = (new_x >= 0) & (new_x < 8) & (new_y >= 0) & (new_y < 8)
                has_opponent = ((opp_men + opp_kings)[jumped_x, jumped_y] > 0)
                empty_landing = board[new_x, new_y] == 0
                
                # Update jumps array
                jumps = jumps.at[i].set(
                    jnp.where(piece_pos & valid_direction & in_bounds & 
                             has_opponent & empty_landing, 1, 0)
                )
                return jumps
                
            jumps = jax.lax.fori_loop(0, 4, check_direction, jumps)
            return jumps
            
        # Get all possible moves
        men_moves = check_regular_moves(men, False)
        king_moves = check_regular_moves(kings, True)
        men_jumps = check_jumps(men, False)
        king_jumps = check_jumps(kings, True)
        
        # Combine moves into indicators
        move_indicators = jnp.concatenate([
            men_moves + king_moves,  # Regular moves (layers 6-9)
            men_jumps + king_jumps   # Jumps (layers 10-13)
        ])
        
        # If any jumps are available, only allow jumps
        has_jumps = jnp.any(men_jumps + king_jumps)
        move_indicators = move_indicators.at[:4].set(
            jnp.where(has_jumps, 0, move_indicators[:4])
        )
        
        return move_indicators

    @partial(jax.jit, static_argnums=(0,))
    def _check_game_over(self, state) -> Tuple[bool, float]:
        """Check if game is over and return reward."""
        # Count pieces
        p1_pieces = jnp.sum(state[0:2])
        p2_pieces = jnp.sum(state[2:4])
        
        # Check win conditions
        p1_wins = p2_pieces == 0
        p2_wins = p1_pieces == 0
        
        # Calculate reward
        current_player = state[4, 0, 0]
        reward = jnp.where(p1_wins, 1., jnp.where(p2_wins, -1., 0.))
        reward = jnp.where(current_player == 1, -reward, reward)
        
        done = p1_wins | p2_wins
        
        return done, reward

    @partial(jax.jit, static_argnums=(0,))
    def get_observation(self, state) -> chex.Array:
        """Convert state to observation format for agents."""
        # Basic features: piece positions and current player
        basic_features = state[:5]
        
        # Additional features
        piece_counts = jnp.sum(state[0:4], axis=(1,2))
        p1_pieces = piece_counts[0] + piece_counts[1]
        p2_pieces = piece_counts[2] + piece_counts[3]
        
        # Piece advantage feature
        advantage = (p1_pieces - p2_pieces) / (p1_pieces + p2_pieces + 1e-6)
        advantage_plane = jnp.full((8, 8), advantage)
        
        # Combine features
        return jnp.concatenate([
            basic_features,
            advantage_plane[None, :, :]
        ])

    @partial(jax.jit, static_argnums=(0,))
    def get_reward(self, state, next_state) -> float:
        """Calculate reward for transition from state to next_state."""
        # Count pieces in both states
        curr_p1_pieces = jnp.sum(state[0:2])
        curr_p2_pieces = jnp.sum(state[2:4])
        next_p1_pieces = jnp.sum(next_state[0:2])
        next_p2_pieces = jnp.sum(next_state[2:4])
        
        # Reward for capturing pieces
        p1_captured = curr_p2_pieces - next_p2_pieces
        p2_captured = curr_p1_pieces - next_p1_pieces
        
        player = state[4, 0, 0]
        capture_reward = jnp.where(
            player == 0,
            p1_captured - p2_captured,
            p2_captured - p1_captured
        )
        
        # Terminal rewards
        done, outcome = self._check_game_over(next_state)
        terminal_reward = jnp.where(done, outcome * 10.0, 0.0)
        
        return capture_reward + terminal_reward

    def reset(self, key: chex.PRNGKey) -> chex.Array:
        """Reset the game to initial state."""
        return self.init_board(jnp.zeros_like(self.state))

    def clone(self) -> 'Checkers':
        """Create a deep copy of the game."""
        return Checkers()

    @property
    def num_actions(self) -> int:
        """Return total number of possible actions."""
        return 8 * 64  # 8 move types * 64 board positions

    @property
    def observation_shape(self) -> Tuple[int, ...]:
        """Return shape of observation tensor."""
        return (6, 8, 8)  # 5 basic + 1 advantage feature

def test_game():
    """Test function to validate functionality of JAX Checkers implementation."""
    game = Checkers()
    key = jax.random.PRNGKey(0)
    
    state = game.reset(key)
    done = False
    
    while not done:
        # Get legal actions
        legal_mask = game.legal_actions(state)
        
        # Random action selection
        action = jax.random.choice(
            key, 
            jnp.where(legal_mask)[0],
            shape=(),
        )
        key, _ = jax.random.split(key)
        
        # Take step
        state, reward, done = game.step(state, action)
        
        # Print board state
        print(f"\nBoard state:")
        print(jnp.sum(state[0:4], axis=0))  # Combined piece positions
        print(f"Reward: {reward}, Done: {done}")

if __name__ == '__main__':
    test_game()