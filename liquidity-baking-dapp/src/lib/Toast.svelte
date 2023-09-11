<script lang="ts">
  import { fly } from "svelte/transition";
  import store from "../store";
</script>

<style lang="scss">
  @import "../styles/settings.scss";

  .toast {
    position: absolute;
    bottom: 30px;
    right: 30px;
    padding: $padding;
    border-radius: $std-border-radius;
    background-color: $prussian-blue;
    color: white;
    box-shadow: rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px;

    .toast__close {
      height: 25px;
      width: 25px;
      position: absolute;
      top: -7px;
      right: -7px;
      color: white;
      background-color: $prussian-blue;
      border: none;
      border-radius: 50%;
      padding: 10px;
      display: flex;
      justify-content: center;
      align-items: center;

      img {
        height: 20px;
        width: 20px;
      }
    }
  }
</style>

{#if $store.toast.show}
  <div class="toast" transition:fly={{ x: 200, duration: 400 }}>
    <button class="toast__close" on:click={() => store.showToast(false)}>
      <img src="images/x-white.svg" alt="close" />
    </button>
    <div>{$store.toast.text}</div>
  </div>
{/if}
