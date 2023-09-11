<script lang="ts">
  import { onMount } from "svelte";
  import { BeaconWallet } from "@taquito/beacon-wallet";
  import store, { type TezosAccountAddress } from "../store";
  import { rpcUrl, network } from "../config";
  import { shortenHash, fetchBalances } from "../utils";

  let connectedNetwork = "";
  let walletIcon = "";
  let walletName = "";

  const getWalletInfo = async (wallet: BeaconWallet) => {
    // finds account info
    const walletInfo = await wallet.client.getActiveAccount();
    if (walletInfo?.network?.type) {
      connectedNetwork = walletInfo.network.type;
    } else {
      connectedNetwork = "";
    }
    // finds wallet icon
    const info = await wallet.client.getPeers();
    walletName = (info[0] as any).name;
    if (Array.isArray(info) && (info[0] as any).icon) {
      walletIcon = (info[0] as any).icon;
    }
  };

  const connectWallet = async () => {
    if (!$store.wallet) {
      const wallet = new BeaconWallet({
        name: "Tezos dev portal dapp tutorial",
        preferredNetwork: network
      });
      store.updateWallet(wallet);
    }

    await $store.wallet.requestPermissions({
      network: { type: network, rpcUrl }
    });
    const userAddress = (await $store.wallet.getPKH()) as TezosAccountAddress;
    store.updateUserAddress(userAddress);
    $store.Tezos.setWalletProvider($store.wallet);
    // finds account info
    await getWalletInfo($store.wallet);
    // fetches user's XTZ, tzBTC and SIRS balances
    const res = await fetchBalances($store.Tezos, userAddress);
    if (res) {
      store.updateUserBalance("XTZ", res.xtzBalance);
      store.updateUserBalance("tzBTC", res.tzbtcBalance);
      store.updateUserBalance("SIRS", res.sirsBalance);
    } else {
      store.updateUserBalance("XTZ", null);
      store.updateUserBalance("tzBTC", null);
      store.updateUserBalance("SIRS", null);
    }
  };

  const disconnectWallet = async () => {
    $store.wallet.client.clearActiveAccount();
    store.updateWallet(undefined);
    store.updateUserAddress(undefined);
    connectedNetwork = "";
    walletIcon = "";
  };

  onMount(async () => {
    const wallet = new BeaconWallet({
      name: "Tezos dev portal dapp tutorial",
      preferredNetwork: network
    });
    store.updateWallet(wallet);
    const activeAccount = await wallet.client.getActiveAccount();
    if (activeAccount) {
      const userAddress = (await wallet.getPKH()) as TezosAccountAddress;
      store.updateUserAddress(userAddress);
      $store.Tezos.setWalletProvider(wallet);
      await getWalletInfo(wallet);
      // fetches user's XTZ, tzBTC and SIRS balances
      const res = await fetchBalances($store.Tezos, userAddress);
      if (res) {
        store.updateUserBalance("XTZ", res.xtzBalance);
        store.updateUserBalance("tzBTC", res.tzbtcBalance);
        store.updateUserBalance("SIRS", res.sirsBalance);
      } else {
        store.updateUserBalance("XTZ", null);
        store.updateUserBalance("tzBTC", null);
        store.updateUserBalance("SIRS", null);
      }
    }
  });
</script>

<style lang="scss">
  .wallet {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;

    .wallet__info {
      padding-bottom: 20px;
      text-align: center;

      p {
        margin: 0px;
        padding: 5px;
        display: flex;
        justify-content: center;
        align-items: center;

        img.wallet-icon {
          width: 32px;
          height: 32px;
        }
      }
    }
  }
</style>

<div class="wallet">
  {#if $store.wallet && $store.userAddress}
    <div class="wallet__info">
      <p>
        {#if walletIcon}
          <img src={walletIcon} alt="wallet-icon" class="wallet-icon" />
        {/if}
        <span>{shortenHash($store.userAddress)}</span>
      </p>
      {#if !walletIcon && walletName}
        <p style="font-size:0.7rem">({walletName})</p>
      {/if}
      <p>
        {#if connectedNetwork}
          On {connectedNetwork}
        {:else}
          No network data
        {/if}
      </p>
    </div>
    <button class="wallet-button" on:click={disconnectWallet}>
      Disconnect
    </button>
  {:else}
    <button class="wallet-button" on:click={connectWallet}>
      Connect wallet
    </button>
  {/if}
</div>
