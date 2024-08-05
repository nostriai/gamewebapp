from checkers.Checkers import Checkers
from checkers.MCTS import MCTS
from checkers.MCTS import MCTS_Node
from checkers.src.Player import Player
from checkers.src.PlayerName import PlayerName

class Game:
    def __init__(self, player1: Player, player2: Player):
        self.player1 = player1
        self.player2 = player2
        self.gameEnv = None
        self.initialState = None
        self.MCTS = None
        self.bestChild = None
        self.setupComplete = False
        self.playersMove = PlayerName.PLAYER_1
        self.__setup()

    def __setup(self):
        self.gameEnv = Checkers(neural_net=None)
        self.initialState = self.gameEnv.state
        MCTSConfig = {  # Parameters for MCTS used in tournament
            'NN_FN': None,  # 'data/model/Checkers_Model10_12-Feb-2021(14:50:36).h5',
            'UCT_C': 4,  # Constant C used to calculate UCT value
            'CONSTRAINT': 'time',  # Constraint can be 'rollout' or 'time'
            'BUDGET': 5,  # Maximum number of rollouts or time in seconds
            'MULTIPROC': False,  # Enable multiprocessing
            'NEURAL_NET': False,  # If False uses random rollouts instead of NN
            'VERBOSE': False,  # MCTS prints search start/stop messages if True
            'TRAINING': False,  # True if self-play, False if competitive play
            'DIRICHLET_ALPHA': 1.0,  # Used to add noise to prior probs of actions
            'DIRICHLET_EPSILON': 0.25,  # Fraction of noise added to prior probs of actions
            'TEMPERATURE_TAU': 0,  # Initial value of temperature Tau
            'TEMPERATURE_DECAY': 0,  # Linear decay of Tau per move
            'TEMP_DECAY_DELAY': 0,  # Move count before beginning decay of Tau value
            'GAME_ENV': self.gameEnv
        }
        self.MCTS = MCTS(**MCTSConfig)
        self.setupComplete = True

    def getPlayerByName(self, name: PlayerName):
        if self.player1.name == name:
            return self.player1
        if self.player2.name == name:
            return self.player2
        return None

    def movePlayer(self, name:PlayerName, oldTileId, tileId):
        assert self.gameEnv.current_player(self.gameEnv.state) == name.value
        player = self.getPlayerByName(name)
        if player is not None:
            player.move(oldTileId, tileId, self.gameEnv)
            self.gameEnv.print_board()
            self.switchPlayersMove()

    def makeAIMove(self, name:PlayerName):
        assert self.gameEnv.current_player(self.gameEnv.state) == name.value
        player = self.getPlayerByName(name)
        if player is not None:
            data = player.makeAIMove(self.bestChild, self.gameEnv, self.MCTS, MCTS_Node, self.initialState)
            self.gameEnv.print_board()
            self.bestChild = data['bestChild']
            self.switchPlayersMove()
            return {'pieceTileId': data['pieceTileId'], 'tileId': data['tileId']}


    def switchPlayersMove(self):
        self.playersMove = PlayerName.PLAYER_2 if self.playersMove ==  PlayerName.PLAYER_1 else PlayerName.PLAYER_1

    def isGameFinished(self):
        return self.gameEnv.done

    def getPlayersMove(self):
        return self.playersMove

    def getMoveCount(self):
        return self.gameEnv.move_count


    def reset(self):
        self.bestChild = None
        self.gameEnv.reset()
        self.playersMove = PlayerName.PLAYER_1


    def isPlayersMove(self, name: PlayerName):
        assert self.gameEnv.current_player == name.value





