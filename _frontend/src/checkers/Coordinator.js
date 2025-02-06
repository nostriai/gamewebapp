import Board from "./Board.js";
import EventEmitter from "../helpers/EventEmitter.js";

export default class Coordinator {

    eventEmitter = new EventEmitter();
    score = {
        player1: 0,
        player2: 0
    };
    playerTurn = 1;

    async setupNewGame() {
        this.apiUrl = import.meta.env.VITE_API_URL;
        await this.loadBoardHTML();
        this.board = new Board(this.eventEmitter);
        this.clearAiState();
        this.addListeners();
        this.board.initBoard();
    }


    async loadBoardHTML() {
        let boardHTML = await fetch('../static/templates/board.html');
        if (boardHTML) {
            let boardContainer = document.createElement('div');
            boardContainer.innerHTML = await boardHTML.text();
            document.body.appendChild(boardContainer);
        }
    }

    addListeners() {
        this.onTurnStart();
        this.onPieceSelected();
        this.onTileClick();
        this.onPieceMoved();
        this.addClearGameListener();
    }

    onTurnStart() {
        this.eventEmitter.on('onTurnStart', () => {
            this.evaluateValidPieceMoves();
            this.checkIfGameIsOver();
            if (this.playerTurn === 2) {
                this.askAiForMove();
            }
        });
    }

    evaluateValidPieceMoves() {
        let jumpExists = false;
        this.board.pieces.forEach(piece => {
            if (piece.player === this.playerTurn) {
                piece.calculateValidMoves(this.board.boardState);
                if (piece.canJump) {
                    jumpExists = true;
                }
            } else {
                piece.validMoves = [];
            }
        });
        if (jumpExists) {
            this.board.pieces.forEach(piece => {
                if (piece.player === this.playerTurn) {
                    piece.invalidateNonJumpMoves();
                }
            });
        }
    }

    checkIfGameIsOver() {
        let end = true;
        this.board.pieces.forEach(piece => {
            if (piece.validMoves.length !== 0) {
                end = false;
            }
        });
        if (end) {
            this.gameOver();
        }
    }

    gameOver() {
        //check the score
        if (this.score.player1 > this.score.player2) {
            alert('Player 1 wins!');
        } else if (this.score.player2 > this.score.player1) {
            alert('Player 2 wins!');
        } else {
            alert('It\'s a tie!');
        }
        location.reload();
    }

    onPieceSelected() {
        this.eventEmitter.on('pieceSelected', () => {
            this.board.pieces.forEach(piece => {
                piece.element.classList.remove('selected');
            });
            this.removeHighlightFromTiles();
        });
    }

    removeHighlightFromTiles() {
        this.board.tiles.forEach(tile => {
            tile.element.classList.remove('highlighted');
        });
    }

    onTileClick() {
        this.eventEmitter.on('tileClicked', (tile) => {
            if (!tile.element.classList.contains('highlighted')) {
                return;
            }
            const piece = this.board.getSelectedPiece();
            this.movePiece(piece, tile);
        });
    }

    movePiece(piece, tile) {
        this.updatePiecePosition(piece, tile);
        this.removeHighlightFromTiles();
        this.board.movePiece(piece);
    }
    updatePiecePosition(piece, tile) {
        piece.lastTileId = this.board.boardState[piece.position[0]][piece.position[1]]['tileId'];
        this.board.boardState[piece.position[0]][piece.position[1]].pieceId = null;
        this.board.boardState[tile.position[0]][tile.position[1]].pieceId = piece.id;
        piece.position = tile.position;
    }
    onPieceMoved() {
        this.eventEmitter.on('pieceMoved', (piece) => {
            if (!piece.king && (piece.position[0] === 0 || piece.position[0] === 7)) {
                piece.makeKing();
            }
            if (piece.canJump) {
                piece.validMoves.forEach((move) => {
                    if (piece.position[0] === move.position[0] && piece.position[1] === move.position[1]) {
                        //remove piece that was jumped
                        let jumpedPieceId = this.board.boardState[move.jumpedCoordinate[0]][move.jumpedCoordinate[1]].pieceId;
                        this.board.boardState[move.jumpedCoordinate[0]][move.jumpedCoordinate[1]].pieceId = null;
                        this.board.removePiece(jumpedPieceId);
                        piece.canJump = false;
                        this.score['player' + this.playerTurn] += 1;
                        document.querySelector('#player' + this.playerTurn).innerHTML += "<div class='capturedPiece'></div>";
                    }
                });
                piece.calculateValidMoves(this.board.boardState, true);
                if (piece.canJump) {
                    if (this.playerTurn === 2) {
                        this.askAiForMove();
                    }
                    piece.highlightValidMoves();
                    return;
                }
            }
            if(this.playerTurn === 1) {
                let oldTileId = piece.lastTileId
                let newTileId = this.board.boardState[piece.position[0]][piece.position[1]]['tileId']
                this.updateAIState(oldTileId, newTileId)
            }
            this.changeTurn();
            piece.element.classList.remove('selected');
        
        });
    }

    async updateAIState(oldTileId, newTileId){
        let resp = await fetch(this.apiUrl + '/game/update-board-with-human-move', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({oldTileId:oldTileId, newTileId:newTileId})
        });
        if(resp) {
            return 'done'
        }
        return false;
    }

    changeTurn() {
        this.playerTurn = this.playerTurn === 1 ? 2 : 1;
        if (this.playerTurn === 1) {
            document.querySelector('.turn').style.background = 'linear-gradient(to right, #BEEE62 50%, transparent 50%)';
        }
        if (this.playerTurn === 2) {
            document.querySelector('.turn').style.background = 'linear-gradient(to left, #BEEE62 50%, transparent 50%)';
        }
        this.eventEmitter.emit('onTurnStart');
    }

    addClearGameListener() {
        document.getElementById('cleargame').addEventListener('click', () => {
            location.reload();
        });
    }

    async askAiForMove() {
        let nextMove = await this.getNextTurn();
        if (nextMove) {
            const piece = this.board.pieces.get(nextMove.pieceId);
            const tile = this.board.tiles.get(nextMove.tileId);
            this.movePiece(piece, tile);
        }
    }

    async getNextTurn() {
        let nextMove = await fetch(this.apiUrl + '/game/get-ai-move', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(this.generateBoardData())
        });
        if(nextMove) {
            return await nextMove.json();
        }
        return false;
    }

    generateBoardData() {
        let boardData = structuredClone(this.board.boardState);
        boardData.forEach((row) => {
            row.forEach((tile) => {
                if(tile.pieceId) {
                    tile.piece = this.board.pieces.get(tile.pieceId);
                }
            });
        });
        return boardData;
    }

    async clearAiState() {
        let result = await fetch(this.apiUrl + '/game/reset-board-state', {
            method: 'GET',
        });
        if(!result) {
             console.log('Error resetting AI state');
        }
    }
}