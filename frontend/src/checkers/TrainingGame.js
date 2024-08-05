import EventEmitter from "../helpers/EventEmitter.js";
import Board from "./Board.js";

export default class TrainingGame {
    eventEmitter = new EventEmitter();
    score = {
        player1: 0,
        player2: 0
    };
    playerTurn = 1;

    async setupNewGame() {
        await this.loadBoardHTML();
        this.board = new Board(this.eventEmitter);
        await this.clearAiState();
        this.addListeners();
        this.board.initBoard();
        await this.makeInitialMove();
    }

    async makeInitialMove() {
        const piece = this.board.pieces.get(9);
        const tile = this.board.tiles.get(14);
        this.updatePiecePosition(piece, tile);
        piece.element.style.top = this.board.tilesPositions[piece.position[0]];
        piece.element.style.left = this.board.tilesPositions[piece.position[1]];
        await this.updateAIState(9, 14);
        this.changeTurn();
        await this.askAiForMove();
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
        document.getElementById('cleargame').addEventListener('click', () => {
            location.reload();
        });
        this.onPieceMoved();
        this.onTurnStart();
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

    movePiece(piece, tile) {
        this.updatePiecePosition(piece, tile);
        this.board.movePiece(piece);
    }
    updatePiecePosition(piece, tile) {
        piece.lastTileId = this.board.boardState[piece.position[0]][piece.position[1]]['tileId'];
        this.board.boardState[piece.position[0]][piece.position[1]].pieceId = null;
        this.board.boardState[tile.position[0]][tile.position[1]].pieceId = piece.id;
        piece.position = tile.position;
    }

    onTurnStart() {
        this.eventEmitter.on('onTurnStart', () => {
            this.evaluateValidPieceMoves();
            this.checkIfGameIsOver();
        });
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
                if(piece.canJump) {
                    this.askAiForMove();
                    return;
                }
            }
            this.changeTurn();
            this.askAiForMove();
            piece.element.classList.remove('selected');
        });
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

    async askAiForMove() {
        let nextMove = await this.getNextTurn();
        if (nextMove) {
            const piece = this.board.pieces.get(nextMove.pieceId);
            const tile = this.board.tiles.get(nextMove.tileId);
            this.movePiece(piece, tile);
            window.userService.sendPrivateMessageToSelf("Ai moved piece with id: " + piece.id + " to tile with coordinates: " + tile.position[0] + ", "+tile.position[1]);
        }
    }

    async getNextTurn() {
        let nextMove = await fetch('/game/get-ai-move-training', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({board:this.generateBoardData(), player: this.playerTurn})
        });
        if(nextMove) {
            return await nextMove.json();
        }
        return false;
    }

    async clearAiState() {
        let result = await fetch('/game/reset-board-state', {
            method: 'GET',
        });
        if(!result) {
            console.log('Error resetting AI state');
        }
    }

    async updateAIState(oldTileId, newTileId){
        let resp = await fetch('/game/update-board-with-human-move', {
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
}