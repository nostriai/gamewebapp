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


ai_agent = RandomChoiceAgent()

# %% Initialize game environment and MCTS class
# Set MCTS parameters
mcts_kwargs = {     # Parameters for MCTS used in tournament
'NN_FN' : None, # 'data/model/Checkers_Model10_12-Feb-2021(14:50:36).h5',
'UCT_C' : 4,                # Constant C used to calculate UCT value
'CONSTRAINT' : 'time',   # Constraint can be 'rollout' or 'time'
'BUDGET' : 5,             # Maximum number of rollouts or time in seconds
'MULTIPROC' : False,        # Enable multiprocessing
'NEURAL_NET' : False,       # If False uses random rollouts instead of NN
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

def id_to_loc(idx):
    idx = 2 * idx - 1
    row, col = np.unravel_index(idx, (8, 8))
    row += 1
    if row % 2:
        col += 1
    
    return (row, col)

def loc_to_id(loc):
    row, col = loc
    if row % 2:
        col -= 1
    row -= 1

    indx = np.ravel_multi_index((row, col), (8, 8))

    return int((indx + 1) // 2)

@app.post("/game/update-board-with-human-move")
async def updateHumanMove(request: Request):
    moves = await request.json()
    assert game_env.current_player(game_env.state) == 'player1'
    idx_move = [moves.get('oldTileId'), moves.get('newTileId')]
    loc_move = [id_to_loc(idx) for idx in idx_move]
    legal_next_states = game_env.legal_next_states
    print(game_env.move_count)
    moves_list = states_to_piece_positions(game_env, legal_next_states)
    for idx, possible_move in enumerate(moves_list):
        if loc_move == possible_move:
            print(game_env.current_player(game_env.state), 'move found')
            game_env.step(legal_next_states[idx])
            break

    print(game_env.move_count)
    assert game_env.current_player(game_env.state) == 'player2'

@app.post("/game/get-ai-move")
async def getAIMove(request: Request):
    global best_child
    board = await request.json()
    # TODO: call the AI function here

    ai_player = 2

    assert game_env.current_player(game_env.state) == 'player2'

    game_env.print_board()
    old_state = game_env.state
    if game_env.move_count == 1: # Initialize second player's MCTS node 
        root_node = MCTS_Node(old_state, parent=None, initial_state=initial_state)
    else: # Update P2 root node with P1's move
        root_node = MCTS.new_root_node(best_child)
    
    MCTS.begin_tree_search(root_node)
    
    best_child = MCTS.best_child(root_node)
    moves_list = states_to_piece_positions(game_env, [best_child.state])[0]
    game_env.step(best_child.state)

    print(moves_list)

    piece_tile_id =  loc_to_id(moves_list[0])
    tile_id = loc_to_id(moves_list[1])

    # find piece_id
    
    for row in board:
        for piece in row:
            if 'piece' in piece:
                if piece['piece']['player'] == ai_player:
                    if piece['tileId'] == piece_tile_id:
                        piece_id = piece['pieceId']
                        print(piece)

    print(game_env.current_player(game_env.state))

    # response should look like this
    return {'pieceId': piece_id, 'tileId': tile_id}

@app.get("/game/reset-board-state")
async def resetBoardState(request: Request):
    global best_child
    best_child = None
    game_env.reset()
    return {'success': True}


#Notes: 1. If ai has to play in a sequence it is not called again after the first move.
#       2. Pions of player 1 can be kings for no reason.


app.mount("/", StaticFiles(directory="static", html= True), name="static")