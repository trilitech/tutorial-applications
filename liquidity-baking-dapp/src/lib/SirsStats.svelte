<script lang="ts">
  import { afterUpdate } from "svelte";
  import store from "../store";
  import { displayTokenAmount } from "../utils";

  let totalValue = "";

  afterUpdate(() => {
    if ($store.dexInfo && $store.xtzExchangeRate && $store.tzbtcExchangeRate) {
      const xtzValueInUsd = $store.dexInfo.xtzPool
        .dividedBy(10 ** 6)
        .times($store.xtzExchangeRate);
      const tzbtcValueInUsd = $store.dexInfo.tokenPool
        .dividedBy(10 ** 8)
        .times($store.tzbtcExchangeRate);

      totalValue = xtzValueInUsd
        .plus(tzbtcValueInUsd)
        .decimalPlaces(2)
        .toNumber()
        .toLocaleString("en-US");
    }
  });
</script>

<style lang="scss">
  @import "../styles/settings.scss";

  .stats-container {
    padding: $padding;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    border: solid 3px darken($powder-blue, 10);
    border-radius: $std-border-radius;
    margin: 20px;
    background-color: $powder-blue;
    width: 70%;

    .stats-container__info {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      & div:last-child {
        font-weight: bold;
      }
    }
  }
</style>

<div class="stats-container">
  {#if $store.dexInfo}
    <div class="stats-container__info">
      <div>XTZ pool</div>
      <div>{displayTokenAmount($store.dexInfo.xtzPool, "XTZ")}</div>
    </div>
    <div class="stats-container__info">
      <div>tzBTC pool</div>
      <div>{displayTokenAmount($store.dexInfo.tokenPool, "tzBTC")}</div>
    </div>
    <div class="stats-container__info">
      <div>LQT pool</div>
      <div>{displayTokenAmount($store.dexInfo.lqtTotal, "SIRS")}</div>
    </div>
    <div class="stats-container__info">
      <div>Total value</div>
      <div>
        {#if totalValue}
          ${totalValue}
        {:else}
          ---
        {/if}
      </div>
    </div>
  {:else}
    Loading Sirius DEX details...
  {/if}
</div>
