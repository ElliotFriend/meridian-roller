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
        contractId: 'CA7OYAQ3MKPQTX5XVTTIGYLAEZNCQLH2BV5P3P7IIUDFUEQRQ25N6SNS'
    }
} as const;

export type DataKey =
    | { tag: 'Admin'; values: void }
    | { tag: 'TokenAddress'; values: void }
    | { tag: 'Winner'; values: void }
    | { tag: 'Roller'; values: readonly [string] }
    | { tag: 'EveryoneWins'; values: void }
    | { tag: 'NumFaces'; values: void }
    | { tag: 'PrizePot'; values: void };

export interface Roller {
    first_roll: u32;
    high_roll: u32;
    ledger_number: u32;
    times_rolled: u32;
}

export const Errors = {
    1: { message: 'WinnerFound' },

    2: { message: 'NotInitialized' },

    3: { message: 'AlreadyInitialized' },

    4: { message: 'NotCalled' },

    5: { message: 'AlreadyCalled' }
};

export interface Client {
    /**
     * Construct and simulate a roll transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Roll the dice
     *
     * # Arguments
     *
     * * `roller` - address rolling the dice during this turn.
     *
     * # Panics
     *
     * * If the contract has not yet been initialized
     * * If a winner has already been found, and they've claimed the prize pot
     *
     * # Events
     *
     * Emits one of two events, depending on the rolled value:
     *
     * * For a non-winning roll, emits an event with topics `["ROLLER",
     * "rolled", roller: Address], data = total: u32`
     * * For a winning roll, emits an event with topics `["ROLLER", "winner",
     * roller: Address], data = prize_pot: u32`
     *
     * If the game has already been "called" by the admin, and therefore
     * everyone is henceforth a winner, no event is emitted and a "jackpot"
     * roll is simply returned to the user.
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
    ) => Promise<AssembledTransaction<Result<Array<u32>>>>;

    /**
     * Construct and simulate a call_it transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Call the game off
     *
     * # Panics
     *
     * * If the contract has not yet been initialized
     * * If a winner has already been found, and they've claimed the prize pot
     * * If the game has already been "called" by the admin
     *
     * # Events
     *
     * Emits an event with topics `["ROLLER", "called", admin: Address], data
     * = prize_pot: i128`
     */
    call_it: (options?: {
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
    }) => Promise<AssembledTransaction<Result<void>>>;

