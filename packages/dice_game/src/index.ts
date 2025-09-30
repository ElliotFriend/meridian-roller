import { Buffer } from 'buffer';
import {
    AssembledTransaction,
    Client as ContractClient,
    ClientOptions as ContractClientOptions,
    MethodOptions,
    Spec as ContractSpec,
} from '@stellar/stellar-sdk/minimal/contract';
import type { u32, i128 } from '@stellar/stellar-sdk/minimal/contract';

if (typeof window !== 'undefined') {
    //@ts-ignore Buffer exists
    window.Buffer = window.Buffer || Buffer;
}

export type DataKey =
    | { tag: 'Admin'; values: void }
    | { tag: 'TokenAddress'; values: void }
    | { tag: 'Winner'; values: void }
    | { tag: 'Roller'; values: readonly [string] }
    | { tag: 'EveryoneWins'; values: void }
    | { tag: 'NumDice'; values: void }
    | { tag: 'NumFaces'; values: void };

export interface Roller {
    first_roll: u32;
    high_roll: u32;
    ledger_number: u32;
    times_rolled: u32;
}

export const Errors = {
    /**
     * A winner has already been found.
     */
    1: { message: 'WinnerFound' },
    /**
     * You can't be evil. The game has not been called.
     */
    2: { message: 'NotCalled' },
    /**
     * The game has already been called.
     */
    3: { message: 'AlreadyCalled' },
};

