<script lang="ts">
  import { BeaconWallet } from "@taquito/beacon-wallet";
  import { NetworkType } from "@airgap/beacon-sdk";
  import { TezosToolkit, MichelsonMap} from "@taquito/taquito";
 

  const rpcUrl = "https://ghostnet.ecadinfra.com";
  const Tezos = new TezosToolkit(rpcUrl);
  const network = NetworkType.GHOSTNET;
  //const contractAddress = "KT1WQmXvGGNsLoXh5WaaKQamEB89YfkkcqEq";
  const contractAddress = "KT1W8FrDRM28BGy1VVKXfN9L61jW1dgAjHQi"
  //const contractAddress = "KT1PUNs8siPZqbSiqrUfxPoTYCxvCzFChfc8"
  //KT1JyBJ1UFACxYpFdtS3ZJmHPjWyaqDk45F3

  let wallet;
  let address;
  let balance;
  let statusMessage = "Mint an NFT";
  let buttonActive = false;

  const connectWallet = async () => {
    try {
      const newWallet = new BeaconWallet({
        name: "Simple NFT app tutorial",
        preferredNetwork: network,
      });
      await newWallet.requestPermissions({
        network: { type: network, rpcUrl },
      });
      address = await newWallet.getPKH();
      const balanceMutez = await Tezos.tz.getBalance(address);
      balance = balanceMutez.div(1000000).toFormat(2);
      buttonActive = true;
      wallet = newWallet;
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
    buttonActive = false;
    statusMessage = "Minting NFT...";

    
    const metadata = "7b226172746966616374557269223a22697066733a2f2f516d57476342434c516132387955505634355172444e47545a6e6a56784b6434416546565a4233666166486f5950222c2261747472696275746573223a5b5d2c2263726561746f7273223a5b22747a3157584b32795776416861466458456a73587548656e6667664472396d7157694277225d2c2264617465223a22323032332d30342d31335431373a32343a35312e3035353930335a222c22646563696d616c73223a302c226465736372697074696f6e223a22547a6f7563616e206973206120736d616c6c20636f6c6c656374696f6e206f662066756e6e7920746f7563616e73206f6e207468652054657a6f7320426c6f636b636861696e2e222c22646973706c6179557269223a22697066733a2f2f516d634d484a514c475444646a363873554d4b42687a3669464538326f36504144386e61755a6b4b4b43426d7173222c22666f726d617473223a5b7b2264696d656e73696f6e73223a7b22756e6974223a227078222c2276616c7565223a2235313278363430227d2c2266696c654e616d65223a2261727469666163742e706e67222c2266696c6553697a65223a3232383532332c226d696d6554797065223a22696d6167652f706e67222c22757269223a22697066733a2f2f516d57476342434c516132387955505634355172444e47545a6e6a56784b6434416546565a4233666166486f5950227d2c7b2264696d656e73696f6e73223a7b22756e6974223a227078222c2276616c7565223a2235313278363430227d2c2266696c654e616d65223a22646973706c61792e706e67222c2266696c6553697a65223a3232373534322c226d696d6554797065223a22696d6167652f706e67222c22757269223a22697066733a2f2f516d634d484a514c475444646a363873554d4b42687a3669464538326f36504144386e61755a6b4b4b43426d7173227d2c7b2264696d656e73696f6e73223a7b22756e6974223a227078222c2276616c7565223a2233323078343030227d2c2266696c654e616d65223a227468756d626e61696c2e706e67222c2266696c6553697a65223a3131323837382c226d696d6554797065223a22696d6167652f706e67222c22757269223a22697066733a2f2f516d593334616a6872757a66784a3979387358704b4365625a4a524638435a69443270487931534254375a4b5475227d5d2c22696d616765223a22697066733a2f2f516d634d484a514c475444646a363873554d4b42687a3669464538326f36504144386e61755a6b4b4b43426d7173222c226d696e746572223a224b543141713477576d56616e70516871345454666a5a584235416a467078313569514d4d222c226d696e74696e67546f6f6c223a2268747470733a2f2f6f626a6b742e636f6d2f6d696e745632222c226e616d65223a22547a6f7563616e20233438222c22726967687473223a224e6f204c6963656e7365202f20416c6c20526967687473205265736572766564222c22726f79616c74696573223a7b22646563696d616c73223a342c22736861726573223a7b22747a3157584b32795776416861466458456a73587548656e6667664472396d7157694277223a3530307d7d2c2273796d626f6c223a224f424a4b54434f4d222c2274616773223a5b22746f7563616e222c2262697264222c226d6f6465726e222c22617274225d2c227468756d626e61696c557269223a22697066733a2f2f516d593334616a6872757a66784a3979387358704b4365625a4a524638435a69443270487931534254375a4b5475227d"
    //{"artifactUri":"ipfs://QmWGcBCLQa28yUPV45QrDNGTZnjVxKd4AeFVZB3fafHoYP","attributes":[],"creators":["tz1WXK2yWvAhaFdXEjsXuHenfgfDr9mqWiBw"],"date":"2023-04-13T17:24:51.055903Z","decimals":0,"description":"Tzoucan is a small collection of funny toucans on the Tezos Blockchain.","displayUri":"ipfs://QmcMHJQLGTDdj68sUMKBhz6iFE82o6PAD8nauZkKKCBmqs","formats":[{"dimensions":{"unit":"px","value":"512x640"},"fileName":"artifact.png","fileSize":228523,"mimeType":"image/png","uri":"ipfs://QmWGcBCLQa28yUPV45QrDNGTZnjVxKd4AeFVZB3fafHoYP"},{"dimensions":{"unit":"px","value":"512x640"},"fileName":"display.png","fileSize":227542,"mimeType":"image/png","uri":"ipfs://QmcMHJQLGTDdj68sUMKBhz6iFE82o6PAD8nauZkKKCBmqs"},{"dimensions":{"unit":"px","value":"320x400"},"fileName":"thumbnail.png","fileSize":112878,"mimeType":"image/png","uri":"ipfs://QmY34ajhruzfxJ9y8sXpKCebZJRF8CZiD2pHy1SBT7ZKTu"}],"image":"ipfs://QmcMHJQLGTDdj68sUMKBhz6iFE82o6PAD8nauZkKKCBmqs","minter":"KT1Aq4wWmVanpQhq4TTfjZXB5AjFpx15iQMM","mintingTool":"https://objkt.com/mintV2","name":"Tzoucan #48","rights":"No License / All Rights Reserved","royalties":{"decimals":4,"shares":{"tz1WXK2yWvAhaFdXEjsXuHenfgfDr9mqWiBw":500}},"symbol":"OBJKTCOM","tags":["toucan","bird","modern","art"],"thumbnailUri":"ipfs://QmY34ajhruzfxJ9y8sXpKCebZJRF8CZiD2pHy1SBT7ZKTu"}
    const metadatamap = new MichelsonMap()
    metadatamap.set('',metadata)

    try {
      console.log("setting the wallet");
      Tezos.setWalletProvider(wallet);

      console.log("getting contract");
      const contract = await Tezos.wallet.at(contractAddress);
      console.log("minting");
      const op = await contract.methods.mint(metadatamap,address).send({
 
      });

      console.log(`Waiting for ${op.opHash} to be confirmed...`);
      const hash = await op.confirmation(3).then(() => op.opHash);
      console.log(`Operation injected: https://ghost.tzstats.com/${hash}`);
    } catch (error) {
      console.error("Error minting NFT:", error);
    } finally {
      statusMessage = "Mint another NFT";
      buttonActive = true;
    }
  };

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

<style>
</style>
