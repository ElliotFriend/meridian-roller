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
        contractId: 'CAPAFWGKU4OX66NT53DTT5NOH6NPES5ZKBNPUVINUH6P562NAQ2MNPOD'
    }
};
export const Errors = {};
export class Client extends ContractClient {
    options;
    constructor(options) {
        super(
            new ContractSpec([
                'AAAAAAAAAXZEZXBsb3kgdGhlIGNvbnRyYWN0IFdhc20gYW5kIGFmdGVyIGRlcGxveW1lbnQgaW52b2tlIHRoZSBpbml0IGZ1bmN0aW9uCm9mIHRoZSBjb250cmFjdCB3aXRoIHRoZSBnaXZlbiBhcmd1bWVudHMuCgpUaGlzIGhhcyB0byBiZSBhdXRob3JpemVkIGJ5IGBkZXBsb3llcmAgKHVubGVzcyB0aGUgYERlcGxveWVyYCBpbnN0YW5jZQppdHNlbGYgaXMgdXNlZCBhcyBkZXBsb3llcikuIFRoaXMgd2F5IHRoZSB3aG9sZSBvcGVyYXRpb24gaXMgYXRvbWljCmFuZCBpdCdzIG5vdCBwb3NzaWJsZSB0byBmcm9udHJ1biB0aGUgY29udHJhY3QgaW5pdGlhbGl6YXRpb24uCgpSZXR1cm5zIHRoZSBjb250cmFjdCBJRCBhbmQgcmVzdWx0IG9mIHRoZSBpbml0IGZ1bmN0aW9uLgAAAAAABmRlcGxveQAAAAAABQAAAAAAAAAIZGVwbG95ZXIAAAATAAAAAAAAAAl3YXNtX2hhc2gAAAAAAAPuAAAAIAAAAAAAAAAEc2FsdAAAA+4AAAAgAAAAAAAAAAdpbml0X2ZuAAAAABEAAAAAAAAACWluaXRfYXJncwAAAAAAA+oAAAAAAAAAAQAAA+0AAAACAAAAEwAAAAA='
            ]),
            options
        );
        this.options = options;
    }
    fromJSON = {
        deploy: this.txFromJSON
    };
}
