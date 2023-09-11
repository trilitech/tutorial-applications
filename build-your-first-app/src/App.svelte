<script lang="ts">
  import { onMount } from "svelte";
  import { TezosToolkit } from "@taquito/taquito";
  import store from "./store";
  import { rpcUrl, dexAddress } from "./config";
  import Sidebar from "./lib/Sidebar.svelte";
  import Interface from "./lib/Interface.svelte";
  import Toast from "./lib/Toast.svelte";
  import type { Storage } from "./types";
  import { fetchExchangeRates } from "./utils";

  onMount(async () => {
    const Tezos = new TezosToolkit(rpcUrl);
    store.updateTezos(Tezos);
    const contract = await Tezos.wallet.at(dexAddress);
    const storage: Storage | undefined = await contract.storage();

    if (storage) {
      store.updateDexInfo({ ...storage });
    }

    // fetches XTZ and tzBTC prices
    const res = await fetchExchangeRates();
    if (res) {
      store.updateExchangeRates([
        { token: "XTZ", exchangeRate: res.xtzPrice },
        { token: "tzBTC", exchangeRate: res.tzbtcPrice }
      ]);
    } else {
      store.updateExchangeRates([
        { token: "XTZ", exchangeRate: null },
        { token: "tzBTC", exchangeRate: null }
      ]);
    }
  });
</script>

<style lang="scss">
  @import "./styles/settings.scss";

  main {
    display: grid;
    grid-template-columns: 250px 1fr;
    gap: $padding;
    padding: $padding;
    height: calc(100% - (#{$padding} * 2));
  }

  @media screen and (max-height: 700px) {
    main {
      padding: 0px;
      height: 100%;
    }
  }
</style>

<main>
  <Toast />
  {#if $store.Tezos && $store.dexInfo}
    <Sidebar />
    <Interface />
  {:else}
    <div>Loading</div>
  {/if}
</main>
