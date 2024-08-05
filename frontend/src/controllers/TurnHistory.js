import BaseController from './BaseController.js';
export default class TurnHistory extends BaseController {

    async render() {
        await window.userService.fetchMessagesForSelf();
    }

}