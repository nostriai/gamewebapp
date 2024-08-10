import { NDKEvent, NDKKind } from "@nostr-dev-kit/ndk";

export default class User {
    connection;
    signer;
    user;
    constructor(signer, connection){
        this.signer = signer;
        this.connection = connection;
    }

    async login(){
        try {
            this.user = await this.signer.user();
        } catch (error) {
            return false;
        }

        if(!this.user.npub){
            this.user = null;
            return false;
        }
        return true;
    }

    isLoggedIn(){
        return this.user !== null;
    }

    async sendPrivateMessageToSelf(message){
        const event = new NDKEvent(this.connection);
        event.kind = NDKKind.EncryptedDirectMessage;
        event.content = message;
        event.tags = [['p', this.user.pubkey]];
        await event.encrypt(this.user, this.signer)
        await event.publish();
    }

    async fetchMessagesForSelf(){
        const filter = {kinds: [NDKKind.EncryptedDirectMessage], authors: [this.user.pubkey]};
        const events = await this.connection.fetchEvents(filter);
        for(const event of events){
            try{
                console.log(await this.signer.decrypt(this.user, event.content));
            } catch(error){
                //do nothing
            }
        }
    }


}