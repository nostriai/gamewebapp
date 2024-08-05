from .PlayerName import PlayerName
from utils import states_to_piece_positions
import numpy as np
class Player:
    def __init__(self, name: PlayerName):
        self.name = name

    def move(self, oldTileId, tileId, gameEnv):
        move = [oldTileId, tileId]
        locationMove = [self.idToLocaction(idx) for idx in move]
        legalNextStates = gameEnv.legal_next_states
        movesList =  states_to_piece_positions(gameEnv, legalNextStates)
        for idx, possibleMove in enumerate(movesList):
            if locationMove == possibleMove:
                gameEnv.step(legalNextStates[idx])
                break

    def makeAIMove(self, bestChild, gameEnv, MCTS, MCTS_Node, initialState):
        # TODO: call the AI function here
        oldState = gameEnv.state
        if gameEnv.move_count == 1:  # Initialize second player's MCTS node
            rootNode = MCTS_Node(oldState, parent=None, initial_state=initialState)
        else:  # Update P2 root node with P1's move
            rootNode = MCTS.new_root_node(bestChild)
        MCTS.begin_tree_search(rootNode)
        bestChild = MCTS.best_child(rootNode)
        movesList = states_to_piece_positions(gameEnv, [bestChild.state])[0]
        gameEnv.step(bestChild.state)
        pieceTileId = self.locationToId(movesList[0])
        tileId = self.locationToId(movesList[1])

        return {'bestChild': bestChild, 'pieceTileId': pieceTileId, 'tileId': tileId}


    def idToLocaction(self, idx):
        idx = 2 * idx - 1
        row, col = np.unravel_index(idx, (8, 8))
        row += 1
        if row % 2:
            col += 1

        return row, col

    def locationToId(self, loc):
        row, col = loc
        if row % 2:
            col -= 1
        row -= 1

        indx = np.ravel_multi_index((row, col), (8, 8))

        return int((indx + 1) // 2)