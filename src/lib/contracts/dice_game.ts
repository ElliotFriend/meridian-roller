import * as Client from 'dice_game';
import { PUBLIC_STELLAR_NETWORK_PASSPHRASE, PUBLIC_STELLAR_RPC_URL } from '$env/static/public';

export const createClient = (gameAddress: string): Client.Client => {
    return new Client.Client({
        rpcUrl: PUBLIC_STELLAR_RPC_URL,
        contractId: gameAddress,
        networkPassphrase: PUBLIC_STELLAR_NETWORK_PASSPHRASE,
    });
};

export const deploy = Client.Client.deploy;
