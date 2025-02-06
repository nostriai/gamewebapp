import BaseController from './BaseController.js';
import Coordinator from '../checkers/Coordinator.js';
export default class Home extends BaseController {
    profileContainer;

    async render() {
        const game = new Coordinator();
        await game.setupNewGame();
        this.#prepareElements();
    }

    #prepareElements() {
        this.profileContainer = document.getElementById('profileInfo');
        this.#prepareLogin();
    }


    #setupConnectButtonListner() {
        const connectButton = document.getElementById('connectButton');
        connectButton.addEventListener('click', async () => {
            const resp = await window.userService.login();
            if(resp){
                connectButton.remove();
            }
        });
    }

    #prepareLogin() {
       if(!window.userService.isLoggedIn()){
           this.#renderLoginButton();
           this.#setupConnectButtonListner();
           return;
       }
        this.#renderProfileInfo();       
    }

    #renderLoginButton () {
        const loginButton = document.createElement('button');
        loginButton.id = 'connectButton';
        loginButton.innerText = 'Connect to save data';
        this.profileContainer.appendChild(loginButton);
    }

    #renderProfileInfo() {
        const profileInfo = document.createElement('div');
        profileInfo.id = 'npubInfo'
        const npub = window.userService.user.npub;
        profileInfo.innerText = `Connected as ${npub.slice(0, 10) + "..." + npub.slice(-4)}`;
        this.profileContainer.appendChild(profileInfo);
    }
}