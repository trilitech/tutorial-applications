import { NetworkType } from "@airgap/beacon-sdk";
import type { TezosContractAddress } from "./store";

// export const rpcUrl = "https://ghostnet.ecadinfra.com";
export const rpcUrl = "https://mainnet.api.tez.ie";
export const network = NetworkType.MAINNET;
export const dexAddress =
  "KT1TxqZ8QtKvLu3V3JH7Gx58n7Co8pgtpQU5" as TezosContractAddress;
export const tzbtcAddress =
  "KT1PWx2mnDueood7fEmfbBDKx1D9BAnnXitn" as TezosContractAddress;
export const sirsAddress =
  "KT1AafHA1C1vk959wvHWBispY9Y2f3fxBUUo" as TezosContractAddress;

export const XTZ = {
  decimals: 6
};

export const tzBTC = {
  decimals: 8
};
