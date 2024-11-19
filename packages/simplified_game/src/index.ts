import { Buffer } from 'buffer';
import { Address } from '@stellar/stellar-sdk';
import {
    AssembledTransaction,
    Client as ContractClient,
    ClientOptions as ContractClientOptions,
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
        contractId: 'CDKEON7RHK6ZMWFFSVSGACNPKMZ23VON4673PKB6Q6D6ZBRJJ7H5A5C7'
    }
} as const;

export type DataKey = { tag: 'Roller'; values: readonly [string] };

export interface Roller {
    high_roll: u32;
    ledger_number: u32;
    times_rolled: u32;
}

export const Errors = {};

export interface Client {
    /**
     * Construct and simulate a roll transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    roll: (
        { roller }: { roller: string },
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
    ) => Promise<AssembledTransaction<Array<u32>>>;
}
export class Client extends ContractClient {
    constructor(public readonly options: ContractClientOptions) {
        super(
            new ContractSpec([
                'AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAAAQAAAAEAAAAAAAAABlJvbGxlcgAAAAAAAQAAABM=',
                'AAAAAQAAAAAAAAAAAAAABlJvbGxlcgAAAAAAAwAAAAAAAAAJaGlnaF9yb2xsAAAAAAAABAAAAAAAAAANbGVkZ2VyX251bWJlcgAAAAAAAAQAAAAAAAAADHRpbWVzX3JvbGxlZAAAAAQ=',
                'AAAAAAAAAAAAAAAEcm9sbAAAAAEAAAAAAAAABnJvbGxlcgAAAAAAEwAAAAEAAAPqAAAABA=='
            ]),
            options
        );
    }
    public readonly fromJSON = {
        roll: this.txFromJSON<Array<u32>>
    };
}
