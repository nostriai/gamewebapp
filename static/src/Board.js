import Tile from "./Tile.js";
import Piece from "./Piece.js";

export default class Board {
    board = [
        [{}, {tileId: 1, pieceId: 1}, {}, {tileId: 2, pieceId: 2}, {}, {tileId: 3, pieceId: 3}, {}, {tileId: 4, pieceId: 4}],
        [{tileId: 5, pieceId: 5}, {}, {tileId: 6, pieceId: 6}, {}, {tileId: 7, pieceId: 7}, {}, {tileId: 8, pieceId: 8}, {}],
        [{}, {tileId: 9, pieceId: 9}, {}, {tileId: 10, pieceId: 10}, {}, {tileId: 11, pieceId: 11}, {}, {tileId: 12, pieceId: 12}],
        [{tileId: 13, pieceId: null}, {}, {tileId: 14, pieceId: null}, {}, {tileId: 15, pieceId: null}, {}, {tileId: 16, pieceId: null}, {}],
        [{}, {tileId: 17, pieceId: null}, {}, {tileId: 18, pieceId: null}, {}, {tileId: 19, pieceId: null}, {}, {tileId: 20, pieceId: null}],
        [{tileId: 21, pieceId: 13}, {}, {tileId: 22, pieceId: 14}, {}, {tileId: 23, pieceId: 15}, {}, {tileId: 24, pieceId: 16}, {}],
        [{}, {tileId: 25, pieceId: 17}, {}, {tileId: 26, pieceId: 18}, {}, {tileId: 27, pieceId: 19}, {}, {tileId: 28, pieceId: 20}],
        [{tileId: 29, pieceId: 21}, {}, {tileId: 30, pieceId: 22}, {}, {tileId: 31, pieceId: 23}, {}, {tileId: 32, pieceId: 24}, {}]
    ];

    pieces = new Map();
    tiles = new Map();

    score = {
        player1: 0,
        player2: 0
    };
    playerTurn = 1;
    jumpexist = false;
    continuousjump = false;
    tilesElement = document.querySelector('.tiles');
    dictionary = ["0vmin", "10vmin", "20vmin", "30vmin", "40vmin", "50vmin", "60vmin", "70vmin", "80vmin", "90vmin"];
    initialize() {
        this.renderBoard();
        this.addEventListeners();
    }

