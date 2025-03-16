# PGX Frontend UI

This directory contains the frontend web interface for the PGX Frontend application. The frontend is built with plain HTML, CSS, and JavaScript and communicates with the backend server via REST API.

## Structure

- `index.html`: Main HTML file
- `styles.css`: CSS styling
- `js/`: JavaScript modules
  - `api.js`: API client for communicating with the backend
  - `ui.js`: UI component management
  - `app.js`: Main application logic
  - `game-adapters/`: Game-specific adapters
    - `common.js`: Common adapter functionality
    - `tictactoe.js`: Tic-tac-toe specific implementation
    - `go.js`: Go specific implementation
- `assets/`: Images and other static assets

## Game Adapters

The frontend uses a game adapter pattern to handle game-specific rendering and interactions. Each game type has its own adapter class that extends the base `GameAdapter` class. This allows the application to easily support different games with different rules and board layouts.

Current adapters:
- `TicTacToeAdapter`: For tic-tac-toe
- `Go9x9Adapter` and `Go19x19Adapter`: For Go with different board sizes

## User Interface

The user interface consists of two main screens:
1. Game selection screen where users can choose a game and AI difficulty
2. Game board screen where users can play the selected game against the AI

The interface is designed to be responsive and works on both desktop and mobile devices.
