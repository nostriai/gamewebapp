import Board from "./Board.js";
import EventEmitter from "./EventEmitter.js";
export default class Coordinator {

    eventEmitter = new EventEmitter();
    board = new Board(this.eventEmitter);
    score = {
        player1: 0,
        player2: 0
    };
    playerTurn = 1;
    setupNewGame() {
        this.addListeners();
        this.board.initBoard();
    }

    addListeners() {
        this.onTurnStart();
    }

    onTurnStart() {
        this.eventEmitter.on('onTurnStart', () => {
            this.evaluateValidPieceMoves();
            this.checkIfGameIsOver();
        });
    }

    evaluateValidPieceMoves() {
        let jumpExists = false;
        this.board.pieces.forEach(piece => {
            if(piece.player === this.playerTurn) {
               piece.calculateValidMoves(this.board.boardState);
               if(piece.canJump) {
                   jumpExists = true;
               }
            }
        });
        if(jumpExists) {
            this.board.pieces.forEach(piece => {
                if(piece.player === this.playerTurn) {
                    piece.invalidateNonJumpMoves();
                }
            });
        }
        console.log(this.board.pieces)
    }

    checkIfGameIsOver() {
        let end = true;
        this.board.pieces.forEach(piece => {
            if(piece.validMoves.length !== 0) {
                end = false;
            }
        });
        if(end) {
            this.gameOver();
        }
    }
    gameOver() {
        //@todo show winner
    }
}