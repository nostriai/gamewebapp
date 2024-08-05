from checkers.src.Game import Game
from checkers.src.Player import Player
from checkers.src.Player import PlayerName


player1 = Player(PlayerName.PLAYER_1)
player2 = Player(PlayerName.PLAYER_2)
game = Game(player1, player2)
# @TODO AI first move throws an error, so we force the first move for now
game.movePlayer(PlayerName.PLAYER_1, 9, 14)

while not game.isGameFinished():
    game.makeAIMove(game.getPlayersMove())


