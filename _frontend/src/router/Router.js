export default class Router {

    static EVENTS = {
        NAVIGATE: 'navigate',
    }
    constructor(routes) {
        this.routes = routes;
        this.#init();
    }


    #init() {
        window.addEventListener('popstate', async () => {
            await this.resolve();
        });
        window.addEventListener(Router.EVENTS.NAVIGATE, async () => {
            await this.resolve();
        });
    }

    async resolve() {
        const path = window.location.pathname;
        if (this.routes[path] === undefined) {
            console.log('404');
            return; // @todo return 404
        }
        const controller = new this.routes[path]();
        await controller.init();
    }


    navigate(path) {
        window.history.pushState({}, '', path);
        window.dispatchEvent(new CustomEvent(Router.EVENTS.NAVIGATE));
    }



}