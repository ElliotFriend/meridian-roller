import { Buffer } from 'buffer';
import {
    AssembledTransaction,
    Client as ContractClient,
    ClientOptions as ContractClientOptions,
    MethodOptions,
} from '@stellar/stellar-sdk/minimal/contract';
import type { u32, i128 } from '@stellar/stellar-sdk/minimal/contract';
export type DataKey =
    | {
          tag: 'Admin';
          values: void;
      }
    | {
          tag: 'TokenAddress';
          values: void;
      }
    | {
          tag: 'Winner';
          values: void;
      }
    | {
          tag: 'Roller';
          values: readonly [string];
      }
    | {
          tag: 'EveryoneWins';
          values: void;
      }
    | {
          tag: 'NumDice';
          values: void;
      }
    | {
          tag: 'NumFaces';
          values: void;
      };
export interface Roller {
    first_roll: u32;
    high_roll: u32;
    ledger_number: u32;
    times_rolled: u32;
}
export declare const Errors: {
    /**
     * A winner has already been found.
     */
    1: {
        message: string;
    };
    /**
     * You can't be evil. The game has not been called.
     */
    2: {
        message: string;
    };
    /**
     * The game has already been called.
     */
    3: {
        message: string;
    };
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
        {
            roller,
        }: {
            roller: string;
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
export declare class Client extends ContractClient {
    readonly options: ContractClientOptions;
    static deploy<T = Client>(
        /** Constructor/Initialization Args for the contract's `__constructor` method */
        {
            admin,
            token_address,
            num_dice,
            num_faces,
        }: {
            admin: string;
            token_address: string;
            num_dice: u32;
            num_faces: u32;
        },
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
    ): Promise<AssembledTransaction<T>>;
    constructor(options: ContractClientOptions);
    readonly fromJSON: {
        roll: (json: string) => AssembledTransaction<number[]>;
        call_it: (json: string) => AssembledTransaction<null>;
        be_evil: (json: string) => AssembledTransaction<bigint>;
    };
}
