from checkers.src.Game import Game
from checkers.src.Player import Player
from checkers.src.Player import PlayerName
from nostr.User import User
from datetime import datetime
import asyncio


player1 = Player(PlayerName.PLAYER_1)
player2 = Player(PlayerName.PLAYER_2)
game = Game(player1, player2)
# @TODO AI first move throws an error, so we force the first move for now
game.movePlayer(PlayerName.PLAYER_1, 11, 15)

while not game.isGameFinished():
    move = game.makeAIMove(game.getPlayersMove())


userOne = User()
userTwo = User()
with open('training_users_raw.txt', 'a') as f:
    f.write(f'User 1: pubkey: {userOne.getPublicKeyHex()}, secret: {userOne.getSecretHex()} '
            f'--- '
            f'User 2: pubkey: {userTwo.getPublicKeyHex()}, secret: {userTwo.getSecretHex()} '
            f'on {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}\n')
    asyncio.run(userOne.sendMessage(game.history.getHistoryAsJSON(), userOne.pubkey, 'wss://longhorn.bgp.rodeo'))
    asyncio.run(userTwo.sendMessage(game.history.getHistoryAsJSON(), userTwo.pubkey, 'wss://longhorn.bgp.rodeo'))







