"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HorizonApi = void 0;
/* tslint:disable-next-line:no-namespace */
let HorizonApi = exports.HorizonApi = void 0;
(function (_HorizonApi) {
  let LiquidityPoolType = /*#__PURE__*/function (LiquidityPoolType) {
    LiquidityPoolType["constantProduct"] = "constant_product";
    return LiquidityPoolType;
  }({});
  _HorizonApi.LiquidityPoolType = LiquidityPoolType;
  let OperationResponseType = /*#__PURE__*/function (OperationResponseType) {
    OperationResponseType["createAccount"] = "create_account";
    OperationResponseType["payment"] = "payment";
    OperationResponseType["pathPayment"] = "path_payment_strict_receive";
    OperationResponseType["createPassiveOffer"] = "create_passive_sell_offer";
    OperationResponseType["manageOffer"] = "manage_sell_offer";
    OperationResponseType["setOptions"] = "set_options";
    OperationResponseType["changeTrust"] = "change_trust";
    OperationResponseType["allowTrust"] = "allow_trust";
    OperationResponseType["accountMerge"] = "account_merge";
    OperationResponseType["inflation"] = "inflation";
    OperationResponseType["manageData"] = "manage_data";
    OperationResponseType["bumpSequence"] = "bump_sequence";
    OperationResponseType["manageBuyOffer"] = "manage_buy_offer";
    OperationResponseType["pathPaymentStrictSend"] = "path_payment_strict_send";
    OperationResponseType["createClaimableBalance"] = "create_claimable_balance";
    OperationResponseType["claimClaimableBalance"] = "claim_claimable_balance";
    OperationResponseType["beginSponsoringFutureReserves"] = "begin_sponsoring_future_reserves";
    OperationResponseType["endSponsoringFutureReserves"] = "end_sponsoring_future_reserves";
    OperationResponseType["revokeSponsorship"] = "revoke_sponsorship";
    OperationResponseType["clawback"] = "clawback";
    OperationResponseType["clawbackClaimableBalance"] = "clawback_claimable_balance";
    OperationResponseType["setTrustLineFlags"] = "set_trust_line_flags";
    OperationResponseType["liquidityPoolDeposit"] = "liquidity_pool_deposit";
    OperationResponseType["liquidityPoolWithdraw"] = "liquidity_pool_withdraw";
    OperationResponseType["invokeHostFunction"] = "invoke_host_function";
    OperationResponseType["bumpFootprintExpiration"] = "bump_footprint_expiration";
    OperationResponseType["restoreFootprint"] = "restore_footprint";
    return OperationResponseType;
  }({});
  _HorizonApi.OperationResponseType = OperationResponseType;
  let OperationResponseTypeI = /*#__PURE__*/function (OperationResponseTypeI) {
    OperationResponseTypeI[OperationResponseTypeI["createAccount"] = 0] = "createAccount";
    OperationResponseTypeI[OperationResponseTypeI["payment"] = 1] = "payment";
    OperationResponseTypeI[OperationResponseTypeI["pathPayment"] = 2] = "pathPayment";
    OperationResponseTypeI[OperationResponseTypeI["createPassiveOffer"] = 3] = "createPassiveOffer";
    OperationResponseTypeI[OperationResponseTypeI["manageOffer"] = 4] = "manageOffer";
    OperationResponseTypeI[OperationResponseTypeI["setOptions"] = 5] = "setOptions";
    OperationResponseTypeI[OperationResponseTypeI["changeTrust"] = 6] = "changeTrust";
    OperationResponseTypeI[OperationResponseTypeI["allowTrust"] = 7] = "allowTrust";
    OperationResponseTypeI[OperationResponseTypeI["accountMerge"] = 8] = "accountMerge";
    OperationResponseTypeI[OperationResponseTypeI["inflation"] = 9] = "inflation";
    OperationResponseTypeI[OperationResponseTypeI["manageData"] = 10] = "manageData";
    OperationResponseTypeI[OperationResponseTypeI["bumpSequence"] = 11] = "bumpSequence";
    OperationResponseTypeI[OperationResponseTypeI["manageBuyOffer"] = 12] = "manageBuyOffer";
    OperationResponseTypeI[OperationResponseTypeI["pathPaymentStrictSend"] = 13] = "pathPaymentStrictSend";
    OperationResponseTypeI[OperationResponseTypeI["createClaimableBalance"] = 14] = "createClaimableBalance";
    OperationResponseTypeI[OperationResponseTypeI["claimClaimableBalance"] = 15] = "claimClaimableBalance";
    OperationResponseTypeI[OperationResponseTypeI["beginSponsoringFutureReserves"] = 16] = "beginSponsoringFutureReserves";
    OperationResponseTypeI[OperationResponseTypeI["endSponsoringFutureReserves"] = 17] = "endSponsoringFutureReserves";
    OperationResponseTypeI[OperationResponseTypeI["revokeSponsorship"] = 18] = "revokeSponsorship";
    OperationResponseTypeI[OperationResponseTypeI["clawback"] = 19] = "clawback";
    OperationResponseTypeI[OperationResponseTypeI["clawbackClaimableBalance"] = 20] = "clawbackClaimableBalance";
    OperationResponseTypeI[OperationResponseTypeI["setTrustLineFlags"] = 21] = "setTrustLineFlags";
    OperationResponseTypeI[OperationResponseTypeI["liquidityPoolDeposit"] = 22] = "liquidityPoolDeposit";
    OperationResponseTypeI[OperationResponseTypeI["liquidityPoolWithdraw"] = 23] = "liquidityPoolWithdraw";
    OperationResponseTypeI[OperationResponseTypeI["invokeHostFunction"] = 24] = "invokeHostFunction";
    OperationResponseTypeI[OperationResponseTypeI["bumpFootprintExpiration"] = 25] = "bumpFootprintExpiration";
    OperationResponseTypeI[OperationResponseTypeI["restoreFootprint"] = 26] = "restoreFootprint";
    return OperationResponseTypeI;
  }({});
  _HorizonApi.OperationResponseTypeI = OperationResponseTypeI;
  ;
  let TransactionFailedResultCodes = /*#__PURE__*/function (TransactionFailedResultCodes) {
    TransactionFailedResultCodes["TX_FAILED"] = "tx_failed";
    TransactionFailedResultCodes["TX_BAD_SEQ"] = "tx_bad_seq";
    TransactionFailedResultCodes["TX_BAD_AUTH"] = "tx_bad_auth";
    TransactionFailedResultCodes["TX_BAD_AUTH_EXTRA"] = "tx_bad_auth_extra";
    TransactionFailedResultCodes["TX_FEE_BUMP_INNER_SUCCESS"] = "tx_fee_bump_inner_success";
    TransactionFailedResultCodes["TX_FEE_BUMP_INNER_FAILED"] = "tx_fee_bump_inner_failed";
    TransactionFailedResultCodes["TX_NOT_SUPPORTED"] = "tx_not_supported";
    TransactionFailedResultCodes["TX_SUCCESS"] = "tx_success";
    TransactionFailedResultCodes["TX_TOO_EARLY"] = "tx_too_early";
    TransactionFailedResultCodes["TX_TOO_LATE"] = "tx_too_late";
    TransactionFailedResultCodes["TX_MISSING_OPERATION"] = "tx_missing_operation";
    TransactionFailedResultCodes["TX_INSUFFICIENT_BALANCE"] = "tx_insufficient_balance";
    TransactionFailedResultCodes["TX_NO_SOURCE_ACCOUNT"] = "tx_no_source_account";
    TransactionFailedResultCodes["TX_INSUFFICIENT_FEE"] = "tx_insufficient_fee";
    TransactionFailedResultCodes["TX_INTERNAL_ERROR"] = "tx_internal_error";
    return TransactionFailedResultCodes;
  }({});
  _HorizonApi.TransactionFailedResultCodes = TransactionFailedResultCodes;
})(HorizonApi || (exports.HorizonApi = HorizonApi = {}));