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
        contractId: 'CBIWIU27G6LEEUD76ME6LVEMWRWTYWQA3BGYKHJDKUXVUWY3SUNWAQHP'
    }
};
export const Errors = {
    1: { message: 'WinnerFound' },
    2: { message: 'NotInitialized' },
    3: { message: 'AlreadyInitialized' },
    4: { message: 'NotCalled' },
    5: { message: 'AlreadyCalled' }
};
export class Client extends ContractClient {
    options;
    static async deploy(
        /** Constructor/Initialization Args for the contract's `__constructor` method */
        { admin, token_address, num_faces },
        /** Options for initalizing a Client as well as for calling a method, with extras specific to deploying. */
        options
    ) {
        return ContractClient.deploy({ admin, token_address, num_faces }, options);
    }
    constructor(options) {
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
        this.options = options;
    }
    fromJSON = {
        roll: this.txFromJSON,
        call_it: this.txFromJSON,
        be_evil: this.txFromJSON
    };
}
