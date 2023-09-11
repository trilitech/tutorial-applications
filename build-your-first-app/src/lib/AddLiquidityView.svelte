<script lang="ts">
  import { OpKind } from "@taquito/taquito";
  import store from "../store";
  import UserInput from "./UserInput.svelte";
  import { type token, TxStatus } from "../types";
  import {
    addLiquidityTokenIn,
    tokenToXtzXtzOutput,
    addLiquidityLiquidityCreated
  } from "../lbUtils";
  import { dexAddress, tzbtcAddress, XTZ, tzBTC } from "../config";
  import { calcDeadline, fetchBalances } from "../utils";

  let inputXtz = "";
  let inputTzbtc = "";
  let sirsOutput = 0;
  let addLiquidityStatus = TxStatus.NoTransaction;
  let resetXtzInput = false;
  let resetTzbtcInput = false;

  const saveInput = ev => {
    const { token, val }: { token: token; val: number | null } = ev.detail;
    if (token === "XTZ" && val && val > 0) {
      inputXtz = val.toString();
      let tzbtcAmount = addLiquidityTokenIn({
        xtzIn: val * 10 ** 6,
        xtzPool: $store.dexInfo.xtzPool,
        tokenPool: $store.dexInfo.tokenPool
      });
      if (tzbtcAmount) {
        inputTzbtc = tzbtcAmount.dividedBy(10 ** 8).toPrecision(6);
      } else {
        inputTzbtc = "";
      }

      const liquidityCreated = addLiquidityLiquidityCreated({
        xtzIn: val * 10 ** 6,
        xtzPool: $store.dexInfo.xtzPool,
        totalLiquidity: $store.dexInfo.lqtTotal
      });
      if (liquidityCreated) {
        sirsOutput = Math.floor(liquidityCreated.toNumber());
      } else {
        sirsOutput = 0;
      }
    } else if (token === "tzBTC" && val && val > 0) {
      inputTzbtc = val.toString();
      let xtzAmount = tokenToXtzXtzOutput({
        tokenIn: val * 10 ** 8,
        xtzPool: $store.dexInfo.xtzPool,
        tokenPool: $store.dexInfo.tokenPool
      });
      if (xtzAmount) {
        inputXtz = xtzAmount.dividedBy(10 ** 6).toPrecision(8);

        const liquidityCreated = addLiquidityLiquidityCreated({
          xtzIn: xtzAmount,
          xtzPool: $store.dexInfo.xtzPool,
          totalLiquidity: $store.dexInfo.lqtTotal
        });
        if (liquidityCreated) {
          sirsOutput = Math.floor(liquidityCreated.toNumber());
        } else {
          sirsOutput = 0;
        }
      } else {
        inputXtz = "";
      }
    } else {
      inputXtz = "";
      inputTzbtc = "";
      sirsOutput = 0;
    }
  };

  const addLiquidity = async () => {
    try {
      if (inputXtz && inputTzbtc && sirsOutput) {
        addLiquidityStatus = TxStatus.Loading;
        store.updateToast(
          true,
          "Adding liquidity, waiting for confirmation..."
        );

        const tzbtcForLiquidity = Math.floor(
          +inputTzbtc * 10 ** tzBTC.decimals
        );

        const lbContract = await $store.Tezos.wallet.at(dexAddress);
        const tzBtcContract = await $store.Tezos.wallet.at(tzbtcAddress);

        const batch = $store.Tezos.wallet.batch([
          {
            kind: OpKind.TRANSACTION,
            ...tzBtcContract.methods.approve(dexAddress, 0).toTransferParams()
          },
          {
            kind: OpKind.TRANSACTION,
            ...tzBtcContract.methods
              .approve(dexAddress, tzbtcForLiquidity)
              .toTransferParams()
          },
          {
            kind: OpKind.TRANSACTION,
            ...lbContract.methodsObject
              .addLiquidity({
                owner: $store.userAddress,
                minLqtMinted: sirsOutput,
                maxTokensDeposited: tzbtcForLiquidity,
                deadline: calcDeadline()
              })
              .toTransferParams(),
            amount: +inputXtz
          },
          {
            kind: OpKind.TRANSACTION,
            ...tzBtcContract.methods.approve(dexAddress, 0).toTransferParams()
          }
        ]);
        const batchOp = await batch.send();
        await batchOp.confirmation();

        addLiquidityStatus = TxStatus.Success;
        inputXtz = "";
        inputTzbtc = "";
        sirsOutput = 0;

        // fetches user's XTZ, tzBTC and SIRS balances
        const res = await fetchBalances($store.Tezos, $store.userAddress);
        if (res) {
          store.updateUserBalance("XTZ", res.xtzBalance);
          store.updateUserBalance("tzBTC", res.tzbtcBalance);
          store.updateUserBalance("SIRS", res.sirsBalance);
        } else {
          store.updateUserBalance("XTZ", null);
          store.updateUserBalance("tzBTC", null);
          store.updateUserBalance("SIRS", null);
        }
      } else {
        throw "Missing value for XTZ, tzBTC or SIRS";
      }

      store.updateToast(true, "Liquidity successfully added!");
    } catch (error) {
      console.error(error);
      addLiquidityStatus = TxStatus.Error;
      store.updateToast(true, "An error has occurred");
    } finally {
      setTimeout(() => {
        addLiquidityStatus = TxStatus.NoTransaction;
        store.showToast(false);
      }, 3000);
    }
  };
</script>

<style lang="scss">
  @import "../styles/settings.scss";

  .add-liquidity-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 20px;
    border: solid 3px darken($powder-blue, 10);
    border-radius: $std-border-radius;
    padding: calc(#{$padding} * 3);

    .add-liquidity-inputs {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 20px;
    }

    .add-liquidity-output {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 10px;

      img {
        height: 28px;
        width: 28px;
      }
    }
  }
</style>

<div class="container add-liquidity-container">
  <h1>Add liquidity</h1>
  <div class="add-liquidity-inputs">
    <UserInput
      token="XTZ"
      inputVal={inputXtz}
      logoPos="left"
      on:new-input={saveInput}
      disabled={false}
      reset={resetXtzInput}
    />
    <UserInput
      token="tzBTC"
      inputVal={inputTzbtc}
      logoPos="right"
      on:new-input={saveInput}
      disabled={false}
      reset={resetTzbtcInput}
    />
  </div>
  <div class="add-liquidity-output">
    <img src="images/SIRS.png" alt="SIRS" />
    <span>{sirsOutput} SIRS</span>
  </div>
  <button
    class="primary"
    disabled={!inputXtz || !inputTzbtc || !$store.userAddress}
    on:click={addLiquidity}
  >
    {#if addLiquidityStatus === TxStatus.Loading}
      <div class="spinner">
        <div />
        <div />
        <div />
        <div />
      </div>
      <span> Adding liquidity </span>
    {:else}
      Add liquidity
    {/if}
  </button>
</div>
