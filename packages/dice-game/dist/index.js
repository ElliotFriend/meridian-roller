import { Buffer } from "buffer";
import { Client as ContractClient, Spec as ContractSpec, } from '@stellar/stellar-sdk/contract';
export * from '@stellar/stellar-sdk';
export * as contract from '@stellar/stellar-sdk/contract';
export * as rpc from '@stellar/stellar-sdk/rpc';
if (typeof window !== 'undefined') {
    //@ts-ignore Buffer exists
    window.Buffer = window.Buffer || Buffer;
}
export const networks = {
    testnet: {
        networkPassphrase: "Test SDF Network ; September 2015",
        contractId: "CBE3KZQ4SEZ2MVQ26H7AUPAC42BQPPRAOVYFWU4WPM3NARWSOSZRGG7Q",
    }
};
export const Errors = {
    1: { message: "WinnerFound" },
    2: { message: "NotInitialized" },
    3: { message: "AlreadyInitialized" }
};
export class Client extends ContractClient {
    options;
    constructor(options) {
        super(new ContractSpec(["AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAABQAAAAAAAAAAAAAABUFkbWluAAAAAAAAAAAAAAAAAAAMVG9rZW5BZGRyZXNzAAAAAAAAAAAAAAAGV2lubmVyAAAAAAABAAAAAAAAAAZSb2xsZXIAAAAAAAEAAAATAAAAAAAAAAAAAAAMRXZlcnlvbmVXaW5z",
            "AAAAAQAAAAAAAAAAAAAABlJvbGxlcgAAAAAAAwAAAAAAAAAJaGlnaF9yb2xsAAAAAAAABAAAAAAAAAANbGVkZ2VyX251bWJlcgAAAAAAAAQAAAAAAAAADHRpbWVzX3JvbGxlZAAAAAQ=",
            "AAAABAAAAAAAAAAAAAAABUVycm9yAAAAAAAAAwAAAAAAAAALV2lubmVyRm91bmQAAAAAAQAAAAAAAAAOTm90SW5pdGlhbGl6ZWQAAAAAAAIAAAAAAAAAEkFscmVhZHlJbml0aWFsaXplZAAAAAAAAw==",
            "AAAAAAAAAAAAAAAEaW5pdAAAAAIAAAAAAAAABWFkbWluAAAAAAAAEwAAAAAAAAANdG9rZW5fYWRkcmVzcwAAAAAAABMAAAABAAAD6QAAA+0AAAAAAAAAAw==",
            "AAAAAAAAAAAAAAAEcm9sbAAAAAEAAAAAAAAABnJvbGxlcgAAAAAAEwAAAAEAAAPpAAAD6gAAAAQAAAAD",
            "AAAAAAAAAAAAAAAHY2FsbF9pdAAAAAAAAAAAAQAAA+kAAAPtAAAAAAAAAAM="]), options);
        this.options = options;
    }
    fromJSON = {
        init: (this.txFromJSON),
        roll: (this.txFromJSON),
        call_it: (this.txFromJSON)
    };
}
