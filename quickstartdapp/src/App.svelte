<script>
  import { BeaconWallet } from "@taquito/beacon-wallet";
  import { NetworkType } from "@airgap/beacon-types";
  import { TezosToolkit } from "@taquito/taquito";
  import { onMount } from "svelte";

  let wallet;
  let address;
  let number;
  let currentValue;

  const contractAddress = "KT18ikZ2PYNs4AaMw2jdD911Y2KqT1nsTQE8";
  const rpcUrl = "https://ghostnet.ecadinfra.com";
  const Tezos = new TezosToolkit(rpcUrl);

  const connectWallet = async () => {
    const newWallet = new BeaconWallet({
      name: "dApp quickstart",
      network: {
        type: NetworkType.GHOSTNET,
      },
    });
    await newWallet.requestPermissions();
    address = await newWallet.getPKH();
    wallet = newWallet;
    await updateCounterValue();
  };

  const disconnectWallet = () => {
    wallet.client.clearActiveAccount();
    wallet = undefined;
  };
   const increment = async () => {
     Tezos.setWalletProvider(wallet);
     const contract = await Tezos.wallet.at(contractAddress);
     const operation = await contract.methods.increment(number).send();
     const operationHash = await operation.confirmation(2);
     console.log(operationHash);
    await updateCounterValue();
   }

   const decrement = async () => {
     Tezos.setWalletProvider(wallet);
     const contract = await Tezos.wallet.at(contractAddress);
     const operation = await contract.methods.decrement(number).send();
     const operationHash = await operation.confirmation(2);
     console.log(operationHash);
    await updateCounterValue();
   }

  const updateCounterValue = async () => {
    const contract = await Tezos.wallet.at(contractAddress);
    currentValue = await contract.storage();
  }
  onMount(updateCounterValue);
</script>

<main>
  <h1>Tezos dApp quickstart</h1>

  <div class="card">
    <p>
      Current counter value: {currentValue}
    </p>
    {#if wallet}
      <p>The address of the connected wallet is {address}.</p>
      <p>
        <button on:click={disconnectWallet}> Disconnect wallet </button>
      </p>
      <p>
        <input type="number" bind:value={number} />
        <button on:click={increment}> Increment counter </button>
        <button on:click={decrement}> Decrement counter </button>
      </p>
    {:else}
      <button on:click={connectWallet}> Connect wallet </button>
    {/if}
  </div>
</main>

<style>
</style>
