from nostr_sdk import Client, nip04_encrypt, Event, NostrSigner, Keys
from nostr.User import User
import asyncio
import argparse


parser = argparse.ArgumentParser()

parser.add_argument('--pubkey', help='public key of the user')
parser.add_argument('--secret', help='secret key of the user')

args = parser.parse_args()
if args.pubkey and args.secret:
    user = User(args.pubkey, args.secret)
    messages = asyncio.run(user.fetchMessages('wss://longhorn.bgp.rodeo'))
    for message in messages:
        print(message)

else:
    print('Please provide both the public and secret keys of the user with the --pubkey and --secret flags')

