export default class BaseController {
    templateDir = '../static/templates/';
    async init() {
        await this.render();
    }

    async render() {
        const template = await this.getTemplate(this.baseRenderTpl);
        document.body.innerHTML = template;
    }

    async getTemplate(path){
        const response = await fetch(this.templateDir+path);
        return await response.text();
    }
}