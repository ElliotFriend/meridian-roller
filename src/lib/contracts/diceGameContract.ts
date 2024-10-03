import * as diceGameSdk from 'dice-game';
import {
    PUBLIC_STELLAR_RPC_URL,
    PUBLIC_GAME_CONTRACT_ADDRESS,
    PUBLIC_STELLAR_NETWORK_PASSPHRASE
} from '$env/static/public';

const client = new diceGameSdk.Client({
    networkPassphrase: PUBLIC_STELLAR_NETWORK_PASSPHRASE,
    contractId: PUBLIC_GAME_CONTRACT_ADDRESS,
    rpcUrl: PUBLIC_STELLAR_RPC_URL
});

export const spec = client.spec;
export const address = diceGameSdk.networks.testnet;
export default client;
