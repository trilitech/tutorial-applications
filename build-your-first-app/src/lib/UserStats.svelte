<script lang="ts">
  import { fly } from "svelte/transition";
  import store from "../store";
  import { displayTokenAmount } from "../utils";
</script>

<style lang="scss">
  @import "../styles/settings.scss";

  .user-stats-container {
    padding: $padding;
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    border: solid 3px darken($powder-blue, 10);
    border-radius: $std-border-radius;
    margin: 20px;
    background-color: $powder-blue;
    width: 70%;

    .user-stats-container__info {
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

<div
  class="container user-stats-container"
  transition:fly={{ duration: 400, y: 200, delay: 500 }}
>
  <div class="user-stats-container__info">
    <div>XTZ balance</div>
    <div>
      {#if $store.userBalances.XTZ}
        {displayTokenAmount($store.userBalances.XTZ, "XTZ")}
      {:else}
        No balance
      {/if}
    </div>
  </div>
  <div class="user-stats-container__info">
    <div>tzBTC balance</div>
    <div>
      {#if $store.userBalances.tzBTC}
        {displayTokenAmount($store.userBalances.tzBTC, "tzBTC")}
      {:else}
        No balance
      {/if}
    </div>
  </div>
  <div class="user-stats-container__info">
    <div>SIRS balance</div>
    <div>
      {#if $store.userBalances.SIRS}
        {displayTokenAmount($store.userBalances.SIRS, "SIRS")}
      {:else}
        No balance
      {/if}
    </div>
  </div>
</div>
