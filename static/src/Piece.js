export default class Piece {
    constructor(pieceId, element, position, player) {
        this.id = pieceId;
        this.element = element;
        this.position = position;
        this.player = player;
        this.king = false;
        this.validMoves = [];
        this.canJump = false;
    }

    calculateValidMoves(boardState) {
        this.validMoves = [];
        if (this.player === 1) {
            this.checkForValidMoves(boardState, this.position[0] + 1, this.position[1] + 1);
            this.checkForValidMoves(boardState, this.position[0] + 1, this.position[1] - 1);
            if (this.king) {
                this.checkForValidMoves(boardState, this.position[0] - 1, this.position[1] + 1);
                this.checkForValidMoves(boardState, this.position[0] - 1, this.position[1] - 1);
            }
        }
        if (this.player === 2) {
            this.checkForValidMoves(boardState, this.position[0] - 1, this.position[1] + 1);
            this.checkForValidMoves(boardState, this.position[0] - 1, this.position[1] - 1);
            if (this.king) {
                this.checkForValidMoves(boardState, this.position[0] + 1, this.position[1] + 1);
                this.checkForValidMoves(boardState, this.position[0] + 1, this.position[1] - 1);
            }
        }
    }

    checkForValidMoves(boardState, row, column)
    {
        if (row < 0 || row > 7 || column < 0 || column > 7) {
            return;
        }
        if (boardState[row][column].pieceId) {
            if (boardState[row][column].pieceId <= 12 && this.player === 1) {
                return;
            }
            // if (boardState[row][column].pieceId < 13 && this.player === 2) {
            //     this.canJump = true;
            //     this.validMoves.push({
            //         type: 'jump',
            //         position: [row, column]
            //     });
            // }
        }
        this.validMoves.push({
            type: 'regular',
            position: [row, column]
        });
    }

    invalidateNonJumpMoves() {
        this.validMoves.forEach((move, index) => {
            if(move.type !== 'jump') {
                delete this.validMoves[index];
            }
        });
    }

}