    /**
     * Construct and simulate a be_evil transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Sssshhh... Nothing to see here.
     */
    be_evil: (options?: {
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
    }) => Promise<AssembledTransaction<Result<i128>>>;
}
export class Client extends ContractClient {
    static async deploy<T = Client>(
        /** Constructor/Initialization Args for the contract's `__constructor` method */
        {
            admin,
            token_address,
            num_faces
        }: { admin: string; token_address: string; num_faces: u32 },
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
        return ContractClient.deploy({ admin, token_address, num_faces }, options);
    }
    constructor(public readonly options: ContractClientOptions) {
        super(
            new ContractSpec([
                'AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAABwAAAAAAAAAAAAAABUFkbWluAAAAAAAAAAAAAAAAAAAMVG9rZW5BZGRyZXNzAAAAAAAAAAAAAAAGV2lubmVyAAAAAAABAAAAAAAAAAZSb2xsZXIAAAAAAAEAAAATAAAAAAAAAAAAAAAMRXZlcnlvbmVXaW5zAAAAAAAAAAAAAAAITnVtRmFjZXMAAAAAAAAAAAAAAAhQcml6ZVBvdA==',
                'AAAAAQAAAAAAAAAAAAAABlJvbGxlcgAAAAAABAAAAAAAAAAKZmlyc3Rfcm9sbAAAAAAABAAAAAAAAAAJaGlnaF9yb2xsAAAAAAAABAAAAAAAAAANbGVkZ2VyX251bWJlcgAAAAAAAAQAAAAAAAAADHRpbWVzX3JvbGxlZAAAAAQ=',
                'AAAABAAAAAAAAAAAAAAABUVycm9yAAAAAAAABQAAAAAAAAALV2lubmVyRm91bmQAAAAAAQAAAAAAAAAOTm90SW5pdGlhbGl6ZWQAAAAAAAIAAAAAAAAAEkFscmVhZHlJbml0aWFsaXplZAAAAAAAAwAAAAAAAAAJTm90Q2FsbGVkAAAAAAAABAAAAAAAAAANQWxyZWFkeUNhbGxlZAAAAAAAAAU=',
                'AAAAAAAAAdRJbml0aWFsaXplIGEgbmV3IGdhbWUgY29udHJhY3QuCgojIEFyZ3VtZW50cwoKKiBgYWRtaW5gIC0gYWRkcmVzcyBjb3JyZXNwb25kaW5nIHRvIHRoZSBkZXBsb3llciBvZiB0aGlzIGdhbWUuCiogYHRva2VuX2FkZHJlc3NgIC0gYWRkcmVzcyBmb3IgdGhlIGFzc2V0IGNvbnRyYWN0IHRoYXQgd2lsbCBiZSB1c2VkIGZvcgpwYXltZW50cyB0byBhbmQgZnJvbSB0aGUgcHJpemUgcG90LgoqIGBudW1fZmFjZXNgIC0gbnVtYmVyIG9mIGZhY2VzIG9uIGVhY2ggZGllIHRoYXQgd2lsbCBiZSByb2xsZWQgZHVyaW5nCnRoZSBjb3Vyc2Ugb2YgdGhlIGdhbWUuCgojIFBhbmljcwoKKiBJZiB0aGUgY29udHJhY3QgaXMgYWxyZWFkeSBpbml0aWFsaXplZAoKIyBFdmVudHMKCkVtaXRzIGFuIGV2ZW50IHdpdGggdGhlIHRvcGljcyBgWyJST0xMRVIiLCAicmVhZHkiLCBhZG1pbjogQWRkcmVzc10sCmRhdGEgPSBudW1fZmFjZXM6IHUzMmAAAAANX19jb25zdHJ1Y3RvcgAAAAAAAAMAAAAAAAAABWFkbWluAAAAAAAAEwAAAAAAAAANdG9rZW5fYWRkcmVzcwAAAAAAABMAAAAAAAAACW51bV9mYWNlcwAAAAAAAAQAAAABAAAD6QAAA+0AAAAAAAAAAw==',
                'AAAAAAAAAqZSb2xsIHRoZSBkaWNlCgojIEFyZ3VtZW50cwoKKiBgcm9sbGVyYCAtIGFkZHJlc3Mgcm9sbGluZyB0aGUgZGljZSBkdXJpbmcgdGhpcyB0dXJuLgoKIyBQYW5pY3MKCiogSWYgdGhlIGNvbnRyYWN0IGhhcyBub3QgeWV0IGJlZW4gaW5pdGlhbGl6ZWQKKiBJZiBhIHdpbm5lciBoYXMgYWxyZWFkeSBiZWVuIGZvdW5kLCBhbmQgdGhleSd2ZSBjbGFpbWVkIHRoZSBwcml6ZSBwb3QKCiMgRXZlbnRzCgpFbWl0cyBvbmUgb2YgdHdvIGV2ZW50cywgZGVwZW5kaW5nIG9uIHRoZSByb2xsZWQgdmFsdWU6CgoqIEZvciBhIG5vbi13aW5uaW5nIHJvbGwsIGVtaXRzIGFuIGV2ZW50IHdpdGggdG9waWNzIGBbIlJPTExFUiIsCiJyb2xsZWQiLCByb2xsZXI6IEFkZHJlc3NdLCBkYXRhID0gdG90YWw6IHUzMmAKKiBGb3IgYSB3aW5uaW5nIHJvbGwsIGVtaXRzIGFuIGV2ZW50IHdpdGggdG9waWNzIGBbIlJPTExFUiIsICJ3aW5uZXIiLApyb2xsZXI6IEFkZHJlc3NdLCBkYXRhID0gcHJpemVfcG90OiB1MzJgCgpJZiB0aGUgZ2FtZSBoYXMgYWxyZWFkeSBiZWVuICJjYWxsZWQiIGJ5IHRoZSBhZG1pbiwgYW5kIHRoZXJlZm9yZQpldmVyeW9uZSBpcyBoZW5jZWZvcnRoIGEgd2lubmVyLCBubyBldmVudCBpcyBlbWl0dGVkIGFuZCBhICJqYWNrcG90Igpyb2xsIGlzIHNpbXBseSByZXR1cm5lZCB0byB0aGUgdXNlci4AAAAAAARyb2xsAAAAAQAAAAAAAAAGcm9sbGVyAAAAAAATAAAAAQAAA+kAAAPqAAAABAAAAAM=',
                'AAAAAAAAAS1DYWxsIHRoZSBnYW1lIG9mZgoKIyBQYW5pY3MKCiogSWYgdGhlIGNvbnRyYWN0IGhhcyBub3QgeWV0IGJlZW4gaW5pdGlhbGl6ZWQKKiBJZiBhIHdpbm5lciBoYXMgYWxyZWFkeSBiZWVuIGZvdW5kLCBhbmQgdGhleSd2ZSBjbGFpbWVkIHRoZSBwcml6ZSBwb3QKKiBJZiB0aGUgZ2FtZSBoYXMgYWxyZWFkeSBiZWVuICJjYWxsZWQiIGJ5IHRoZSBhZG1pbgoKIyBFdmVudHMKCkVtaXRzIGFuIGV2ZW50IHdpdGggdG9waWNzIGBbIlJPTExFUiIsICJjYWxsZWQiLCBhZG1pbjogQWRkcmVzc10sIGRhdGEKPSBwcml6ZV9wb3Q6IGkxMjhgAAAAAAAAB2NhbGxfaXQAAAAAAAAAAAEAAAPpAAAD7QAAAAAAAAAD',
                'AAAAAAAAAB9Tc3NzaGhoLi4uIE5vdGhpbmcgdG8gc2VlIGhlcmUuAAAAAAdiZV9ldmlsAAAAAAAAAAABAAAD6QAAAAsAAAAD'
            ]),
            options
        );
    }
    public readonly fromJSON = {
        roll: this.txFromJSON<Result<Array<u32>>>,
        call_it: this.txFromJSON<Result<void>>,
        be_evil: this.txFromJSON<Result<i128>>
    };
}