    renderBoard() {
        this.board.forEach((row, rowIndex) => {
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
        this.checkIfJumpExists()
    }

    renderTile(row, column, rowIndex) {
        const tileElement = document.createElement('div');
        tileElement.className = 'tile';
        tileElement.id = 'tile' + row[column].tileId;
        tileElement.style.top = this.dictionary[rowIndex];
        tileElement.style.left = this.dictionary[column];
        this.tilesElement.appendChild(tileElement);
        this.tiles.set(row[column].tileId, new Tile(tileElement, rowIndex, column));
    }

    renderPiece(row, column, rowIndex) {
        let pieceElement = document.createElement('div');
        pieceElement.className = 'piece';
        pieceElement.id = row[column].pieceId;
        pieceElement.style.top = this.dictionary[rowIndex];
        pieceElement.style.left = this.dictionary[column];
        let playerPiecesContainer = document.querySelector(`.player${this.getPlayerIdByPieceId(row[column].pieceId)}pieces`);
        playerPiecesContainer.appendChild(pieceElement);
        const piece = new Piece(
            row[column].pieceId,
            pieceElement,
            [rowIndex, column],
            this.getPlayerIdByPieceId(row[column].pieceId)
        );
        piece.allowedtomove = false;
        this.pieces.set(row[column].pieceId, piece);
    }

    getPlayerIdByPieceId(pieceId) {
        return parseInt(pieceId) > 12 ? 2 : 1;
    }

    isValidPlaceToMove(row, column) {
        if ((row !== 0 && !row)  || (column !== 0 && !column)) return false;
        if (row < 0 || row > 7 || column < 0 || column > 7) return false;
        if (this.board[row][column] && !this.board[row][column].pieceId) {
            return true;
        }
        return false;
    }

    movePiece(tile, piece) {
        piece.deSelectElement();
        if (!this.isValidPlaceToMove(tile.position[0], tile.position[1])) return false;
        if(!piece.isNotBackwardsMove(tile)) return false;
        // remove the mark from Board.board and put it in the new spot
        this.board[piece.position[0]][piece.position[1]].pieceId = null;
        this.board[tile.position[0]][tile.position[1]].pieceId = piece.pieceId;

        piece.position = [tile.position[0], tile.position[1]];
        // change the CSS using board's dictionary
        piece.move(this.dictionary[piece.position[0]], this.dictionary[piece.position[1]]);

        if (!piece.king && (piece.position[0] === 0 || piece.position[0] === 7)) {
            piece.makeKing();
        }
        return true;
    }

    // tests if piece can jump anywhere
    canJumpAny(piece) {
        piece.validSpaces = [];
        let canJump = false;
        let positions = [
            [parseInt(piece.position[0]) + 2, parseInt(piece.position[1]) + 2],
            [parseInt(piece.position[0]) + 2, parseInt(piece.position[1]) - 2],
            [parseInt(piece.position[0]) - 2, parseInt(piece.position[1]) + 2],
            [parseInt(piece.position[0]) - 2, parseInt(piece.position[1]) - 2]
        ];
        positions.forEach((position) => {
            let canJumpAny = this.canOpponentJump(position, piece);
            if (canJumpAny) {
                piece.validSpaces.push(canJumpAny.position);
                canJump = canJumpAny.piece;
            }
        });
        return canJump;
    };
    canOpponentJump(newPosition, piece) {
        // find what the displacement is
        let dx = newPosition[1] - piece.position[1];
        let dy = newPosition[0] - piece.position[0];
        // make sure object doesn't go backwards if not a king
        if (piece.player === 1 && piece.king === false) {
            if (newPosition[0] < piece.position[0]) return false;
        } else if (piece.player === 2 && piece.king === false) {
            if (newPosition[0] > piece.position[0]) return false;
        }
        // must be in bounds
        if (newPosition[0] > 7 || newPosition[1] > 7 || newPosition[0] < 0 || newPosition[1] < 0) return false;

        // middle tile where the piece to be conquered sits
        let tileToCheckx = parseInt(piece.position[1]) + dx / 2;
        let tileToChecky = parseInt(piece.position[0]) + dy / 2;
        if (tileToCheckx > 7 || tileToChecky > 7 || tileToCheckx < 0 || tileToChecky < 0) return false;

        // if there is a piece there and there is no piece in the space after that
        if (!this.isValidPlaceToMove(tileToChecky, tileToCheckx) && this.isValidPlaceToMove(newPosition[0], newPosition[1])) {
            // find which object instance is sitting there
            for (let pieceIndex = 1; pieceIndex <= this.pieces.size; pieceIndex++) {
                if (this.pieces.get(pieceIndex).position[0] == tileToChecky && this.pieces.get(pieceIndex).position[1] == tileToCheckx) {
                    if (piece.player != this.pieces.get(pieceIndex).player) {
                        // return the piece sitting there
                        return {
                            'piece': this.pieces.get(pieceIndex),
                            'position': [newPosition[1], newPosition[0]]
                    };
                    }
                }
            }
        }
        return false;
    };

    opponentJump(tile, piece) {
        let pieceToRemove = this.canOpponentJump(tile.position, piece);
        //if there is a piece to be removed, remove it
        if (pieceToRemove.piece) {
            this.remove(pieceToRemove.piece);
            return true;
        }
        return false;
    };

    remove(piece) {
        // remove it and delete it from the game board
        piece.element.style.display = "none";
        if (piece.player === 1) {
            document.querySelector('#player2').innerHTML += "<div class='capturedPiece'></div>";
            this.score.player2 += 1;
        }
        if (piece.player === 2) {
            document.querySelector('#player1').innerHTML += "<div class='capturedPiece'></div>";
            this.score.player1 += 1;
        }
        this.board[piece.position[0]][piece.position[1]].pieceId = null;
        // reset position so it doesn't get picked up by the for loop in the canOpponentJump method
        piece.position = [];
        // this.pieces.delete(piece.pieceId);
        let playerWon = this.checkIfAnybodyWon();
        if (playerWon) {
            document.querySelector('#winner').innerHTML = "Player " + playerWon + " has won!";
        }
    };

    checkIfAnybodyWon() {
        if (this.score.player1 === 12) {
            return 1;
        } else if (this.score.player2 === 12) {
            return 2;
        }
        return false;
    }

    async changePlayerTurn() {
        if (this.playerTurn === 1) {
            this.playerTurn = 2;
            document.querySelector('.turn').style.background = 'linear-gradient(to right, transparent 50%, #BEEE62 50%)';
            // let nextMove = await this.getNextTurn();
            // if (nextMove) {
            //     const piece = this.pieces.get(nextMove.pieceId);
            //     const tile = this.tiles.get(nextMove.tileId);
            //     this.movePiece(tile, piece);
            //     this.playerTurn = 1;
            // }

        } else {
            this.playerTurn = 1;
            document.querySelector('.turn').style.background = 'linear-gradient(to right, #BEEE62 50%, transparent 50%)';
        }
        this.checkIfJumpExists();
        console.log(this.pieces.get(9));
    }

    clear() {
        location.reload();
    }

    checkIfJumpExists() {
        this.jumpexist = false;
        this.continuousjump = false;
        for (let [pieceId, piece] of this.pieces) {
            piece.allowedtomove = false;
            if (piece.position.length != 0 && piece.player == this.playerTurn && this.canJumpAny(piece)) {
                this.jumpexist = true;
                piece.allowedtomove = true;
            }
        }
        if (!this.jumpexist) {
            for (let [pieceId, piece] of this.pieces) {
                if (this.canPieceMove(piece)) {
                    piece.allowedtomove = true;
                } else {
                    piece.allowedtomove = false;
                }
            }
        }
    }

    canPieceMove(piece)
    {
        let canMove = false;
        piece.validSpaces = [];
        let positions = [
            [parseInt(piece.position[0]) + 2, parseInt(piece.position[1]) + 2],
            [parseInt(piece.position[0]) + 2, parseInt(piece.position[1]) - 2],
            [parseInt(piece.position[0]) - 2, parseInt(piece.position[1]) + 2],
            [parseInt(piece.position[0]) - 2, parseInt(piece.position[1]) - 2]
        ];
        positions.forEach(position => {
            let validPosition = this.isValidSpace(position, piece);
            if (validPosition) {
                canMove = true;
                piece.validSpaces.push(validPosition);
            }
        });
        return canMove;
    }

    isValidSpace(newPosition, piece) {
        // find what the displacement is
        let dx = newPosition[1] - piece.position[1];
        let dy = newPosition[0] - piece.position[0];
        // make sure object doesn't go backwards if not a king
        if (piece.player === 1 && piece.king === false) {
            if (newPosition[0] < piece.position[0]) return false;
        } else if (piece.player === 2 && piece.king === false) {
            if (newPosition[0] > piece.position[0]) return false;
        }
        // must be in bounds
        if (newPosition[0] > 7 || newPosition[1] > 7 || newPosition[0] < 0 || newPosition[1] < 0) return false;
        // middle tile where the piece to be conquered sits
        let tileToCheckx = parseInt(piece.position[1]) + dx / 2;
        let tileToChecky = parseInt(piece.position[0]) + dy / 2;
        if (tileToCheckx > 7 || tileToChecky > 7 || tileToCheckx < 0 || tileToChecky < 0) return false;

        if (!this.isValidPlaceToMove(tileToChecky, tileToCheckx)) {
            for (let pieceIndex = 1; pieceIndex <= this.pieces.size; pieceIndex++) {
                if (this.pieces.get(pieceIndex).position[0] == tileToChecky && this.pieces.get(pieceIndex).position[1] == tileToCheckx){
                    return false;
                }
            }
        }
        return [tileToCheckx, tileToChecky];
    }

    addEventListeners() {
        this.addClearGameListener();
        this.addPieceListener();
        this.addTileListener();
    }

    addClearGameListener() {
        let clearGameButton = document.getElementById('cleargame');
        clearGameButton.addEventListener('click', () => {
            this.clear();
        });
    }

    addPieceListener() {
        const piecesElems = document.querySelectorAll('.piece');
        if(piecesElems && piecesElems.length > 0) {
            piecesElems.forEach((piece) => {
                piece.addEventListener('click', () => {
                    this.removeHighlightedTiles();
                    let selected;
                    let parentClass = piece.parentNode.className.split(' ')[0];
                    let isPlayersTurn = parentClass === "player" + this.playerTurn + "pieces";
                    if (isPlayersTurn) {
                        if (!this.continuousjump && this.pieces.get(parseInt(piece.id)).allowedtomove) {
                            if (piece.classList.contains('selected')) {
                                selected = true;
                            }
                            piecesElems.forEach(function (piece) {
                                piece.classList.remove('selected');
                            });
                            if (!selected) {
                                piece.classList.add('selected');
                                this.highlightTilesForPiece(this.pieces.get(parseInt(piece.id)));
                            }
                        } else {
                            let exist = "jump exist for other pieces, that piece is not allowed to move";
                            let continuous = "continuous jump exist, you have to jump the same piece";
                            let message = !this.continuousjump ? exist : continuous;
                            console.log(message);
                        }
                    }
                });
            });
        }
    }

    removeHighlightedTiles() {
        let tiles = document.getElementsByClassName('tile');
        for (let i = 0; i < tiles.length; i++) {
            tiles[i].classList.remove('highlighted');
        }
    }

    highlightTilesForPiece(piece) {
        piece.validSpaces.forEach((position) => {
            this.tiles.get(this.board[position[1]][position[0]].tileId).element.classList.add('highlighted');
        });
    }

    addTileListener() {
        //move piece when tile is clicked
        let tilesElems = document.getElementsByClassName('tile');
        for (let i = 0; i < tilesElems.length; i++) {
            tilesElems[i].addEventListener('click', () => {
                // Make sure a piece is selected
                if (document.getElementsByClassName('selected').length !== 0) {
                    // Find the tile object being clicked
                    let tileId = tilesElems[i].id.replace(/tile/, '');
                    let tile = this.tiles.get(parseInt(tileId));
                    // Find the piece being selected
                    let pieceId = document.getElementsByClassName('selected')[0].id;
                    let piece = this.pieces.get(parseInt(pieceId));
                    // Check if the tile is in range from the object
                    let inRange = tile.inRange(piece, this.pieces);
                    if (inRange !== 'wrong') {
                        // If the move needed is a jump, then move it but also check if another move can be made (double and triple jumps)
                        if (inRange === 'jump') {
                            if (this.opponentJump(tile, piece)) {
                                this.movePiece(tile, piece);
                                if (this.canJumpAny(piece)) {
                                   piece.selectElement();
                                    // Exist continuous jump, you are not allowed to de-select this piece or select other pieces
                                    this.continuousjump = true;
                                } else {
                                    this.changePlayerTurn();
                                    this.removeHighlightedTiles();
                                }
                            }
                        }
                        // If it's a regular move, then move it if no jumping is available
                        else if (inRange === 'regular' && !this.jumpexist) {
                            if (!this.canJumpAny(piece)) {
                                this.movePiece(tile, piece);
                                this.changePlayerTurn(piece.position[0], piece.position[1]);
                                this.removeHighlightedTiles();
                            } else {
                                alert("You must jump when possible!");
                            }
                        }
                    }
                }
            });
        }
    }

    async getNextTurn() {
        let nextMove = await fetch('/api/get-next-move', {
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
        let boardData = structuredClone(this.board);
        boardData.forEach((row) => {
            row.forEach((tile) => {
                if(tile.pieceId) {
                    tile.piece = this.pieces.get(tile.pieceId);
                }
            });
        });
        return boardData;
    }
}


