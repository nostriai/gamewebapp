export default class EventEmitter {
    events = {};

    on(name, callback) {
        if(!this.events[name]) {
            this.events[name] = [];
        }
        this.events[name].push(callback);
    }

    remove(name, callback = null) {
        if(!this.events[name]) {
            return;
        }
        if(callback === null) {
            delete this.events[name];
            return;
        }
        this.events[name] = this.events[name].filter(eventCallback => eventCallback !== callback);
    }

    emit(name, data) {
        if(!this.events[name]) {
            return;
        }
        this.events[name].forEach(callback => callback(data));
    }
}