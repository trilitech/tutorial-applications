<script lang="ts">
  import { BeaconWallet } from "@taquito/beacon-wallet";
  import { NetworkType } from "@airgap/beacon-types";
  import { TezosToolkit, MichelsonMap } from "@taquito/taquito";
  import { stringToBytes } from "@taquito/utils";

  const rpcUrl = "https://rpc.ghostnet.teztnets.com";
  const Tezos = new TezosToolkit(rpcUrl);

  let wallet;
  let address;
  let balance;
  let statusMessage = "Connect your wallet.";
  let buttonActive = false;

  const connectWallet = async () => {
    try {
      const newWallet = new BeaconWallet({
        name: "NFT app tutorial",
        network: {
          type: NetworkType.GHOSTNET,
        },
      });
      await newWallet.requestPermissions();
      address = await newWallet.getPKH();
      const balanceMutez = await Tezos.tz.getBalance(address);
      balance = balanceMutez.div(1000000).toFormat(2);
      buttonActive = true;
      statusMessage = "Wallet connected. Ready to mint NFTs.";
      wallet = newWallet;
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  const disconnectWallet = () => {
    wallet.client.clearActiveAccount();
    statusMessage = "Connect your wallet.";
    wallet = undefined;
    buttonActive = false;
  };
</script>

<main>
  <h1>Create NFTs</h1>

  <div class="card">
    {#if wallet}
      <p>The address of the connected wallet is {address}.</p>
      <p>Its balance in tez is {balance}.</p>
      <button on:click={disconnectWallet}>Disconnect wallet</button>
    {:else}
      <button on:click={connectWallet}>Connect wallet</button>
    {/if}
    <p>{statusMessage}</p>
  </div>
</main>

<style>
</style>
