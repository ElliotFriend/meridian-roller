import { Client } from 'dice_game';
import { PUBLIC_STELLAR_NETWORK_PASSPHRASE, PUBLIC_STELLAR_RPC_URL } from '$env/static/public';

export function createClient(gameAddress: string): Client {
    return new Client({
        rpcUrl: PUBLIC_STELLAR_RPC_URL,
        contractId: gameAddress,
        networkPassphrase: PUBLIC_STELLAR_NETWORK_PASSPHRASE,
    });
};

export const deploy = Client.deploy;
