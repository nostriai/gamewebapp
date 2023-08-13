from fastapi import Request, FastAPI
from fastapi.staticfiles import StaticFiles
from agents import RandomChoiceAgent
import numpy as np


app = FastAPI()
app.mount("/game", StaticFiles(directory="static", html= True), name="static")

api = FastAPI()

ai_agent = RandomChoiceAgent()

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

@api.post("/get-next-move")
async def getNextMove(request: Request):
    board = await request.json()
    # TODO: call the AI function here

    ai_player = 2

    movable_pieces, valid_moves, board_state = format_board(board, player=ai_player)

    print(np.array(board_state).reshape(-1))

    piece_id, tile_id = ai_agent.play(movable_pieces, valid_moves, board_state)
    
    # response should look like this
    return {'pieceId': piece_id, 'tileId': tile_id}


#Notes: 1. If ai has to play in a sequence it is not called again after the first move. 
#       2. Pions of player 1 can be kings for no reason.

app.mount("/api", api)