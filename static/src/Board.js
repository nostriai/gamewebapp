import Piece from "./Piece.js";
import Tile from "./Tile.js";

export default class Board {
    boardState = [
        [{}, {tileId: 1, pieceId: 1}, {}, {tileId: 2, pieceId: 2}, {}, {tileId: 3, pieceId: 3}, {}, {tileId: 4, pieceId: 4}],
        [{tileId: 5, pieceId: 5}, {}, {tileId: 6, pieceId: 6}, {}, {tileId: 7, pieceId: 7}, {}, {tileId: 8, pieceId: 8}, {}],
        [{}, {tileId: 9, pieceId: 9}, {}, {tileId: 10, pieceId: 10}, {}, {tileId: 11, pieceId: 11}, {}, {tileId: 12, pieceId: 12}],
        [{tileId: 13, pieceId: null}, {}, {tileId: 14, pieceId: null}, {}, {tileId: 15, pieceId: null}, {}, {tileId: 16, pieceId: null}, {}],
        [{}, {tileId: 17, pieceId: null}, {}, {tileId: 18, pieceId: null}, {}, {tileId: 19, pieceId: null}, {}, {tileId: 20, pieceId: null}],
        [{tileId: 21, pieceId: 13}, {}, {tileId: 22, pieceId: 14}, {}, {tileId: 23, pieceId: 15}, {}, {tileId: 24, pieceId: 16}, {}],
        [{}, {tileId: 25, pieceId: 17}, {}, {tileId: 26, pieceId: 18}, {}, {tileId: 27, pieceId: 19}, {}, {tileId: 28, pieceId: 20}],
        [{tileId: 29, pieceId: 21}, {}, {tileId: 30, pieceId: 22}, {}, {tileId: 31, pieceId: 23}, {}, {tileId: 32, pieceId: 24}, {}]
    ];
    tilesContainer = document.querySelector(".tiles");
    tilesPositions = ["0vmin", "10vmin", "20vmin", "30vmin", "40vmin", "50vmin", "60vmin", "70vmin", "80vmin", "90vmin"];

    pieces = new Map();
    tiles = new Map();

    constructor(eventEmitter) {
        this.eventEmitter = eventEmitter;
    }

    initBoard() {
        this.boardState.forEach((row, rowIndex) => {
            for (let column in row) {
                column = parseInt(column);
                if(row[column].tileId) {
                    this.renderTile(row, column, rowIndex);
                }
                if(row[column].pieceId) {
                    this.renderPiece(row, column, rowIndex);
                }
            }
        });
        this.eventEmitter.emit('onTurnStart');
    }

    renderTile(row, column, rowIndex) {
        const tileElement = document.createElement('div');
        tileElement.className = 'tile';
        tileElement.id = 'tile' + row[column].tileId;
        tileElement.style.top = this.tilesPositions[rowIndex];
        tileElement.style.left = this.tilesPositions[column];
        this.tilesContainer.appendChild(tileElement);
        this.tiles.set(row[column].tileId, new Tile(tileElement, rowIndex, column, this.eventEmitter));
    }

    renderPiece(row, column, rowIndex) {
        let pieceElement = document.createElement('div');
        pieceElement.className = 'piece';
        pieceElement.id = row[column].pieceId;
        pieceElement.style.top = this.tilesPositions[rowIndex];
        pieceElement.style.left = this.tilesPositions[column];
        let playerPiecesContainer = document.querySelector(`.player${this.getPlayerByPieceId(row[column].pieceId)}pieces`);
        playerPiecesContainer.appendChild(pieceElement);
        const piece = new Piece(
            row[column].pieceId,
            pieceElement,
            [rowIndex, column],
            this.getPlayerByPieceId(row[column].pieceId),
            this.eventEmitter
        );
        piece.lastTileId = this.boardState[rowIndex][column]['tileId'];
        this.pieces.set(row[column].pieceId, piece);
    }

    getPlayerByPieceId(pieceId) {
        return parseInt(pieceId) > 12 ? 2 : 1;
    }

    getSelectedPiece() {
       return this.pieces.get(parseInt(document.querySelector('.piece.selected').id));
    }

    movePiece(piece) {
        piece.element.style.top = this.tilesPositions[piece.position[0]];
        piece.element.style.left = this.tilesPositions[piece.position[1]];
        this.eventEmitter.emit('pieceMoved', piece);
    }

    removePiece(jumpedPieceId) {
        let jumpedPiece = this.pieces.get(jumpedPieceId);
        jumpedPiece.element.remove();
        this.pieces.delete(jumpedPieceId);
    }
}