<script lang="ts">
  import { afterUpdate, createEventDispatcher } from "svelte";
  import type { token } from "../types";
  import store from "../store";
  import { displayTokenAmount } from "../utils";
  import { XTZ, tzBTC } from "../config";

  let currentToken: token;
  const dispatch = createEventDispatcher();
  let insufficientBalance = false;

  export let inputVal: string,
    logoPos: "left" | "right",
    token: token,
    disabled: boolean,
    reset: boolean;

  const addMax = () => {
    if (
      $store.userBalances[currentToken] &&
      $store.userBalances[currentToken] > 0
    ) {
      let value = (() => {
        if (currentToken === "XTZ") {
          return $store.userBalances[currentToken] / 10 ** XTZ.decimals;
        } else if (currentToken === "tzBTC") {
          return $store.userBalances[currentToken] / 10 ** tzBTC.decimals;
        } else if (currentToken === "SIRS") {
          return $store.userBalances[currentToken];
        } else {
          return 0;
        }
      })();
      inputAmount({ target: { value } });
    }
  };

  const calculateInsufficientBalance = (val: number) => {
    if ($store.userAddress) {
      if (
        (token === "XTZ" && !$store.userBalances.XTZ) ||
        (token === "tzBTC" && !$store.userBalances.tzBTC)
      ) {
        insufficientBalance = true;
      } else if (
        token === "XTZ" &&
        $store.userBalances.XTZ &&
        $store.userBalances.XTZ < val * 10 ** 6
      ) {
        insufficientBalance = true;
      } else if (
        token === "tzBTC" &&
        $store.userBalances.tzBTC &&
        $store.userBalances.tzBTC < val * 10 ** 8
      ) {
        insufficientBalance = true;
      } else {
        insufficientBalance = false;
      }
    }
  };

  const inputAmount = ev => {
    const val = +ev.target.value;
    // validates numeric input
    if (!isNaN(+val)) {
      // checks if user has enough balance
      calculateInsufficientBalance(val);
      dispatch("new-input", { token, val, insufficientBalance });
    } else {
      dispatch("new-input", { token, val: null, insufficientBalance });
    }
  };

  afterUpdate(() => {
    // validates the token
    if (["XTZ", "tzBTC", "SIRS"].includes(token)) {
      currentToken = token;
    } else {
      currentToken = undefined;
    }
    // resets the input
    if (reset && !disabled) {
      insufficientBalance = false;
      if (!isNaN(+inputVal)) {
        calculateInsufficientBalance(+inputVal);
      }
    }
  });
</script>

{#if currentToken}
  <div
    class={`input-with-logo ${logoPos === "left" ? "left-logo" : "right-logo"}`}
  >
    <div class="input-with-logo__input">
      {#if logoPos === "left"}
        <img src={`images/${token}.png`} alt={token} />
      {/if}
      <input
        class:error={insufficientBalance}
        type="text"
        value={inputVal}
        on:input={inputAmount}
        maxlength="8"
        {disabled}
      />
      {#if logoPos === "right"}
        <img src={`images/${token}.png`} alt={token} />
      {/if}
    </div>
    <button class="input-with-logo__max transparent" on:click={addMax}>
      {#if $store.userAddress}
        Max: {$store.userBalances[currentToken]
          ? displayTokenAmount($store.userBalances[currentToken], currentToken)
          : 0}
      {:else}
        No balance
      {/if}
    </button>
  </div>
{/if}
