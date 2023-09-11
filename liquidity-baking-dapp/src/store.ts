import { writable } from "svelte/store";
import type { TezosToolkit } from "@taquito/taquito";
import type { BeaconWallet } from "@taquito/beacon-wallet";
import type { token, Storage } from "./types";

export type TezosContractAddress = `KT1${string}`;
export type TezosAccountAddress = `tz${"1" | "2" | "3"}${string}`;

interface State {
  Tezos: TezosToolkit;
  wallet: BeaconWallet;
  userAddress: TezosAccountAddress;
  currentView: "swap" | "add-liquidity" | "remove-liquidity";
  userBalances: {
    XTZ: null | number;
    tzBTC: null | number;
    SIRS: null | number;
  };
  dexInfo: Storage | undefined;
  xtzExchangeRate: number | null;
  tzbtcExchangeRate: number | null;
  toast: { show: boolean; text: string };
}

const initialState: State = {
  Tezos: undefined,
  wallet: undefined,
  userAddress: undefined,
  currentView: "swap",
  userBalances: { XTZ: null, tzBTC: null, SIRS: null },
  dexInfo: undefined,
  xtzExchangeRate: null,
  tzbtcExchangeRate: null,
  toast: { show: false, text: "This is a test" }
};

const store = writable(initialState);

const state = {
  subscribe: store.subscribe,
  updateTezos: (tezos: TezosToolkit) =>
    store.update(store => ({ ...store, Tezos: tezos })),
  updateWallet: (wallet: BeaconWallet | undefined) =>
    store.update(store => ({ ...store, wallet })),
  updateUserAddress: (address: TezosAccountAddress | undefined) => {
    store.update(store => ({
      ...store,
      userAddress: address
    }));
  },
  updateView: (view: State["currentView"]) =>
    store.update(store => ({ ...store, currentView: view })),
  updateUserBalance: (token: token, balance: null | number) =>
    store.update(store => {
      if (balance >= 0) {
        return {
          ...store,
          userBalances: { ...store.userBalances, [token]: balance }
        };
      } else {
        return store;
      }
    }),
  updateDexInfo: (info: Storage) =>
    store.update(store => ({ ...store, dexInfo: info })),
  updateExchangeRates: (
    updates: Array<{
      token: Exclude<token, "SIRS">;
      exchangeRate: number | null;
    }>
  ) =>
    store.update(store => {
      return updates.reduce((acc, update) => {
        if (update.token === "XTZ") {
          return { ...acc, xtzExchangeRate: update.exchangeRate };
        } else if (update.token === "tzBTC") {
          return { ...acc, tzbtcExchangeRate: update.exchangeRate };
        } else {
          return acc;
        }
      }, store);
    }),
  updateToast: (state: boolean, text: string) =>
    store.update(store => ({
      ...store,
      toast: { show: state, text }
    })),
  showToast: (state: boolean) =>
    store.update(store => ({
      ...store,
      toast: { show: state, text: !state ? "" : store.toast.text }
    }))
};

export default state;
