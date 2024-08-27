# gamewebapp
Proof of concept for federated training of AI for video games


# running
From backend folder for dev purposes run
```bash
fastapi dev main.py
```
For production use run
```bash
fastapi run main.py
```


# Testing the training session

To test the training session, run trainingRaw.py

This will create a training session with 2 players.

The nostr keys are generated for the players automatically.

Upon completion of the game, the keys of the players will be stored in training_users.raw.txt and the game data will be sent to both users on the network.

You can use these keys to test the game data retrieval by running fetchMessages.py with the flags --pubkey and --secret which you have in the traning_users.raw.txt file (you can choose either user1 or user2)
