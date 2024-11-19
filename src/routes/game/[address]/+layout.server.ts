import { error } from '@sveltejs/kit';
import { Contract, scValToNative, StrKey } from '@stellar/stellar-sdk';
import { server } from '$lib/server/passkeyServer';
import { sac } from '$lib/passkeyClient';
import type { LayoutServerLoad } from './$types';
import { PUBLIC_GAME_WASM_HASH } from '$env/static/public';

export const load: LayoutServerLoad = async ({ params, depends }) => {
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
    const instance = await server.rpc?.getLedgerEntries(contract.getFootprint());

    const wasmHash = instance?.entries[0].val
        .contractData()
        .val()
        .instance()
        .executable()
        .wasmHash()
        .toString('hex');
    if (wasmHash !== PUBLIC_GAME_WASM_HASH) {
        error(400, {
            message: 'requested contract is not a valid game'
        });
    }

    const instanceStorage: Record<string, any> = {};
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

    const tokenSymbol = (await sac.getSACClient(instanceStorage.TokenAddress).symbol()).result;
    const prizePot = (
        await sac.getSACClient(instanceStorage.TokenAddress).balance({
            id: contractAddress
        })
    ).result;

    depends('instance:storage');
    return {
        gameAddress: contractAddress,
        tokenAddress: instanceStorage.TokenAddress,
        tokenSymbol: tokenSymbol,
        gameAdmin: instanceStorage.Admin,
        numFaces: instanceStorage.NumFaces,
        prizePot
    };
};
