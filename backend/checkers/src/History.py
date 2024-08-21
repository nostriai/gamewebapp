import json

class History:
    def __init__(self):
        self.history = []

    def push(self, pieceTileId, tileId):
        self.history.append([pieceTileId, tileId])

    def getHistoryAsJSON(self):
        return json.dumps(self.history)




