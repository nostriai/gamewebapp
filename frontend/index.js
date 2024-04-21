import Coordinator from "./src/checkers/Coordinator.js";
import NDK from "@nostr-dev-kit/ndk";
const ndk = new NDK({
    explicitRelayUrls: ["wss://nostr.donky.social", "wss://nostr.huszonegy.world"],
});

const coordinator = new Coordinator();
await coordinator.setupNewGame();
await ndk.connect();
const user = ndk.getUser({
    npub: 'npub14uf9m3wsfpwpk9znef849pzxysylz8krhfj6d3c3vqa9kewqdkhs3nf7qs'
});
await user.fetchProfile();
let profileContainer = document.getElementById('profileInfo');
let profileName = document.createElement('h1');
profileName.innerHTML = "Hello, " + user.profile.name;
profileContainer.appendChild(profileName);
let profileAvatar = document.createElement('img');
profileAvatar.src = user.profile.image;
profileContainer.appendChild(profileAvatar);
