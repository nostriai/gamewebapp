from fastapi import Request, FastAPI, responses
from fastapi.staticfiles import StaticFiles
from starlette.responses import FileResponse

from checkers.src.Game import Game
from checkers.src.Player import Player
from checkers.src.Player import PlayerName
from checkers.src.PlayerName import PlayerName

player1 = Player(PlayerName.PLAYER_1)
player2 = Player(PlayerName.PLAYER_2)
game = Game(player1, player2)


app = FastAPI()
@app.exception_handler(404)
async def custom_404_handler(_, __):
    return FileResponse('../frontend/index.html')


@app.post("/game/get-ai-move")
async def getAIMove(request: Request):
    board = await request.json()
    ai_player_id = 2
    data = game.makeAIMove(PlayerName.PLAYER_2)
    for row in board:
        for piece in row:
            if 'piece' in piece:
                if piece['piece']['player'] == ai_player_id:
                    if piece['tileId'] == data['pieceTileId']:
                        pieceId = piece['pieceId']
    return {'pieceId': pieceId, 'tileId': data['tileId']}


@app.post("/game/get-ai-move-training")
async def getAIMove(request: Request):
    data = await request.json()
    board = data['board']
    ai_player_id = data['player']
    if ai_player_id == 1:
        player = PlayerName.PLAYER_1
    else:
        player = PlayerName.PLAYER_2
    data = game.makeAIMove(player)
    for row in board:
        for piece in row:
            if 'piece' in piece:
                if piece['piece']['player'] == ai_player_id:
                    if piece['tileId'] == data['pieceTileId']:
                        pieceId = piece['pieceId']
    return {'pieceId': pieceId, 'tileId': data['tileId']}


@app.post("/game/log-training-users")
async def logTrainingUsers(request: Request):
    data = await request.json()
    player1 = data['player1']
    player2 = data['player2']
    date = data['date']
    with open('training_users.txt', 'a') as f:
        f.write(f'{player1} vs {player2} on {date}\n')
    return {'success': True}


@app.post("/game/update-board-with-human-move")
async def updateHumanMove(request: Request):
    moves = await request.json()
    game.movePlayer(PlayerName.PLAYER_1, moves['oldTileId'], moves['newTileId'])


@app.get("/game/reset-board-state")
async def resetBoardState(request: Request):
    game.reset()
    return {'success': True}

app.mount("/", StaticFiles(directory="../frontend", html= True), name="static")