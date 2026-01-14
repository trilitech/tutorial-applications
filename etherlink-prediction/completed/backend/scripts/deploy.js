// scripts/deploy.js
const hre = require("hardhat");

async function main() {
  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contract with account:", deployer.address);

  // Compile & get the contract factory
  const MyContract = await ethers.getContractFactory("PredictxtzContract");

  // Deploy the contract
  const DeployedContract = await MyContract.deploy();
  await DeployedContract.deployed();

  console.log("Contract deployed to:", DeployedContract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
