import { Buffer } from 'buffer';
import { Address } from '@stellar/stellar-sdk';
import {
    AssembledTransaction,
    Client as ContractClient,
    ClientOptions as ContractClientOptions,
    MethodOptions,
    Result,
    Spec as ContractSpec
} from '@stellar/stellar-sdk/contract';
import type {
    u32,
    i32,
    u64,
    i64,
    u128,
    i128,
    u256,
    i256,
    Option,
    Typepoint,
    Duration
} from '@stellar/stellar-sdk/contract';
export * from '@stellar/stellar-sdk';
export * as contract from '@stellar/stellar-sdk/contract';
export * as rpc from '@stellar/stellar-sdk/rpc';

if (typeof window !== 'undefined') {
    //@ts-ignore Buffer exists
    window.Buffer = window.Buffer || Buffer;
}

export const networks = {
    testnet: {
        networkPassphrase: 'Test SDF Network ; September 2015',
        contractId: 'CBS2SN4NO5KVC5WUSDPSRNBMJWOIS3DA457EXDK5S67GYDJGH3JZRBOI'
    }
} as const;

export const Errors = {};

export interface Client {
    /**
     * Construct and simulate a deploy transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Deploys the contract on behalf of the `Deployer` contract.
     *
     * This has to be authorized by the `Deployer`s address.
     */
    deploy: (
        {
            deployer,
            wasm_hash,
            salt,
            constructor_args
        }: { deployer: string; wasm_hash: Buffer; salt: Buffer; constructor_args: Array<any> },
        options?: {
            /**
             * The fee to pay for the transaction. Default: BASE_FEE
             */
            fee?: number;

            /**
             * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
             */
            timeoutInSeconds?: number;

            /**
             * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
             */
            simulate?: boolean;
        }
    ) => Promise<AssembledTransaction<string>>;
}
export class Client extends ContractClient {
    static async deploy<T = Client>(
        /** Options for initalizing a Client as well as for calling a method, with extras specific to deploying. */
        options: MethodOptions &
            Omit<ContractClientOptions, 'contractId'> & {
                /** The hash of the Wasm blob, which must already be installed on-chain. */
                wasmHash: Buffer | string;
                /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
                salt?: Buffer | Uint8Array;
                /** The format used to decode `wasmHash`, if it's provided as a string. */
                format?: 'hex' | 'base64';
            }
    ): Promise<AssembledTransaction<T>> {
        return ContractClient.deploy(null, options);
    }
    constructor(public readonly options: ContractClientOptions) {
        super(
            new ContractSpec([
                'AAAAAAAAAHFEZXBsb3lzIHRoZSBjb250cmFjdCBvbiBiZWhhbGYgb2YgdGhlIGBEZXBsb3llcmAgY29udHJhY3QuCgpUaGlzIGhhcyB0byBiZSBhdXRob3JpemVkIGJ5IHRoZSBgRGVwbG95ZXJgcyBhZGRyZXNzLgAAAAAAAAZkZXBsb3kAAAAAAAQAAAAAAAAACGRlcGxveWVyAAAAEwAAAAAAAAAJd2FzbV9oYXNoAAAAAAAD7gAAACAAAAAAAAAABHNhbHQAAAPuAAAAIAAAAAAAAAAQY29uc3RydWN0b3JfYXJncwAAA+oAAAAAAAAAAQAAABM='
            ]),
            options
        );
    }
    public readonly fromJSON = {
        deploy: this.txFromJSON<string>
    };
}
