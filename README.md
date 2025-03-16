# PGX Web

A web-based frontend for the PGX (Pgx Game Simulator) package. This application provides a user-friendly interface to play games against AI opponents powered by JAX through the PGX library.

## Features

- Play Tic-Tac-Toe and Go against AI opponents
- Multiple AI difficulty levels
- Responsive web interface
- Leverages the original PGX game logic written in JAX

## Requirements

- Python 3.9+
- JAX and JAXlib installed for your hardware
- PGX library
- FastAPI
- Uvicorn
- Additional Python dependencies listed in requirements.txt

## Installation

1. Clone this repository
2. Install dependencies:
```bash
pip install -r requirements.txt
```

## Running the Application

Start the server:
```bash
python -m backend.app
```

Then open your browser and navigate to `http://localhost:8000`

## Available Games

- Tic-Tac-Toe (`tic_tac_toe`)
- Go 9x9 (`go_9x9`)
- Go 19x19 (`go_19x19`)

## Architecture

This application follows a client-server architecture:

- Backend: FastAPI REST API that interfaces with PGX game logic
- Frontend: HTML/CSS/JavaScript web interface

## License

This project is licensed under the Apache License 2.0.
