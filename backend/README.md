# PGX Frontend Backend

This directory contains the backend server for the PGX Frontend application. The server is built with FastAPI and provides a REST API for interacting with PGX games.

## Structure

- `app.py`: Main FastAPI application with API endpoints
- `game_session.py`: Game session management logic
- `ai_players/`: AI player implementations (currently using random moves)
- `mapping/`: Game-specific action mappings

## Running the Server

Make sure you have installed the dependencies:

```bash
pip install -r ../requirements.txt
```

Then start the server:

```bash
cd pgx-frontend
python -m backend.app
```

The server will start at `http://localhost:8000`. You can access the web interface by visiting this URL in your browser.

## API Endpoints

- `GET /api/available-games`: Get a list of available games
- `POST /api/games`: Create a new game session
- `GET /api/games/{game_id}`: Get the state of a game
- `POST /api/games/{game_id}/move`: Make a move in a game
- `GET /api/games/{game_id}/ai-move`: Request the AI to make a move
- `GET /api/games/{game_id}/action-positions`: Get the positions of legal actions

## Supported Games

- Tic-tac-toe (`tic_tac_toe`)
- Go 9x9 (`go_9x9`)
- Go 19x19 (`go_19x19`)
