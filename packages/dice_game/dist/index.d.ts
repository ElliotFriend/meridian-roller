import { AssembledTransaction, Client as ContractClient, ClientOptions as ContractClientOptions, Result } from '@stellar/stellar-sdk/contract';
import type { u32, i128 } from '@stellar/stellar-sdk/contract';
export * from '@stellar/stellar-sdk';
export * as contract from '@stellar/stellar-sdk/contract';
export * as rpc from '@stellar/stellar-sdk/rpc';
export declare const networks: {
    readonly testnet: {
        readonly networkPassphrase: "Test SDF Network ; September 2015";
        readonly contractId: "CDQN3O4EQUAUMN5ETTQI4OXKIX2EV7AGUFMIFQFFGB5OFZX6AYIWGP7U";
    };
};
export type DataKey = {
    tag: "Admin";
    values: void;
} | {
    tag: "TokenAddress";
    values: void;
} | {
    tag: "Winner";
    values: void;
} | {
    tag: "Roller";
    values: readonly [string];
} | {
    tag: "EveryoneWins";
    values: void;
} | {
    tag: "NumFaces";
    values: void;
} | {
    tag: "PrizePot";
    values: void;
};
export interface Roller {
    first_roll: u32;
    high_roll: u32;
    ledger_number: u32;
    times_rolled: u32;
}
export declare const Errors: {
    1: {
        message: string;
    };
    2: {
        message: string;
    };
    3: {
        message: string;
    };
    4: {
        message: string;
    };
    5: {
        message: string;
    };
};
export interface Client {
    /**
     * Construct and simulate a init transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Initialize a new game contract.
     *
     * # Arguments
     *
     * * `admin` - address corresponding to the deployer of this game.
     * * `token_address` - address for the asset contract that will be used for
     * payments to and from the prize pot.
     * * `num_faces` - number of faces on each die that will be rolled during
     * the course of the game.
     *
     * # Panics
     *
     * * If the contract is already initialized
     *
     * # Events
     *
     * Emits an event with the topics `["ROLLER", "ready", admin: Address],
     * data = num_faces: u32`
     */
    init: ({ admin, token_address, num_faces }: {
        admin: string;
        token_address: string;
        num_faces: u32;
    }, options?: {
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
    roll: ({ roller }: {
        roller: string;
    }, options?: {
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
    }) => Promise<AssembledTransaction<Result<Array<u32>>>>;
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
export declare class Client extends ContractClient {
    readonly options: ContractClientOptions;
    constructor(options: ContractClientOptions);
    readonly fromJSON: {
        init: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        roll: (json: string) => AssembledTransaction<Result<number[], import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        call_it: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        be_evil: (json: string) => AssembledTransaction<Result<bigint, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
    };
}
