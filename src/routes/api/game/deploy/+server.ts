import type { RequestHandler } from './$types';
// import diceGameSdk from '$lib/contracts/diceGameContract';
// import { contract, Keypair } from '@stellar/stellar-sdk';
import {
    PUBLIC_FUNDER_PUBLIC_KEY,
    PUBLIC_GAME_WASM_HASH,
    PUBLIC_LAUNCHTUBE_URL,
    PUBLIC_NATIVE_CONTRACT_ADDRESS,
    PUBLIC_STELLAR_NETWORK_PASSPHRASE,
    PUBLIC_STELLAR_RPC_URL
} from '$env/static/public';
import { PRIVATE_FUNDER_SECRET_KEY, PRIVATE_LAUNCHTUBE_JWT } from '$env/static/private';
import { xdr, scValToNative} from '@stellar/stellar-sdk/minimal';
import { server } from '$lib/server/passkeyServer';
import { error } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ fetch, request }) => {
    // get the details for the deploy operation
    const { func, auth }: { func: string, auth: string } = await request.json();

    // send that to launchtube
    const resp = await fetch(PUBLIC_LAUNCHTUBE_URL, {
        method: 'POST',
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": `Bearer ${PRIVATE_LAUNCHTUBE_JWT}`,
        },
        body: new URLSearchParams({
            func: func,
            auth: JSON.stringify([auth]),
        })
    })


    if (!resp.ok) {
        console.log('error', (await resp.json()))
        error(500, "Error sending deploy operation to launchtube")
    }

    const { resultMetaXdr }: { resultMetaXdr: string} = await resp.json()
    const txMeta = xdr.TransactionMeta.fromXDR(resultMetaXdr, 'base64');
    const sorobanMeta = txMeta.v3().sorobanMeta();
    let deployedGame;
    if (sorobanMeta) {
        deployedGame = scValToNative(sorobanMeta.returnValue());
    }

    return new Response(deployedGame);
};
