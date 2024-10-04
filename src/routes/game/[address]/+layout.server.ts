import { error, redirect } from '@sveltejs/kit';
import { Contract, nativeToScVal, scValToNative, StrKey, xdr } from '@stellar/stellar-sdk';
import { server } from '$lib/server/passkeyServer';
import type { LayoutServerLoad } from './$types';
import { PUBLIC_GAME_WASM_HASH } from '$env/static/public';

export const load = (async ({ params }) => {
    const contractAddress = params.address;
    if (!contractAddress) {
        error(404, {
            message: 'missing contract address'
        });
    }
    if (!StrKey.isValidContract(contractAddress)) {
        error(400, {
            message: 'invalid contract address'
        });
    }

    const contract = new Contract(contractAddress);
    let instance = await server.rpc?.getLedgerEntries(contract.getFootprint());

    let wasmHash = instance?.entries[0].val
        .contractData()
        .val()
        .instance()
        .executable()
        .wasmHash()
        .toString('hex');
    if (wasmHash !== PUBLIC_GAME_WASM_HASH) {
        error(400, {
            message: 'requested contract is not a game'
        });
    }

    let instanceStorage: Record<string, any> = {};
    instance?.entries[0].val
        .contractData()
        .val()
        .instance()
        .storage()
        ?.forEach((v) => {
            instanceStorage[scValToNative(v.key()).toString()] = scValToNative(v.val());
        });

    if (!Object.entries(instanceStorage).length) {
        error(400, {
            message: 'uninitialized contract'
        });
    }

    return {
        gameAddress: contractAddress,
        tokenAddress: instanceStorage.TokenAddress,
        gameAdmin: instanceStorage.Admin,
        numFaces: instanceStorage.NumFaces
    };
}) satisfies LayoutServerLoad;
