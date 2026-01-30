<script lang="ts">
  import { BeaconWallet } from "@taquito/beacon-wallet";
  import { NetworkType } from "@airgap/beacon-types";
  import { TezosToolkit, MichelsonMap } from "@taquito/taquito";
  import { stringToBytes } from "@taquito/utils";

  const rpcUrl = "https://rpc.shadownet.teztnets.com";
  const Tezos = new TezosToolkit(rpcUrl);

  const nftContractAddress = "KT1NbqYinUijW68V3fxboo4EzQPFgRcdfaYQ";
  const defaultImage = "https://gateway.pinata.cloud/ipfs/QmRCp4Qc8afPrEqtM1YdRvNagWCsFGXHgGjbBYrmNsBkcE";

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
          type: NetworkType.SHADOWNET,
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

  const createNFT = async () => {
    if (!buttonActive) {
      return;
    }
    buttonActive = false;
    statusMessage = "Minting NFT; please wait...";

    // Create token metadata
    const metadata = new MichelsonMap();
    metadata.set("name", stringToBytes("My Token"));
    metadata.set("symbol", stringToBytes("Tok"));
    metadata.set("decimals", stringToBytes("0"));
    metadata.set("artifactUri", stringToBytes(defaultImage));
    metadata.set("displayUri", stringToBytes(defaultImage));
    metadata.set("thumbnailUri", stringToBytes(defaultImage));

    const mintItem = {
      to_: address,
      metadata: metadata,
    };

    const mintParameter = [mintItem];

    try {
      Tezos.setWalletProvider(wallet);

      console.log("getting contract");
      const nftContract = await Tezos.wallet.at(nftContractAddress);

      console.log("minting");
      const op = await nftContract.methodsObject.mint(mintParameter).send();

      console.log(`Waiting for ${op.opHash} to be confirmed...`);
      const hash = await op.confirmation(2).then(() => op.opHash);
      console.log(`Operation injected: https://shadownet.tzkt.io/${hash}`);
    } catch (error) {
      console.error("Error minting NFT:", error);
    } finally {
      statusMessage = "Ready to mint another NFT.";
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
      <button on:click={disconnectWallet}>Disconnect wallet</button>
      <button on:click={createNFT}>Create NFT</button>
    {:else}
      <button on:click={connectWallet}>Connect wallet</button>
    {/if}
    <p>{statusMessage}</p>
  </div>
</main>

<style>
</style>
