export default class Tile {
    
    constructor(tileElement, row, column, eventEmitter) {
        this.element = tileElement;
        this.position = [parseInt(row), parseInt(column)];
        this.eventEmitter = eventEmitter;
        this.addClickEvent();
    }

    addClickEvent() {
        this.element.addEventListener('click', () => {
            this.eventEmitter.emit('tileClicked', this);
        });
    }
}