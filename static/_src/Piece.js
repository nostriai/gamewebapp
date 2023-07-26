export default class Piece {
    constructor(pieceId, element, position, player) {
        this.pieceId = pieceId;
        this.element = element;
        this.position = position;
        // when jump exists, regular move is not allowed
        // since there is no jump at round 1, all pieces are allowed to move initially
        this.allowedtomove = true;
        // which player's piece is it
        this.player = player;
        // figure out player by piece id
        // makes object a king
        this.king = false;
        this.validSpaces = [];
    }
    makeKing() {
        this.element.style.backgroundImage = "url('img/king" + this.player + ".png')";
        this.king = true;
    };

    move(top, left) {
        this.element.style.top = top;
        this.element.style.left = left;
    }

    deSelectElement() {
        this.element.classList.remove('selected');
    }

    selectElement() {
        this.element.classList.add('selected');
    }

    isNotBackwardsMove(tile) {
        if (this.player == 1 && this.king == false) {
            if (tile.position[0] < this.position[0]) return false;
        } else if (this.player == 2 && this.king == false) {
            if (tile.position[0] > this.position[0]) return false;
        }
        return true;
    }


}