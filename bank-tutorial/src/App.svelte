<script>
  import { BeaconWallet } from "@taquito/beacon-wallet";
  import { NetworkType } from "@airgap/beacon-sdk";
  import { TezosToolkit } from "@taquito/taquito";

  const rpcUrl = "https://ghostnet.ecadinfra.com";
  const Tezos = new TezosToolkit(rpcUrl);
  const network = NetworkType.GHOSTNET;
  const contractAddress = "KT1R4i4qEaxF7v3zg1M8nTeyrqk8JFmdGLuu";

  let wallet;
  let address;
  let balance;
  let bankBalance;

  let depositAmount = 1;
  let depositButtonActive = false;
  let depositButtonLabel = "Deposit";

  let withdrawButtonActive = true;
  let withdrawButtonLabel = "Withdraw";

  const connectWallet = async () => {
    const newWallet = new BeaconWallet({
      name: "Simple dApp tutorial",
      preferredNetwork: network,
    });
    await newWallet.requestPermissions({
      network: { type: network, rpcUrl },
    });
    address = await newWallet.getPKH();
    await getWalletBalance(address);
    await getBankBalance(address);
    wallet = newWallet;
    depositButtonActive = true;
  };

  const disconnectWallet = () => {
    wallet.client.clearActiveAccount();
    wallet = undefined;
  };

  const getWalletBalance = async (walletAddress) => {
    const balanceMutez = await Tezos.tz.getBalance(walletAddress);
    balance = balanceMutez.div(1000000).toFormat(2);
  };

  const getBankBalance = async (walletAddress) => {
    const contract = await Tezos.wallet.at(contractAddress);
    const storage = await contract.storage();
    const balanceMutez = await storage.get(walletAddress);
    bankBalance = isNaN(balanceMutez) ? 0 : balanceMutez / 1000000;
  };

  const deposit = async () => {
    depositButtonActive = false;
    depositButtonLabel = "Depositing...";
    Tezos.setWalletProvider(wallet);

    const contract = await Tezos.wallet.at(contractAddress);
    const transaction = await contract.methods
      .deposit("")
      .toTransferParams({
        amount: depositAmount,
      });
    const estimate = await Tezos.estimate.transfer(transaction);

    await contract.methods
      .deposit("")
      .send({
        gasLimit: estimate.gasLimit,
        fee: estimate.burnFeeMutez,
        storageLimit: estimate.storageLimit,
        amount: depositAmount,
      })
      .then((op) => {
        console.log(`Waiting for ${op.opHash} to be confirmed...`);
        return op.confirmation(2).then(() => op.opHash);
      })
      .then((hash) =>
        console.log(`Operation injected: https://ghost.tzstats.com/${hash}`)
      )
      .catch((error) =>
        console.log(`Error: ${JSON.stringify(error, null, 2)}`)
      );

    await getWalletBalance(address);
    await getBankBalance(address);
    depositButtonActive = true;
    depositButtonLabel = "Deposit";
  };

  const withdraw = async () => {
    withdrawButtonActive = false;
    withdrawButtonLabel = "Withdrawing...";

    Tezos.setWalletProvider(wallet);
    const contract = await Tezos.wallet.at(contractAddress);
    await contract.methods
      .withdraw("")
      .send()
      .then((op) => {
        console.log(`Waiting for ${op.opHash} to be confirmed...`);
        return op.confirmation(2).then(() => op.opHash);
      })
      .then((hash) =>
        console.log(`Operation injected: https://ghost.tzstats.com/${hash}`)
      )
      .catch((error) =>
        console.log(`Error: ${JSON.stringify(error, null, 2)}`)
      );

    await getWalletBalance(address);
    await getBankBalance(address);
    withdrawButtonActive = true;
    withdrawButtonLabel = "Withdraw";
  };
</script>

<main>
  <h1>Tezos bank dApp</h1>

  <div class="card">
    {#if wallet}
      <p>The address of the connected wallet is {address}.</p>
      <p>Its balance in tez is {balance}.</p>
      <p>Its balance in the bank is {bankBalance}.</p>
      <p>
        To get tez, go to <a
          href="https://faucet.ghostnet.teztnets.xyz/"
          target="_blank"
        >
          https://faucet.ghostnet.teztnets.xyz/
        </a>.
      </p>
      <p>
        Deposit tez:
        <input type="number" bind:value={depositAmount} min="1" max="100" />
        <input type="range" bind:value={depositAmount} min="1" max="100" />
        <button on:click={deposit} disabled={!depositButtonActive}>
          {depositButtonLabel}
        </button>
      </p>
      <p>
        Withdraw tez:
        <button on:click={withdraw} disabled={!withdrawButtonActive}>
          {withdrawButtonLabel}
        </button>
      </p>
      <p>
        <button on:click={disconnectWallet}> Disconnect wallet </button>
      </p>
    {:else}
      <button on:click={connectWallet}> Connect wallet </button>
    {/if}
  </div>
</main>

<style>
</style>
