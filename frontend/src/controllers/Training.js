import BaseController from './BaseController.js';
import TrainingGame from "../checkers/TrainingGame.js";
import { generateSecretKey, getPublicKey} from "nostr-tools/pure";

export default class Training extends BaseController {
    async render() {
        const player1 = this.createUser();
        const player2 = this.createUser();
        await fetch('/game/log-training-users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({player1: player1, player2: player2, date: this.getCurrentDateTime()})
        })
        const game = new TrainingGame(player1, player2);
        await game.setupNewGame();
    }


    createUser() {
        return {
            publicKey: 'somePublicKey',
            privateKey: 'somePrivateKey',
        }
    }

    getCurrentDateTime() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

}