import BaseController from './BaseController.js';
import TrainingGame from "../checkers/TrainingGame.js";
export default class Training extends BaseController {
    async render() {
        const game = new TrainingGame();
        await game.setupNewGame()
    }

}