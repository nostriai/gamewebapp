from nostr_sdk import (Client, Keys, Kind, Event,
                       EventBuilder, KindEnum, PublicKey, SecretKey, NostrSigner, init_logger, LogLevel, nip04_encrypt,
                       Filter, EventSource, nip04_decrypt, Tag)
import time
import inspect


class User:
    def __init__(self, pubkey=None, secret=None):
        self.keys = None
        self.pubkey = None
        self.secret = None
        if pubkey and secret:
            self.pubkey = PublicKey.from_hex(pubkey)
            self.secret = SecretKey.from_hex(secret)
            self.keys = Keys(self.secret)
        else:
            self.generateKeys()
        self.signer = NostrSigner.keys(Keys(self.secret))
        self.client = Client(self.signer)

    def generateKeys(self):
        self.keys = Keys.generate()
        self.pubkey = self.keys.public_key()
        self.secret = self.keys.secret_key()

    async def sendMessage(self, message: str, recipientPubkey: PublicKey, relay: str):
        await self.client.add_relay(relay)
        await self.client.connect()
        encryptedMessage = nip04_encrypt(self.secret, recipientPubkey, message)
        recipientTag = Tag.public_key(recipientPubkey)
        eventBuilder = EventBuilder(content=encryptedMessage, tags=[recipientTag], kind=Kind(4))
        event = eventBuilder.to_event(self.keys)
        eventId = await self.client.send_event(event)

    async def fetchMessages(self, relay: str):
        await self.client.add_relay(relay)
        await self.client.connect()

        source = EventSource.relays()
        filter = Filter().kind(Kind(4)).pubkey(self.pubkey)
        events = await self.client.get_events_of([filter], source)
        for event in events:
            decryptedMessage = nip04_decrypt(self.secret, event.author(), event.content())
            print(decryptedMessage)

    def getPublicKeyHex(self):
        return self.pubkey.to_hex()

    def getSecretHex(self):
        return self.secret.to_hex()
