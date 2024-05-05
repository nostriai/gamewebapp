import BaseController from './BaseController.js';
import Coordinator from '../checkers/Coordinator.js';
export default class TurnHistory extends BaseController {
    profileContainer;

    async render() {
        await window.userService.fetchMessages();
    }

}