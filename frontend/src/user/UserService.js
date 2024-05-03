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
}