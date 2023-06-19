from fastapi import Request, FastAPI
from fastapi.staticfiles import StaticFiles


app = FastAPI()
app.mount("/game", StaticFiles(directory="static", html= True), name="static")

api = FastAPI()



@api.post("/get-next-move")
async def getNextMove(request: Request):
    board = await request.json()
    # TODO: call the AI function here

    # response should look like this
    return {'pieceId': 15, 'tileId': 18}



app.mount("/api", api)