// import Coordinator from "./src/checkers/Coordinator.js";
import NDK, {NDKNip07Signer} from "@nostr-dev-kit/ndk";
import UserService from "./src/user/UserService.js";
import Home from "./src/controllers/Home.js";
import Router from "./src/router/Router.js";
import TurnHistory from "./src/controllers/TurnHistory.js";
import Training from "./src/controllers/Training.js";
try {
    const nip07signer = new NDKNip07Signer();
    const ndk = new NDK({
        explicitRelayUrls: ["ws:/localos.synology.me:7777"],
        signer: nip07signer
    });
    await ndk.connect();
    
    window.userService = new UserService(nip07signer, ndk);
    await window.userService.login();

    const routes = {
        '/': Home,
        '/turn-history': TurnHistory,
        '/training': Training
    };
    window.router = new Router(routes);
    await window.router.resolve();

} catch (error) {
    if(error.message === "NIP-07 extension not available"){
        alert("Please install NIP-07 extension to continue");
    }

    throw error;
}

