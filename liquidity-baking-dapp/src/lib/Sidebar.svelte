<script lang="ts">
  import store from "../store";
  import Wallet from "./Wallet.svelte";
</script>

<style lang="scss">
  @import "../styles/settings.scss";

  .sidebar {
    height: 100%;
    border-right: solid 3px $powder-blue;
    display: grid;
    grid-template-rows: 20% 70% 10%;
    gap: 20px;

    .sidebar__dex {
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: center;
      gap: 10px;

      button {
        width: 80%;
      }
    }

    .sidebar__footer {
      text-align: center;
    }
  }

  @media screen and (max-height: 700px) {
    .sidebar {
      height: calc(100% - (20px * 2));
    }
  }
</style>

<aside class="sidebar">
  <Wallet />
  <div class="sidebar__dex">
    <button
      class="sidebar-button"
      class:active={$store.currentView === "swap"}
      on:click={() => store.updateView("swap")}
    >
      Swap
    </button>
    <button
      class="sidebar-button"
      class:active={$store.currentView === "add-liquidity"}
      on:click={() => store.updateView("add-liquidity")}
    >
      Add liquidity
    </button>
    <button
      class="sidebar-button"
      class:active={$store.currentView === "remove-liquidity"}
      on:click={() => store.updateView("remove-liquidity")}
    >
      Remove liquidity
    </button>
  </div>
  <div class="sidebar__footer">Liquidity Baking DEX</div>
</aside>