export interface Client {
    /**
     * Construct and simulate a roll transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Roll the dice
     *
     * # Arguments
     * * `roller` - address rolling the dice during this turn.
     *
     * # Panics
     * * If the contract has not yet been initialized
     * * If a winner has already been found, and they've claimed the prize pot
     *
     * # Events
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
        },
    ) => Promise<AssembledTransaction<Array<u32>>>;

    /**
     * Construct and simulate a call_it transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Call the game off
     *
     * # Panics
     * * If the contract has not yet been initialized
     * * If a winner has already been found, and they've claimed the prize pot
     * * If the game has already been "called" by the admin
     *
     * # Events
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
    }) => Promise<AssembledTransaction<null>>;

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
    }) => Promise<AssembledTransaction<i128>>;
}
export class Client extends ContractClient {
    static async deploy<T = Client>(
        /** Constructor/Initialization Args for the contract's `__constructor` method */
        {
            admin,
            token_address,
            num_dice,
            num_faces,
        }: { admin: string; token_address: string; num_dice: u32; num_faces: u32 },
        /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
        options: MethodOptions &
            Omit<ContractClientOptions, 'contractId'> & {
                /** The hash of the Wasm blob, which must already be installed on-chain. */
                wasmHash: Buffer | string;
                /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
                salt?: Buffer | Uint8Array;
                /** The format used to decode `wasmHash`, if it's provided as a string. */
                format?: 'hex' | 'base64';
            },
    ): Promise<AssembledTransaction<T>> {
        return ContractClient.deploy({ admin, token_address, num_dice, num_faces }, options);
    }
    constructor(public readonly options: ContractClientOptions) {
        super(
            new ContractSpec([
                'AAAAAAAAAfdJbml0aWFsaXplIGEgbmV3IGdhbWUgY29udHJhY3QuCgojIEFyZ3VtZW50cwoqIGBhZG1pbmAgLSBhZGRyZXNzIGNvcnJlc3BvbmRpbmcgdG8gdGhlIGNyZWF0b3Igb2YgdGhpcyBnYW1lLgoqIGB0b2tlbl9hZGRyZXNzYCAtIGFkZHJlc3MgZm9yIHRoZSBhc3NldCBjb250cmFjdCB0aGF0IHdpbGwgYmUgdXNlZCBmb3IKcGF5bWVudHMgdG8gYW5kIGZyb20gdGhlIHByaXplIHBvdC4KKiBgbnVtX2RpY2VgIC0gbnVtYmVyIG9mIGRpY2UgdG8gcm9sbC4KKiBgbnVtX2ZhY2VzYCAtIG51bWJlciBvZiBmYWNlcyBvbiBlYWNoIGRpZSB0aGF0IHdpbGwgYmUgcm9sbGVkIGR1cmluZwp0aGUgY291cnNlIG9mIHRoZSBnYW1lLgoKIyBQYW5pY3MKKiBJZiB0aGUgY29udHJhY3QgaXMgYWxyZWFkeSBpbml0aWFsaXplZAoKIyBFdmVudHMKRW1pdHMgYW4gZXZlbnQgd2l0aCB0aGUgdG9waWNzIGBbIlJPTExFUiIsICJyZWFkeSIsIGFkbWluOiBBZGRyZXNzXSwKZGF0YSA9IG51bV9mYWNlczogdTMyYAAAAAANX19jb25zdHJ1Y3RvcgAAAAAAAAQAAAAAAAAABWFkbWluAAAAAAAAEwAAAAAAAAANdG9rZW5fYWRkcmVzcwAAAAAAABMAAAAAAAAACG51bV9kaWNlAAAABAAAAAAAAAAJbnVtX2ZhY2VzAAAAAAAABAAAAAA=',
                'AAAAAAAAAqNSb2xsIHRoZSBkaWNlCgojIEFyZ3VtZW50cwoqIGByb2xsZXJgIC0gYWRkcmVzcyByb2xsaW5nIHRoZSBkaWNlIGR1cmluZyB0aGlzIHR1cm4uCgojIFBhbmljcwoqIElmIHRoZSBjb250cmFjdCBoYXMgbm90IHlldCBiZWVuIGluaXRpYWxpemVkCiogSWYgYSB3aW5uZXIgaGFzIGFscmVhZHkgYmVlbiBmb3VuZCwgYW5kIHRoZXkndmUgY2xhaW1lZCB0aGUgcHJpemUgcG90CgojIEV2ZW50cwpFbWl0cyBvbmUgb2YgdHdvIGV2ZW50cywgZGVwZW5kaW5nIG9uIHRoZSByb2xsZWQgdmFsdWU6CgoqIEZvciBhIG5vbi13aW5uaW5nIHJvbGwsIGVtaXRzIGFuIGV2ZW50IHdpdGggdG9waWNzIGBbIlJPTExFUiIsCiJyb2xsZWQiLCByb2xsZXI6IEFkZHJlc3NdLCBkYXRhID0gdG90YWw6IHUzMmAKKiBGb3IgYSB3aW5uaW5nIHJvbGwsIGVtaXRzIGFuIGV2ZW50IHdpdGggdG9waWNzIGBbIlJPTExFUiIsICJ3aW5uZXIiLApyb2xsZXI6IEFkZHJlc3NdLCBkYXRhID0gcHJpemVfcG90OiB1MzJgCgpJZiB0aGUgZ2FtZSBoYXMgYWxyZWFkeSBiZWVuICJjYWxsZWQiIGJ5IHRoZSBhZG1pbiwgYW5kIHRoZXJlZm9yZQpldmVyeW9uZSBpcyBoZW5jZWZvcnRoIGEgd2lubmVyLCBubyBldmVudCBpcyBlbWl0dGVkIGFuZCBhICJqYWNrcG90Igpyb2xsIGlzIHNpbXBseSByZXR1cm5lZCB0byB0aGUgdXNlci4AAAAABHJvbGwAAAABAAAAAAAAAAZyb2xsZXIAAAAAABMAAAABAAAD6gAAAAQ=',
                'AAAAAAAAAStDYWxsIHRoZSBnYW1lIG9mZgoKIyBQYW5pY3MKKiBJZiB0aGUgY29udHJhY3QgaGFzIG5vdCB5ZXQgYmVlbiBpbml0aWFsaXplZAoqIElmIGEgd2lubmVyIGhhcyBhbHJlYWR5IGJlZW4gZm91bmQsIGFuZCB0aGV5J3ZlIGNsYWltZWQgdGhlIHByaXplIHBvdAoqIElmIHRoZSBnYW1lIGhhcyBhbHJlYWR5IGJlZW4gImNhbGxlZCIgYnkgdGhlIGFkbWluCgojIEV2ZW50cwpFbWl0cyBhbiBldmVudCB3aXRoIHRvcGljcyBgWyJST0xMRVIiLCAiY2FsbGVkIiwgYWRtaW46IEFkZHJlc3NdLCBkYXRhCj0gcHJpemVfcG90OiBpMTI4YAAAAAAHY2FsbF9pdAAAAAAAAAAAAA==',
                'AAAAAAAAAB9Tc3NzaGhoLi4uIE5vdGhpbmcgdG8gc2VlIGhlcmUuAAAAAAdiZV9ldmlsAAAAAAAAAAABAAAACw==',
                'AAAABQAAAAAAAAAAAAAABVJlYWR5AAAAAAAAAgAAAAZST0xMRVIAAAAAAAVyZWFkeQAAAAAAAAMAAAAAAAAABWFkbWluAAAAAAAAEwAAAAEAAAAAAAAACG51bV9kaWNlAAAABAAAAAEAAAAAAAAACW51bV9mYWNlcwAAAAAAAAQAAAAAAAAAAg==',
                'AAAABQAAAAAAAAAAAAAABlJvbGxlZAAAAAAAAgAAAAZST0xMRVIAAAAAAAZyb2xsZWQAAAAAAAIAAAAAAAAABnJvbGxlcgAAAAAAEwAAAAEAAAAAAAAABXRvdGFsAAAAAAAABAAAAAAAAAAC',
                'AAAABQAAAAAAAAAAAAAABldpbm5lcgAAAAAAAgAAAAZST0xMRVIAAAAAAAZ3aW5uZXIAAAAAAAIAAAAAAAAABndpbm5lcgAAAAAAEwAAAAEAAAAAAAAACXByaXplX3BvdAAAAAAAAAsAAAAAAAAAAg==',
                'AAAABQAAAAAAAAAAAAAABkNhbGxlZAAAAAAAAgAAAAZST0xMRVIAAAAAAAZjYWxsZWQAAAAAAAIAAAAAAAAABWFkbWluAAAAAAAAEwAAAAEAAAAAAAAACXByaXplX3BvdAAAAAAAAAsAAAAAAAAAAg==',
                'AAAABQAAAAAAAAAAAAAACUV2aWxBZG1pbgAAAAAAAAIAAAAGUk9MTEVSAAAAAAAJZXZpbGFkbWluAAAAAAAAAgAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAQAAAAAAAAAJcHJpemVfcG90AAAAAAAACwAAAAAAAAAC',
                'AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAABwAAAAAAAAAAAAAABUFkbWluAAAAAAAAAAAAAAAAAAAMVG9rZW5BZGRyZXNzAAAAAAAAAAAAAAAGV2lubmVyAAAAAAABAAAAAAAAAAZSb2xsZXIAAAAAAAEAAAATAAAAAAAAAAAAAAAMRXZlcnlvbmVXaW5zAAAAAAAAAAAAAAAHTnVtRGljZQAAAAAAAAAAAAAAAAhOdW1GYWNlcw==',
                'AAAAAQAAAAAAAAAAAAAABlJvbGxlcgAAAAAABAAAAAAAAAAKZmlyc3Rfcm9sbAAAAAAABAAAAAAAAAAJaGlnaF9yb2xsAAAAAAAABAAAAAAAAAANbGVkZ2VyX251bWJlcgAAAAAAAAQAAAAAAAAADHRpbWVzX3JvbGxlZAAAAAQ=',
                'AAAABAAAAAAAAAAAAAAABUVycm9yAAAAAAAAAwAAACBBIHdpbm5lciBoYXMgYWxyZWFkeSBiZWVuIGZvdW5kLgAAAAtXaW5uZXJGb3VuZAAAAAABAAAAMFlvdSBjYW4ndCBiZSBldmlsLiBUaGUgZ2FtZSBoYXMgbm90IGJlZW4gY2FsbGVkLgAAAAlOb3RDYWxsZWQAAAAAAAACAAAAIVRoZSBnYW1lIGhhcyBhbHJlYWR5IGJlZW4gY2FsbGVkLgAAAAAAAA1BbHJlYWR5Q2FsbGVkAAAAAAAAAw==',
            ]),
            options,
        );
    }
    public readonly fromJSON = {
        roll: this.txFromJSON<Array<u32>>,
        call_it: this.txFromJSON<null>,
        be_evil: this.txFromJSON<i128>,
    };
}
