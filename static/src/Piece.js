export default class Piece {
    constructor(pieceId, element, position, player, eventEmitter) {
        this.id = pieceId;
        this.element = element;
        this.position = position;
        this.player = player;
        this.king = false;
        this.validMoves = [];
        this.canJump = false;
        this.addClickEvent();
        this.eventEmitter = eventEmitter;
    }

    calculateValidMoves(boardState, jumpOnly = false) {
        this.validMoves = [];
        this.canJump = false;
        if (this.player === 1) {
            this.checkForValidMoves(boardState, this.position[0] + 1, this.position[1] + 1, jumpOnly);
            this.checkForValidMoves(boardState, this.position[0] + 1, this.position[1] - 1, jumpOnly);
            if (this.king) {
                this.checkForValidMoves(boardState, this.position[0] - 1, this.position[1] + 1, jumpOnly);
                this.checkForValidMoves(boardState, this.position[0] - 1, this.position[1] - 1, jumpOnly);
            }
        }
        if (this.player === 2) {
            this.checkForValidMoves(boardState, this.position[0] - 1, this.position[1] + 1, jumpOnly);
            this.checkForValidMoves(boardState, this.position[0] - 1, this.position[1] - 1, jumpOnly);
            if (this.king) {
                this.checkForValidMoves(boardState, this.position[0] + 1, this.position[1] + 1, jumpOnly);
                this.checkForValidMoves(boardState, this.position[0] + 1, this.position[1] - 1, jumpOnly);
            }
        }
    }
    checkForValidMoves(boardState, row, column, jumpOnly = false) {
        let jump = false;
        if (this.checkIfMoveIsOutOfBounds(row, column)) {
            return;
        }
        if (this.player === 1) {
            if (boardState[row][column].pieceId) {
                if (boardState[row][column].pieceId <= 12) {
                    return;
                } else {
                    this.checkIfPieceCanJump(row, column, boardState);
                    return;
                }
            }
        }
        if (this.player === 2) {
            if (boardState[row][column].pieceId) {
                if (boardState[row][column].pieceId > 12) {
                    return;
                } else {
                    this.checkIfPieceCanJump(row, column, boardState);
                    return;
                }
            }
        }
        if (!jumpOnly && jump === false) {
            this.validMoves.push({
                type: 'regular',
                position: [row, column],
                tileId: boardState[row][column].tileId,
            });
        }
    }

    checkIfPieceCanJump(row, column, boardState) {
        let offsetRow;
        let offsetColumn;
        //offset position to check if space is available to jump
        if (this.player === 1) {
            offsetRow = row + (row - this.position[0]);
            offsetColumn = column + (column - this.position[1]);
        } else {
            offsetRow = row - (this.position[0] - row);
            offsetColumn = column - (this.position[1] - column);
        }
        if (this.checkIfMoveIsOutOfBounds(offsetRow, offsetColumn)) {
            return false;
        }
        if (boardState[offsetRow][offsetColumn].pieceId) {
            return false;
        }
        this.validMoves.push({
            type: 'jump',
            position: [offsetRow, offsetColumn],
            tileId: boardState[offsetRow][offsetColumn].tileId,
            jumpedCoordinate: [row, column]
        });
        this.canJump = true;
        return true;
    }

    checkIfMoveIsOutOfBounds(row, column) {
        return row < 0 || row > 7 || column < 0 || column > 7;

    }

    invalidateNonJumpMoves() {
        this.validMoves.forEach((move, index) => {
            if (move.type !== 'jump') {
                delete this.validMoves[index];
            }
        });
    }

    addClickEvent() {
        this.element.addEventListener('click', () => {
            this.eventEmitter.emit('pieceSelected');
            if(this.validMoves.length === 0) { return; }
            this.element.classList.add('selected');
            this.highlightValidMoves();
        });
    }

    highlightValidMoves() {
        this.validMoves.forEach(move => {
            const validMove = document.getElementById(`tile${move.tileId}`);
            validMove.classList.add('highlighted');
        });
    }

    makeKing() {
        this.element.style.backgroundImage = "url('img/king" + this.player + ".png')";
        this.king = true;
    };
}