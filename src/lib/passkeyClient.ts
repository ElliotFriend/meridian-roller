import { Account, StrKey } from '@stellar/stellar-sdk/minimal';
import { Server } from '@stellar/stellar-sdk/minimal/rpc';
import { PasskeyKit, SACClient } from 'passkey-kit';

import {
    PUBLIC_STELLAR_RPC_URL,
    PUBLIC_STELLAR_NETWORK_PASSPHRASE,
    PUBLIC_NATIVE_CONTRACT_ADDRESS,
    PUBLIC_WALLET_WASM_HASH,
} from '$env/static/public';
import type { Tx } from '@stellar/stellar-sdk/minimal/contract';

export const mockPubkey = StrKey.encodeEd25519PublicKey(Buffer.alloc(32));
export const mockSource = new Account(mockPubkey, '0');

export const rpc = new Server(PUBLIC_STELLAR_RPC_URL);

export const account = new PasskeyKit({
    rpcUrl: PUBLIC_STELLAR_RPC_URL,
    networkPassphrase: PUBLIC_STELLAR_NETWORK_PASSPHRASE,
    walletWasmHash: PUBLIC_WALLET_WASM_HASH,
});

export const sac = new SACClient({
    networkPassphrase: PUBLIC_STELLAR_NETWORK_PASSPHRASE,
    rpcUrl: PUBLIC_STELLAR_RPC_URL,
});

export const native = sac.getSACClient(PUBLIC_NATIVE_CONTRACT_ADDRESS);

export async function send(tx: Tx) {
    return fetch('/api/send', {
        method: 'POST',
        body: JSON.stringify({
            xdr: tx.toXDR(),
        }),
    }).then(async (res) => {
        if (res.ok) return res.json();
        else throw await res.text();
    });
}

export async function getContractId(signer: string) {
    return fetch(`/api/contract/${signer}`).then(async (res) => {
        if (res.ok) return res.text();
        else throw await res.text();
    });
}

export async function fundContract(address: string) {
    return fetch(`/api/fund/${address}`).then(async (res) => {
        if (res.ok) return res.json();
        else throw await res.text();
    });
}

export async function getSalt() {
    return fetch('/api/salt').then(async (res) => {
        if (res.ok) return res.text();
        else throw await res.text();
    });
}

export async function sendDeploy(admin: string, token: string, numDice: number, numFaces: number) {
    return fetch('/api/game/deploy', {
        method: 'POST',
        body: JSON.stringify({
            admin,
            token,
            numDice,
            numFaces,
        }),
    }).then(async (res) => {
        if (res.ok) return res.text();
        else throw await res.text();
    });
}
