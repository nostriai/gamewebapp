from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
import os
import uvicorn
import time
from pathlib import Path

from .game_session import GameSessionManager

app = FastAPI(title="PGX Frontend API")
session_manager = GameSessionManager()

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GameRequest(BaseModel):
    game_type: str
    ai_difficulty: str = "medium"  # easy, medium, hard

class MoveRequest(BaseModel):
    action: int

@app.get("/api/available-games")
async def get_available_games():
    # Only include tic-tac-toe and go games
    available_games = ["tic_tac_toe", "go_9x9", "go_19x19"]
    return {"games": available_games}

@app.post("/api/games")
async def create_game(request: GameRequest):
    try:
        session = session_manager.create_session(
            request.game_type, 
            ai_difficulty=request.ai_difficulty
        )
        return {
            "id": session.id,
            "state": session.get_state()
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/games/{game_id}")
async def get_game(game_id: str):
    session = session_manager.get_session(game_id)
    if not session:
        raise HTTPException(status_code=404, detail="Game not found")
    
    return {
        "id": session.id,
        "state": session.get_state()
    }

@app.post("/api/games/{game_id}/move")
async def make_move(game_id: str, request: MoveRequest):
    session = session_manager.get_session(game_id)
    if not session:
        raise HTTPException(status_code=404, detail="Game not found")
    
    success = session.apply_move(request.action)
    if not success:
        raise HTTPException(status_code=400, detail="Invalid move")
    
    return {
        "id": game_id,
        "state": session.get_state()
    }

@app.get("/api/games/{game_id}/ai-move")
async def ai_move(game_id: str):
    session = session_manager.get_session(game_id)
    if not session:
        raise HTTPException(status_code=404, detail="Game not found")
    
    success = session.apply_ai_move()
    if not success:
        raise HTTPException(status_code=400, detail="AI cannot make a move")
    
    return {
        "id": game_id,
        "state": session.get_state()
    }

@app.get("/api/games/{game_id}/action-positions")
async def get_action_positions(game_id: str):
    """Return mappings between legal actions and board positions"""
    session = session_manager.get_session(game_id)
    if not session:
        raise HTTPException(status_code=404, detail="Game not found")
    
    return session.get_action_positions()

# Find the frontend directory
frontend_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend")
# Mount static files
app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="frontend")

# Clean up old sessions periodically
@app.middleware("http")
async def cleanup_sessions_middleware(request: Request, call_next):
    # Clean up old sessions every 100 requests (approximately)
    if int(time.time()) % 100 == 0:
        session_manager.cleanup_old_sessions(max_age_hours=24.0)
    return await call_next(request)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
