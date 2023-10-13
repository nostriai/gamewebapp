import sys
import numpy as np

from fastapi import Request, FastAPI
from fastapi.staticfiles import StaticFiles
from agents import RandomChoiceAgent

from utils import states_to_piece_positions

from checkers.Checkers import Checkers
from checkers.MCTS import MCTS
from checkers.MCTS import MCTS_Node


app = FastAPI()
app.mount("/game", StaticFiles(directory="static", html= True), name="static")
# zasto dva puta definisemo fastapi?
api = FastAPI()

ai_agent = RandomChoiceAgent()

# %% Initialize game environment and MCTS class
# Set MCTS parameters
mcts_kwargs = {     # Parameters for MCTS used in tournament
'NN_FN' : 'data/model/Checkers_Model10_12-Feb-2021(14:50:36).h5',
'UCT_C' : 4,                # Constant C used to calculate UCT value
'CONSTRAINT' : 'rollout',   # Constraint can be 'rollout' or 'time'
'BUDGET' : 400,             # Maximum number of rollouts or time in seconds
'MULTIPROC' : False,        # Enable multiprocessing
'NEURAL_NET' : False,        # If False uses random rollouts instead of NN
'VERBOSE' : False,          # MCTS prints search start/stop messages if True
'TRAINING' : False,         # True if self-play, False if competitive play
'DIRICHLET_ALPHA' : 1.0,    # Used to add noise to prior probs of actions
'DIRICHLET_EPSILON' : 0.25, # Fraction of noise added to prior probs of actions  
'TEMPERATURE_TAU' : 0,      # Initial value of temperature Tau
'TEMPERATURE_DECAY' : 0,    # Linear decay of Tau per move
'TEMP_DECAY_DELAY' : 0      # Move count before beginning decay of Tau value
}

game_env = Checkers(neural_net=None)
initial_state = game_env.state

mcts_kwargs['GAME_ENV'] = game_env
MCTS(**mcts_kwargs)

best_child = None

def format_board(board, player=2):
    movable_pieces = []
    valid_moves = []
    board_state = []
    for row in board:
        row_state = []
        for piece in row:
            if 'piece' in piece:
                if piece['piece']['player'] == player:
                    if piece['piece']['king']:
                        row_state.append(2)
                    else:
                        row_state.append(1)
                    
                    if len(piece['piece']['validMoves']) > 0:
                        print(piece['pieceId'], len(piece['piece']['validMoves']))
                        print(piece['piece']['validMoves'])

                        # in some cases element can be None, not sure why
                        moves = [element['tileId'] for element in piece['piece']['validMoves'] if element is not None]

                        if len(moves) > 0:
                            movable_pieces.append( piece['pieceId'] ) 
                            valid_moves.append(moves)
                else:
                    mod = -1
                    if piece['piece']['king']:
                        row_state.append(-2)
                    else:
                        row_state.append(-1)
            else:
                row_state.append(0)
        
        board_state.append(row_state)

    return movable_pieces, valid_moves, board_state

@api.post("/update-board-with-human-move")
async def updateHumanMove(request: Request):
    board = await request.json()

    assert game_env.current_player(game_env.state) == 'player1'
    move = board['last human move']

    legal_next_states = game_env.legal_next_states
    moves_list = states_to_piece_positions(legal_next_states)
    for idx, possible_move in enumerate(moves_list):
        if move == possible_move:
            game_env.step(legal_next_states[idx])
            break

@api.post("/get-ai-move")
async def getAIMove(request: Request):
    board = await request.json()
    # TODO: call the AI function here

    # assert game_env.current_player(game_env.state) == 'player2'

    ai_player = 2

    movable_pieces, valid_moves, board_state = format_board(board, player=ai_player)

    print(np.array(board_state).reshape(-1))

    piece_id, tile_id = ai_agent.play(movable_pieces, valid_moves, board_state)
    # game_env.print_board()

    # if game_env.move_count == 1: # Initialize second player's MCTS node 
    #     root_node = MCTS_Node(game_env.state, parent=None, initial_state=initial_state)
    # else: # Update P2 root node with P1's move
    #     root_node = MCTS.new_root_node(best_child)
    
    # MCTS.begin_tree_search(root_node)
    # best_child = MCTS.best_child(root_node)
    # game_env.step(best_child.state)
    
    # response should look like this
    return {'pieceId': piece_id, 'tileId': tile_id}


#Notes: 1. If ai has to play in a sequence it is not called again after the first move. 
#       2. Pions of player 1 can be kings for no reason.

app.mount("/api", api)