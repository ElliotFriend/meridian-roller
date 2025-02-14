import { Buffer } from 'buffer';
import {
    AssembledTransaction,
    Client as ContractClient,
    ClientOptions as ContractClientOptions,
    MethodOptions
} from '@stellar/stellar-sdk/contract';
export * from '@stellar/stellar-sdk';
export * as contract from '@stellar/stellar-sdk/contract';
export * as rpc from '@stellar/stellar-sdk/rpc';
export declare const networks: {
    readonly testnet: {
        readonly networkPassphrase: 'Test SDF Network ; September 2015';
        readonly contractId: 'CCUC35X3IXSRRSLQU6BTB6YFILOZG3ZH4ALDEZGQJ7EXWAZ662U3Q5SP';
    };
};
export declare const Errors: {};
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
        }: {
            deployer: string;
            wasm_hash: Buffer;
            salt: Buffer;
            constructor_args: Array<any>;
        },
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
export declare class Client extends ContractClient {
    readonly options: ContractClientOptions;
    static deploy<T = Client>(
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
    ): Promise<AssembledTransaction<T>>;
    constructor(options: ContractClientOptions);
    readonly fromJSON: {
        deploy: (json: string) => AssembledTransaction<string>;
    };
}
