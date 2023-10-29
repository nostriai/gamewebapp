import numpy as np

# %% Functions
def get_human_input(game_env):
    """Print a list of legal next moves for the human player, and return
    the player's selection.  The player will be presented with move options
    in the form of two coordinates that represent the start and end location
    of the piece to be moved.
    """
    while True:
        legal_next_states = game_env.legal_next_states
        moves_list = states_to_piece_positions(legal_next_states)
        for idx, move in enumerate(moves_list):
            print('Option #{}: {} to {}'.format(idx+1, move[0], move[1]))
        move_idx = int(input('Enter option number: ')) - 1
        if move_idx in range(len(moves_list)):
            game_env.step(legal_next_states[move_idx])
            game_env.print_board()
            return legal_next_states[move_idx]
        else:
            print('Invalid selection!  Try again!')

def states_to_piece_positions(game_env, next_states):
    """Given a list of next states, produce a list of two coordinates for each possible next state. The first coordinate will be the location of the piece that was moved, and the second coordinate will be the location that the piece moved to.
    """
    moves_list = []
    state = game_env.state
    board = state[0] + 2*state[1] + 3*state[2] + 4*state[3]
    for nstate in next_states:
        nboard = nstate[0] + 2*nstate[1] + 3*nstate[2] + 4*nstate[3]
        board_diff = board - nboard
        xnew, ynew = np.where(board_diff < 0)
        xnew, ynew = xnew[0], ynew[0]
        new_val = abs(nboard[xnew,ynew])
        xold, yold = np.where(board_diff == new_val)
        try:
            xold, yold = xold[0], yold[0]
        except IndexError: # Man promoted to king
            new_val -= 1 # Value of man is 1 less than king
            xold, yold = np.where(board_diff == new_val)
            xold, yold = xold[0], yold[0]
        moves_list.append([(xold+1,yold+1),(xnew+1,ynew+1)])
    return moves_list