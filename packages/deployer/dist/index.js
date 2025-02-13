import { Buffer } from 'buffer';
import { Client as ContractClient, Spec as ContractSpec } from '@stellar/stellar-sdk/contract';
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
};
export const Errors = {};
export class Client extends ContractClient {
    options;
    static async deploy(
        /** Options for initalizing a Client as well as for calling a method, with extras specific to deploying. */
        options
    ) {
        return ContractClient.deploy(null, options);
    }
    constructor(options) {
        super(
            new ContractSpec([
                'AAAAAAAAAHFEZXBsb3lzIHRoZSBjb250cmFjdCBvbiBiZWhhbGYgb2YgdGhlIGBEZXBsb3llcmAgY29udHJhY3QuCgpUaGlzIGhhcyB0byBiZSBhdXRob3JpemVkIGJ5IHRoZSBgRGVwbG95ZXJgcyBhZGRyZXNzLgAAAAAAAAZkZXBsb3kAAAAAAAQAAAAAAAAACGRlcGxveWVyAAAAEwAAAAAAAAAJd2FzbV9oYXNoAAAAAAAD7gAAACAAAAAAAAAABHNhbHQAAAPuAAAAIAAAAAAAAAAQY29uc3RydWN0b3JfYXJncwAAA+oAAAAAAAAAAQAAABM='
            ]),
            options
        );
        this.options = options;
    }
    fromJSON = {
        deploy: this.txFromJSON
    };
}
