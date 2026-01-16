// scripts/deploy.js
import { network } from "hardhat";

async function main() {

  const { viem, networkName } = await network.connect();

  console.log(`Deploying contract to ${networkName}...`);

  const deployedContract = await viem.deployContract("PredictxtzContract");

  console.log("Contract deployed to:", deployedContract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });