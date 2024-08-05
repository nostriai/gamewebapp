export default class BaseController {
    templateDir = '../static/templates/';
    async init() {
        await this.render();
    }

    async render() {
        throw new Error('Render method not implemented');
    }

    async getTemplate(path){
        const response = await fetch(this.templateDir+path);
        return await response.text();
    }
}