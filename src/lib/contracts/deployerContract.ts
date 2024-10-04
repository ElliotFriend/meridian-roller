import * as deployerSdk from 'deployer-sdk';
import {
    PUBLIC_STELLAR_RPC_URL,
    PUBLIC_DEPLOYER_CONTRACT_ADDRESS,
    PUBLIC_STELLAR_NETWORK_PASSPHRASE
} from '$env/static/public';

export default new deployerSdk.Client({
    networkPassphrase: PUBLIC_STELLAR_NETWORK_PASSPHRASE,
    contractId: PUBLIC_DEPLOYER_CONTRACT_ADDRESS,
    rpcUrl: PUBLIC_STELLAR_RPC_URL
});
