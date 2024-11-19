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
        contractId: "CDKEON7RHK6ZMWFFSVSGACNPKMZ23VON4673PKB6Q6D6ZBRJJ7H5A5C7",
    }
};
export const Errors = {};
export class Client extends ContractClient {
    options;
    constructor(options) {
        super(new ContractSpec(["AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAAAQAAAAEAAAAAAAAABlJvbGxlcgAAAAAAAQAAABM=",
            "AAAAAQAAAAAAAAAAAAAABlJvbGxlcgAAAAAAAwAAAAAAAAAJaGlnaF9yb2xsAAAAAAAABAAAAAAAAAANbGVkZ2VyX251bWJlcgAAAAAAAAQAAAAAAAAADHRpbWVzX3JvbGxlZAAAAAQ=",
            "AAAAAAAAAAAAAAAEcm9sbAAAAAEAAAAAAAAABnJvbGxlcgAAAAAAEwAAAAEAAAPqAAAABA=="]), options);
        this.options = options;
    }
    fromJSON = {
        roll: (this.txFromJSON)
    };
}
