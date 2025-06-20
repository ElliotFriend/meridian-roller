import { Buffer } from 'buffer';
import {
    Client as ContractClient,
    Spec as ContractSpec,
} from '@stellar/stellar-sdk/minimal/contract';
if (typeof window !== 'undefined') {
    //@ts-ignore Buffer exists
    window.Buffer = window.Buffer || Buffer;
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
export class Client extends ContractClient {
    options;
    static async deploy(
        /** Constructor/Initialization Args for the contract's `__constructor` method */
        { admin, token_address, num_dice, num_faces },
        /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
        options,
    ) {
        return ContractClient.deploy({ admin, token_address, num_dice, num_faces }, options);
    }
    constructor(options) {
        super(
            new ContractSpec([
                'AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAABwAAAAAAAAAAAAAABUFkbWluAAAAAAAAAAAAAAAAAAAMVG9rZW5BZGRyZXNzAAAAAAAAAAAAAAAGV2lubmVyAAAAAAABAAAAAAAAAAZSb2xsZXIAAAAAAAEAAAATAAAAAAAAAAAAAAAMRXZlcnlvbmVXaW5zAAAAAAAAAAAAAAAHTnVtRGljZQAAAAAAAAAAAAAAAAhOdW1GYWNlcw==',
                'AAAAAQAAAAAAAAAAAAAABlJvbGxlcgAAAAAABAAAAAAAAAAKZmlyc3Rfcm9sbAAAAAAABAAAAAAAAAAJaGlnaF9yb2xsAAAAAAAABAAAAAAAAAANbGVkZ2VyX251bWJlcgAAAAAAAAQAAAAAAAAADHRpbWVzX3JvbGxlZAAAAAQ=',
                'AAAABAAAAAAAAAAAAAAABUVycm9yAAAAAAAAAwAAAAAAAAALV2lubmVyRm91bmQAAAAAAQAAADBZb3UgY2FuJ3QgYmUgZXZpbC4gVGhlIGdhbWUgaGFzIG5vdCBiZWVuIGNhbGxlZC4AAAAJTm90Q2FsbGVkAAAAAAAAAgAAACFUaGUgZ2FtZSBoYXMgYWxyZWFkeSBiZWVuIGNhbGxlZC4AAAAAAAANQWxyZWFkeUNhbGxlZAAAAAAAAAM=',
                'AAAAAAAAAfdJbml0aWFsaXplIGEgbmV3IGdhbWUgY29udHJhY3QuCgojIEFyZ3VtZW50cwoqIGBhZG1pbmAgLSBhZGRyZXNzIGNvcnJlc3BvbmRpbmcgdG8gdGhlIGNyZWF0b3Igb2YgdGhpcyBnYW1lLgoqIGB0b2tlbl9hZGRyZXNzYCAtIGFkZHJlc3MgZm9yIHRoZSBhc3NldCBjb250cmFjdCB0aGF0IHdpbGwgYmUgdXNlZCBmb3IKcGF5bWVudHMgdG8gYW5kIGZyb20gdGhlIHByaXplIHBvdC4KKiBgbnVtX2RpY2VgIC0gbnVtYmVyIG9mIGRpY2UgdG8gcm9sbC4KKiBgbnVtX2ZhY2VzYCAtIG51bWJlciBvZiBmYWNlcyBvbiBlYWNoIGRpZSB0aGF0IHdpbGwgYmUgcm9sbGVkIGR1cmluZwp0aGUgY291cnNlIG9mIHRoZSBnYW1lLgoKIyBQYW5pY3MKKiBJZiB0aGUgY29udHJhY3QgaXMgYWxyZWFkeSBpbml0aWFsaXplZAoKIyBFdmVudHMKRW1pdHMgYW4gZXZlbnQgd2l0aCB0aGUgdG9waWNzIGBbIlJPTExFUiIsICJyZWFkeSIsIGFkbWluOiBBZGRyZXNzXSwKZGF0YSA9IG51bV9mYWNlczogdTMyYAAAAAANX19jb25zdHJ1Y3RvcgAAAAAAAAQAAAAAAAAABWFkbWluAAAAAAAAEwAAAAAAAAANdG9rZW5fYWRkcmVzcwAAAAAAABMAAAAAAAAACG51bV9kaWNlAAAABAAAAAAAAAAJbnVtX2ZhY2VzAAAAAAAABAAAAAA=',
                'AAAAAAAAAqNSb2xsIHRoZSBkaWNlCgojIEFyZ3VtZW50cwoqIGByb2xsZXJgIC0gYWRkcmVzcyByb2xsaW5nIHRoZSBkaWNlIGR1cmluZyB0aGlzIHR1cm4uCgojIFBhbmljcwoqIElmIHRoZSBjb250cmFjdCBoYXMgbm90IHlldCBiZWVuIGluaXRpYWxpemVkCiogSWYgYSB3aW5uZXIgaGFzIGFscmVhZHkgYmVlbiBmb3VuZCwgYW5kIHRoZXkndmUgY2xhaW1lZCB0aGUgcHJpemUgcG90CgojIEV2ZW50cwpFbWl0cyBvbmUgb2YgdHdvIGV2ZW50cywgZGVwZW5kaW5nIG9uIHRoZSByb2xsZWQgdmFsdWU6CgoqIEZvciBhIG5vbi13aW5uaW5nIHJvbGwsIGVtaXRzIGFuIGV2ZW50IHdpdGggdG9waWNzIGBbIlJPTExFUiIsCiJyb2xsZWQiLCByb2xsZXI6IEFkZHJlc3NdLCBkYXRhID0gdG90YWw6IHUzMmAKKiBGb3IgYSB3aW5uaW5nIHJvbGwsIGVtaXRzIGFuIGV2ZW50IHdpdGggdG9waWNzIGBbIlJPTExFUiIsICJ3aW5uZXIiLApyb2xsZXI6IEFkZHJlc3NdLCBkYXRhID0gcHJpemVfcG90OiB1MzJgCgpJZiB0aGUgZ2FtZSBoYXMgYWxyZWFkeSBiZWVuICJjYWxsZWQiIGJ5IHRoZSBhZG1pbiwgYW5kIHRoZXJlZm9yZQpldmVyeW9uZSBpcyBoZW5jZWZvcnRoIGEgd2lubmVyLCBubyBldmVudCBpcyBlbWl0dGVkIGFuZCBhICJqYWNrcG90Igpyb2xsIGlzIHNpbXBseSByZXR1cm5lZCB0byB0aGUgdXNlci4AAAAABHJvbGwAAAABAAAAAAAAAAZyb2xsZXIAAAAAABMAAAABAAAD6gAAAAQ=',
                'AAAAAAAAAStDYWxsIHRoZSBnYW1lIG9mZgoKIyBQYW5pY3MKKiBJZiB0aGUgY29udHJhY3QgaGFzIG5vdCB5ZXQgYmVlbiBpbml0aWFsaXplZAoqIElmIGEgd2lubmVyIGhhcyBhbHJlYWR5IGJlZW4gZm91bmQsIGFuZCB0aGV5J3ZlIGNsYWltZWQgdGhlIHByaXplIHBvdAoqIElmIHRoZSBnYW1lIGhhcyBhbHJlYWR5IGJlZW4gImNhbGxlZCIgYnkgdGhlIGFkbWluCgojIEV2ZW50cwpFbWl0cyBhbiBldmVudCB3aXRoIHRvcGljcyBgWyJST0xMRVIiLCAiY2FsbGVkIiwgYWRtaW46IEFkZHJlc3NdLCBkYXRhCj0gcHJpemVfcG90OiBpMTI4YAAAAAAHY2FsbF9pdAAAAAAAAAAAAA==',
                'AAAAAAAAAB9Tc3NzaGhoLi4uIE5vdGhpbmcgdG8gc2VlIGhlcmUuAAAAAAdiZV9ldmlsAAAAAAAAAAABAAAACw==',
            ]),
            options,
        );
        this.options = options;
    }
    fromJSON = {
        roll: this.txFromJSON,
        call_it: this.txFromJSON,
        be_evil: this.txFromJSON,
    };
}
