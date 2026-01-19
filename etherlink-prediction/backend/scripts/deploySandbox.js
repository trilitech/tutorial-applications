// scripts/deploy.js
import { network } from "hardhat";

async function main() {

  const { viem, networkName } = await network.connect();
  const client = await viem.getPublicClient();
  const [walletClient] = await viem.getWalletClients();

  console.log(`Deploying contract to ${networkName}...`);

  const contract = await viem.deployContract("PredictxtzContract");
  console.log("Contract deployed to:", contract.address);

  console.log("Creating a market");
  const tx = await contract.write.createMarket([
    "Will it rain tomorrow?",
    604800,
  ]);

  console.log("Waiting for the tx to confirm");
  const marketResult = await client.waitForTransactionReceipt({ hash: tx, confirmations: 1 });
  console.log("Confirmed");
  // console.log(JSON.stringify(marketResult, (_, v) => typeof v === 'bigint' ? v.toString() : v));

  const result = await contract.read.getMarket([BigInt(0)]);
  console.log("Market:", JSON.stringify(result, (_, v) => typeof v === 'bigint' ? v.toString() : v));

  console.log(Object.keys(contract));

  const questionCheck = await contract.read.getMostRecentMarketQuestion();
  console.log(questionCheck);

  // console.log(Object.keys(client));
  // console.log(client.account.address);
  // console.log(await client.getBalance(client.account.address));
  console.log(walletClient.account.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
