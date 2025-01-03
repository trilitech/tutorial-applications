<script lang="ts">
  import { BeaconWallet } from "@taquito/beacon-wallet";
  import { NetworkType } from "@airgap/beacon-types";
  import { TezosToolkit, MichelsonMap } from "@taquito/taquito";
  import { bytes2Char, stringToBytes } from "@taquito/utils";

  const rpcUrl = "https://rpc.ghostnet.teztnets.com";
  const Tezos = new TezosToolkit(rpcUrl);

  const nftContractAddress = "KT1Lr8m7HgfY5UF6nXDDcXDxDgEmKyMeds1b";
  const defaultImage =
    "https://gateway.pinata.cloud/ipfs/QmRCp4Qc8afPrEqtM1YdRvNagWCsFGXHgGjbBYrmNsBkcE";

  let wallet;
  let address;
  let balance;
  let statusMessage = "Connect your wallet.";
  let buttonActive = false;

  let userNfts;
  let nftStorage;

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
      // await getUserNfts();
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  const disconnectWallet = () => {
    wallet.client.clearActiveAccount();
    statusMessage = "Connect your wallet.";
    wallet = undefined;
    buttonActive = false;
    nftStorage = null;
    userNfts = null;
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
    metadata.set("description", stringToBytes("A token I minted"));
    metadata.set("thumbnailUri", stringToBytes(defaultImage));

    const mintItem = {
      to_: address,
      metadata: metadata,
    };

    const mintParameter = [mintItem];

    // try {
    //   Tezos.setWalletProvider(wallet);

    //   console.log("getting contract");
    //   const nftContract = await Tezos.wallet.at(nftContractAddress);

    //   console.log("minting");
    //   const op = await nftContract.methodsObject.mint(mintParameter).send();

    //   console.log(`Waiting for ${op.opHash} to be confirmed...`);
    //   const hash = await op.confirmation(2).then(() => op.opHash);
    //   console.log(`Operation injected: https://ghostnet.tzkt.io/${hash}`);
    //   await getUserNfts();
    // } catch (error) {
    //   console.error("Error minting NFT:", error);
    // } finally {
    //   statusMessage = "Ready to mint another NFT.";
    //   buttonActive = true;
    // }
  };

  const getUserNfts = async () => {
    if (!address) {
      return;
    }
    // finds user's NFTs
    const contract = await Tezos.wallet.at(nftContractAddress);
    nftStorage = await contract.storage();
    const ledger = nftStorage.ledger;

    console.log("Getting user NFTs");
    console.log(ledger);

    await ledger.get({0: '0', 1: 'tz1QCVQinE8iVj1H2fckqx6oiM85CNJSK9Sx'})
      .then((data) => console.log(data))
      .catch((err) => console.error('Error: result:', err));

    // const result = await nftStorage.ledger.get({0: 0, 1: 'tz1QCVQinE8iVj1H2fckqx6oiM85CNJSK9Sx'})
    //   .catch((err) => console.error('Error: result:', err));
    // if (!result) {
    //   console.log("no results")
    // }
    // const getTokenIds = await nftStorage.ledger.get(address);
    // if (getTokenIds) {
    //   userNfts = await Promise.all([
    //     ...getTokenIds.map(async id => {
    //       const tokenId = id.toNumber();
    //       const metadata = await nftStorage.token_metadata.get(tokenId);
    //       const tokenInfoBytes = metadata.token_info.get("");
    //       const tokenInfo = bytes2Char(tokenInfoBytes);
    //       return {
    //         tokenId,
    //         ipfsHash:
    //           tokenInfo.slice(0, 7) === "ipfs://" ? tokenInfo.slice(7) : null
    //       };
    //     })
    //   ]);
    // }
  };
</script>

<main>
  <h1>Create NFTs</h1>

  <div class="card">
    {#if wallet}
      <p>The address of the connected wallet is {address}.</p>
      <p>Its balance in tez is {balance}.</p>
      <button on:click={disconnectWallet}>Disconnect wallet</button>
      <button on:click={createNFT}>Create NFT</button>
      <button on:click={getUserNfts}>Get NFTs</button>
      <div class="user-nfts">
        Your NFTs:
        {#if nftStorage}
          [ {#each userNfts.reverse() as nft, index}
            <a
              href={`https://cloudflare-ipfs.com/ipfs/${nft.ipfsHash}`}
              target="_blank"
              rel="noopener noreferrer nofollow"
            >
              {nft.tokenId}
            </a>
            {#if index < userNfts.length - 1}
              <span>,&nbsp;</span>
            {/if}
          {/each} ]
        {/if}
      </div>
    {:else}
      <button on:click={connectWallet}>Connect wallet</button>
    {/if}
    <p>{statusMessage}</p>
  </div>
</main>

<style>
</style>
