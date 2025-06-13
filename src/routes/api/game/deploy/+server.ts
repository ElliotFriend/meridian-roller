import type { RequestHandler } from './$types';
import { deploy } from '$lib/contracts/dice_game';
import { contract, Keypair } from '@stellar/stellar-sdk';
import {
    PUBLIC_FUNDER_PUBLIC_KEY,
    PUBLIC_GAME_WASM_HASH,
    PUBLIC_NATIVE_CONTRACT_ADDRESS,
    PUBLIC_STELLAR_NETWORK_PASSPHRASE,
    PUBLIC_STELLAR_RPC_URL,
} from '$env/static/public';
import { PRIVATE_FUNDER_SECRET_KEY } from '$env/static/private';
import { basicNodeSigner } from '@stellar/stellar-sdk/contract';

export const POST: RequestHandler = async ({ request }) => {
    // get the details for the new game
    const {
        admin,
        token,
        numDice,
        numFaces,
    }: { admin: string; token: string; numDice: number; numFaces: number } = await request.json();

    // deploy a new contract, built from wasmHash
    const kp = Keypair.fromSecret(PRIVATE_FUNDER_SECRET_KEY);
    const at = await deploy(
        {
            admin: admin,
            token_address: token,
            num_dice: numDice,
            num_faces: numFaces,
        },
        {
            networkPassphrase: PUBLIC_STELLAR_NETWORK_PASSPHRASE,
            rpcUrl: PUBLIC_STELLAR_RPC_URL,
            wasmHash: PUBLIC_GAME_WASM_HASH,
            publicKey: kp.publicKey(),
            signTransaction: basicNodeSigner(kp, PUBLIC_STELLAR_NETWORK_PASSPHRASE).signTransaction,
        },
    );

    const { result } = await at.signAndSend();
    console.log('result', result.options.contractId);
    // return the game contract address

    return new Response(result.options.contractId);
};
