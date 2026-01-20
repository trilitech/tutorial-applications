import { beforeEach, describe, it } from "node:test";
import { network } from "hardhat";
import { parseEther } from "viem";

const { viem } = await network.connect();

let contract;

describe("Test creating and using markets", function () {

  // Initialize the contract before each test
  beforeEach(async () => {
    contract = await viem.deployContract("PredictxtzContract");
  });

  it("Should emit the MarketCreated event when a market is created", async function () {
    await viem.assertions.emit(
      contract.write.createMarket([
        "Will it rain tomorrow?",
        604800,
      ]),
      contract,
      "MarketCreated",
    );
  });

  it("Users should be able to bet on a market", async function () {
    const client = await viem.getPublicClient();
    const tx = await contract.write.createMarket([
      "Will it rain tomorrow?",
      604800,
    ]);
    await client.waitForTransactionReceipt({ hash: tx, confirmations: 1 });

    await viem.assertions.emit(
      contract.write.placeBet([
        1,
        true,
      ], {
        value: parseEther('1'),
      }),
      contract,
      "BetPlaced",
    );
  });
});

