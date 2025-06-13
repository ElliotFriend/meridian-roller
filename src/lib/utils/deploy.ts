import { PUBLIC_GAME_WASM_HASH, PUBLIC_NATIVE_CONTRACT_ADDRESS } from '$env/static/public';
import {
    Address,
    xdr,
    nativeToScVal,
    Operation,
    authorizeInvocation,
} from '@stellar/stellar-sdk/minimal';
import { getContractAddress } from '$lib/utils';
import { account, rpc } from '$lib/passkeyClient';

export function createDeployConstructorArgs(address: Address): xdr.ScVal[] {
    return [
        nativeToScVal(address.toString(), { type: 'address' }),
        nativeToScVal(PUBLIC_NATIVE_CONTRACT_ADDRESS, { type: 'address' }),
        nativeToScVal(10, { type: 'u32' }),
    ];
}

export function createDeployCreateContractArgsV2(
    address: Address,
    salt: Buffer,
): xdr.CreateContractArgsV2 {
    return new xdr.CreateContractArgsV2({
        contractIdPreimage: xdr.ContractIdPreimage.contractIdPreimageFromAddress(
            new xdr.ContractIdPreimageFromAddress({
                address: address.toScAddress(),
                salt: salt,
            }),
        ),
        executable: xdr.ContractExecutable.contractExecutableWasm(
            Buffer.from(PUBLIC_GAME_WASM_HASH, 'hex'),
        ),
        constructorArgs: createDeployConstructorArgs(address),
    });
}

export function createDeployHostFunction(address: Address, salt: Buffer): xdr.HostFunction {
    return xdr.HostFunction.hostFunctionTypeCreateContractV2(
        createDeployCreateContractArgsV2(address, salt),
    );
}

export function createDeployAuthEntry(
    address: Address,
    salt: Buffer,
    nonce: Uint8Array,
): xdr.SorobanAuthorizationEntry {
    return new xdr.SorobanAuthorizationEntry({
        credentials: xdr.SorobanCredentials.sorobanCredentialsAddress(
            new xdr.SorobanAddressCredentials({
                address: address.toScAddress(),
                nonce: new xdr.Int64(Array.from(nonce)),
                signatureExpirationLedger: 0,
                signature: xdr.ScVal.scvVoid(),
            }),
        ),
        rootInvocation: new xdr.SorobanAuthorizedInvocation({
            function:
                xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeCreateContractV2HostFn(
                    createDeployCreateContractArgsV2(address, salt),
                ),
            subInvocations: [
                new xdr.SorobanAuthorizedInvocation({
                    function: xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
                        new xdr.InvokeContractArgs({
                            contractAddress: new Address(
                                getContractAddress(address, salt),
                            ).toScAddress(),
                            functionName: '__constructor',
                            args: createDeployConstructorArgs(address),
                        }),
                    ),
                    subInvocations: [],
                }),
            ],
        }),
    });
}

export function createDeployHostFunctionAndAuthEntry(
    address: Address,
    salt: Buffer,
    nonce: Uint8Array,
): { func: xdr.HostFunction; auth: xdr.SorobanAuthorizationEntry } {
    return {
        func: createDeployHostFunction(address, salt),
        auth: createDeployAuthEntry(address, salt, nonce),
    };
}

export function createCustomContractHostFunction(address: Address): xdr.HostFunction {
    const op = Operation.createCustomContract({
        address: address,
        wasmHash: Buffer.from(PUBLIC_GAME_WASM_HASH, 'hex'),
    });

    return op.body().invokeHostFunctionOp().hostFunction();
}

// export async function createCustomContractAuthEntry(passkeyId: string): Promise<xdr.SorobanAuthorizationEntry> {
//     const { sequence } = await rpc.getLatestLedger()
//     return await authorizeInvocation(
//         (p) => { return account.signAuthEntry(undefined, { keyId: passkeyId}) },
//         sequence + 6,
//         new xdr.SorobanAuthorizedInvocation({
//             function: xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeCreateContractV2HostFn(
//                 createDeployCreateContractArgsV2(address, salt),
//             ),
//             subInvocations: [
//                 new xdr.SorobanAuthorizedInvocation({
//                     function: xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
//                         new xdr.InvokeContractArgs({
//                             contractAddress: new Address(getContractAddress(address, salt)).toScAddress(),
//                             functionName: "__constructor",
//                             args: createDeployConstructorArgs(address),
//                         })
//                     ),
//                     subInvocations: []
//                 })
//             ],
//         }),
//     )
// }
