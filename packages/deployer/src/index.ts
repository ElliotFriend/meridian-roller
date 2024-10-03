import { Buffer } from "buffer";
import { Address } from '@stellar/stellar-sdk';
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  Result,
  Spec as ContractSpec,
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
  Duration,
} from '@stellar/stellar-sdk/contract';
export * from '@stellar/stellar-sdk'
export * as contract from '@stellar/stellar-sdk/contract'
export * as rpc from '@stellar/stellar-sdk/rpc'

if (typeof window !== 'undefined') {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}


export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CAPAFWGKU4OX66NT53DTT5NOH6NPES5ZKBNPUVINUH6P562NAQ2MNPOD",
  }
} as const

export const Errors = {

}

export interface Client {
  /**
   * Construct and simulate a deploy transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Deploy the contract Wasm and after deployment invoke the init function
   * of the contract with the given arguments.
   * 
   * This has to be authorized by `deployer` (unless the `Deployer` instance
   * itself is used as deployer). This way the whole operation is atomic
   * and it's not possible to frontrun the contract initialization.
   * 
   * Returns the contract ID and result of the init function.
   */
  deploy: ({deployer, wasm_hash, salt, init_fn, init_args}: {deployer: string, wasm_hash: Buffer, salt: Buffer, init_fn: string, init_args: Array<any>}, options?: {
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
  }) => Promise<AssembledTransaction<readonly [string, any]>>

}
export class Client extends ContractClient {
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAAAAAXZEZXBsb3kgdGhlIGNvbnRyYWN0IFdhc20gYW5kIGFmdGVyIGRlcGxveW1lbnQgaW52b2tlIHRoZSBpbml0IGZ1bmN0aW9uCm9mIHRoZSBjb250cmFjdCB3aXRoIHRoZSBnaXZlbiBhcmd1bWVudHMuCgpUaGlzIGhhcyB0byBiZSBhdXRob3JpemVkIGJ5IGBkZXBsb3llcmAgKHVubGVzcyB0aGUgYERlcGxveWVyYCBpbnN0YW5jZQppdHNlbGYgaXMgdXNlZCBhcyBkZXBsb3llcikuIFRoaXMgd2F5IHRoZSB3aG9sZSBvcGVyYXRpb24gaXMgYXRvbWljCmFuZCBpdCdzIG5vdCBwb3NzaWJsZSB0byBmcm9udHJ1biB0aGUgY29udHJhY3QgaW5pdGlhbGl6YXRpb24uCgpSZXR1cm5zIHRoZSBjb250cmFjdCBJRCBhbmQgcmVzdWx0IG9mIHRoZSBpbml0IGZ1bmN0aW9uLgAAAAAABmRlcGxveQAAAAAABQAAAAAAAAAIZGVwbG95ZXIAAAATAAAAAAAAAAl3YXNtX2hhc2gAAAAAAAPuAAAAIAAAAAAAAAAEc2FsdAAAA+4AAAAgAAAAAAAAAAdpbml0X2ZuAAAAABEAAAAAAAAACWluaXRfYXJncwAAAAAAA+oAAAAAAAAAAQAAA+0AAAACAAAAEwAAAAA=" ]),
      options
    )
  }
  public readonly fromJSON = {
    deploy: this.txFromJSON<readonly [string, any]>
  }
}