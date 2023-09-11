<script lang="ts">
  import store from "../store";
  import SwapView from "./SwapView.svelte";
  import AddLiquidityView from "./AddLiquidityView.svelte";
  import RemoveLiquidityView from "./RemoveLiquidityView.svelte";
  import UserStats from "./UserStats.svelte";
  import SirsStats from "./SirsStats.svelte";
</script>

<style lang="scss">
  .interface-container {
    display: grid;
    grid-template-rows: 20% 60% 20%;
    justify-items: center;
    align-items: center;
  }
</style>

<div class="interface-container">
  <SirsStats />
  {#if $store.currentView === "swap"}
    <SwapView />
  {:else if $store.currentView === "add-liquidity"}
    <AddLiquidityView />
  {:else if $store.currentView === "remove-liquidity"}
    <RemoveLiquidityView />
  {/if}
  {#if $store.userAddress}
    <UserStats />
  {/if}
</div>
