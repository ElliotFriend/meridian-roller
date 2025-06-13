import { PUBLIC_STELLAR_NETWORK_PASSPHRASE } from "$env/static/public";
import { Address, hash, xdr, StrKey } from "@stellar/stellar-sdk/minimal";

export function getContractAddress(address: Address, salt: Buffer): string {
    let cidPreimage = xdr.ContractIdPreimage.contractIdPreimageFromAddress(
        new xdr.ContractIdPreimageFromAddress({
            address: address.toScAddress(),
            salt: salt,
        })
    )

    let hidPreimage = xdr.HashIdPreimage.envelopeTypeContractId(
        new xdr.HashIdPreimageContractId({
            networkId: hash(Buffer.from(PUBLIC_STELLAR_NETWORK_PASSPHRASE)),
            contractIdPreimage: cidPreimage,
        })
    )

    return StrKey.encodeContract(hash(
        hidPreimage.toXDR()
    ))
}
