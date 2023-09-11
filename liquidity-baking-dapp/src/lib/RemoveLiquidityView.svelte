<script lang="ts">
  import store from "../store";
  import UserInput from "./UserInput.svelte";
  import { removeLiquidityXtzTzbtcOut } from "../lbUtils";
  import { TxStatus } from "../types";
  import { calcDeadline, fetchBalances } from "../utils";
  import { dexAddress, XTZ, tzBTC } from "../config";

  let inputSirs = "";
  let xtzOutput = 0;
  let tzbtcOutput = 0;
  let resetInput = false;
  let removeLiquidityStatus = TxStatus.NoTransaction;

  const saveInput = ev => {
    const { token, val } = ev.detail;
    console.log(val);
    if (token === "SIRS" && val > 0 && isFinite(val)) {
      inputSirs = val.toString();
      const outputRes = removeLiquidityXtzTzbtcOut({
        liquidityBurned: val,
        totalLiquidity: $store.dexInfo.lqtTotal.toNumber(),
        xtzPool: $store.dexInfo.xtzPool.toNumber(),
        tokenPool: $store.dexInfo.tokenPool.toNumber()
      });
      if (outputRes) {
        const { xtzOut, tzbtcOut } = outputRes;
        xtzOutput = xtzOut
          .decimalPlaces(0, 1)
          .dividedBy(10 ** 6)
          .decimalPlaces(6)
          .toNumber();
        tzbtcOutput = tzbtcOut
          .decimalPlaces(0, 1)
          .dividedBy(10 ** 8)
          .decimalPlaces(8)
          .toNumber();
      } else {
        xtzOutput = 0;
        tzbtcOutput = 0;
      }
    } else {
      inputSirs = "";
      xtzOutput = 0;
      tzbtcOutput = 0;
    }
  };

  const removeLiquidity = async () => {
    try {
      if (inputSirs) {
        removeLiquidityStatus = TxStatus.Loading;
        store.updateToast(
          true,
          "Removing liquidity, waiting for confirmation..."
        );

        const lbContract = await $store.Tezos.wallet.at(dexAddress);
        const op = await lbContract.methodsObject
          .removeLiquidity({
            to: $store.userAddress,
            lqtBurned: inputSirs,
            minXtzWithdrawn: Math.floor(xtzOutput * 10 ** XTZ.decimals), //Math.floor(3.859644 * 10 ** XTZ.decimals),
            minTokensWithdrawn: Math.floor(tzbtcOutput * 10 ** tzBTC.decimals), //Math.floor(0.00023012 * 10 ** tzBTC.decimals),
            deadline: calcDeadline()
          })
          .send();
        await op.confirmation();

        removeLiquidityStatus = TxStatus.Success;
        inputSirs = "";
        xtzOutput = 0;
        tzbtcOutput = 0;

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

        store.updateToast(true, "Liquidity successfully removed!");
      } else {
        throw "Missing value for SIRS";
      }
    } catch (error) {
      console.error(error);
      removeLiquidityStatus = TxStatus.Error;
      store.updateToast(true, "An error has occurred");
    } finally {
      setTimeout(() => {
        removeLiquidityStatus = TxStatus.NoTransaction;
        store.showToast(false);
      }, 3000);
    }
  };
</script>

<style lang="scss">
  @import "../styles/settings.scss";

  .remove-liquidity-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 20px;
    border: solid 3px darken($powder-blue, 10);
    border-radius: $std-border-radius;
    padding: calc(#{$padding} * 3);

    .remove-liquidity-inputs {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 20px;
    }

    .remove-liquidity-outputs {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 20px;

      img {
        height: 28px;
        width: 28px;
      }

      & > div {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 10px;
      }
    }
  }
</style>

<div class="container remove-liquidity-container">
  <h1>Remove liquidity</h1>
  <div class="remove-liquidity-inputs">
    <UserInput
      token="SIRS"
      inputVal={inputSirs}
      logoPos="left"
      on:new-input={saveInput}
      disabled={false}
      reset={resetInput}
    />
  </div>
  <img src="images/arrow-down.svg" alt="arrow-down" />
  <div class="remove-liquidity-outputs">
    <div>
      <img src="images/XTZ.png" alt="XTZ" />
      <span>{xtzOutput} XTZ</span>
    </div>
    <span>/</span>
    <div>
      <img src="images/tzBTC.png" alt="tzBTC" />
      <span>{tzbtcOutput} tzBTC</span>
    </div>
  </div>
  <button class="primary" disabled={!inputSirs} on:click={removeLiquidity}>
    Remove liquidity
  </button>
</div>
