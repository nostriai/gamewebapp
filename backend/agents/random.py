from .base import BaseAgent
import numpy as np

class RandomChoiceAgent(BaseAgent):

    def play(self, movable_pieces, valid_moves, board_state):

        select_piece = np.random.choice(len(movable_pieces))
        select_move = np.random.choice(len(valid_moves[select_piece]))

        return movable_pieces[select_piece], valid_moves[select_piece][select_move]