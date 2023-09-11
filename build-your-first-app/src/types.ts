import type BigNumber from "bignumber.js";
import type { TezosContractAddress } from "./store";

export type token = "XTZ" | "tzBTC" | "SIRS";

export interface Storage {
  tokenPool: BigNumber;
  xtzPool: BigNumber;
  lqtTotal: BigNumber;
  tokenAddress: TezosContractAddress;
  lqtAddress: TezosContractAddress;
}

export enum TxStatus {
  NoTransaction,
  Loading,
  Success,
  Error
}
