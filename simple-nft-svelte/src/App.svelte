<script lang="ts">
  import { BeaconWallet } from "@taquito/beacon-wallet";
  import { NetworkType } from "@airgap/beacon-types";
  import { TezosToolkit, MichelsonMap} from "@taquito/taquito";
  import { stringToBytes } from '@taquito/utils';

  const rpcUrl = "https://rpc.ghostnet.teztnets.com";
  const Tezos = new TezosToolkit(rpcUrl);

  const nftContractAddress = "KT1TuveAEsF6FPiLJ4Y55RuaMypBuXNWHitk"

  let wallet;
  let address;
  let balance;
  let statusMessage = "Mint an NFT";
  let buttonActive = false;

  const connectWallet = async () => {
    try {
      const newWallet = new BeaconWallet({
        name: "Simple NFT app tutorial",
        network: {
          type: NetworkType.GHOSTNET,
        },
      });
      await newWallet.requestPermissions();
      address = await newWallet.getPKH();
      const balanceMutez = await Tezos.tz.getBalance(address);
      balance = balanceMutez.div(1000000).toFormat(2);
      buttonActive = true;
      wallet = newWallet;
      console.log("Connected to wallet", address);
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  const disconnectWallet = () => {
    wallet.client.clearActiveAccount();
    wallet = undefined;
    buttonActive = false;
  };

  const requestNFT = async () => {
    if (!buttonActive) {
      return;
    }
    if (!wallet) {
      console.error("No wallet connected");
      return;
    } else {
      console.log("Wallet is connected");
    }
    buttonActive = false;
    statusMessage = "Minting NFT...";

    try {
      console.log("setting the wallet");
      Tezos.setWalletProvider(wallet);

      // const metadata = new MichelsonMap();
      // metadata.set("name", stringToBytes("My Token")); // replace with your metadata

      // const mintItem = {
      //   to_: address,
      //   metadata: metadata,
      // };

      console.log("getting contract");
      // const nftContract = await Tezos.contract.at(nftContractAddress);

      // For debugging, try calling a counter
      const contract = await Tezos.contract.at("KT1R2LTg3mQoLvHtUjo2xSi7RMBUJ1sJkDiD");
      // console.log("minting");
      // const op = await contract.methodsObject.mint([mintItem]).send();
      const op = await contract.methodsObject.increment(2).send();

      console.log(`Waiting for ${op.hash} to be confirmed...`);
      const hash = await op.confirmation(2).then(() => op.hash);
      console.log(`Operation injected: https://ghost.tzstats.com/${hash}`);
    } catch (error) {
      console.error("Error minting NFT:", error);
    } finally {
      statusMessage = "Mint another NFT";
      buttonActive = true;
    }
  }
</script>

<main>
  <h1>Simple NFT dApp</h1>

  <div class="card">
    {#if wallet}
      <p>The address of the connected wallet is {address}.</p>
      <p>Its balance in tez is {balance}.</p>
      <button on:click={disconnectWallet}> Disconnect wallet </button>
      <button on:click={requestNFT}>{statusMessage}</button>
    {:else}
      <button on:click={connectWallet}> Connect wallet </button>
    {/if}
  </div>
</main>

<style lang="scss">
</style>
