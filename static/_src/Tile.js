export default class Tile {
    constructor(tileElement, row, column) {
        // linked DOM element
        this.element = tileElement;
        // position in gameboard
        this.position = [parseInt(row), parseInt(column)];
    }

    // if tile is in range from the piece
    inRange(piece, pieces) {
        for (let k of pieces.values()) {
            if (k.position[0] === this.position[0] && k.position[1] === this.position[1]) return 'wrong';
        }
        if (!piece.king && piece.player === 1 && this.position[0] < piece.position[0]) return 'wrong';
        if (!piece.king && piece.player === 2 && this.position[0] > piece.position[0]) return 'wrong';
        if (Math.hypot(this.position[0] - piece.position[0], this.position[1] - piece.position[1]) == Math.sqrt(2)) {
            // regular move
            return 'regular';
        } else if (Math.hypot(this.position[0] - piece.position[0], this.position[1] - piece.position[1]) == 2 * Math.sqrt(2)) {
            // jump move
            return 'jump';
        }
    };
}