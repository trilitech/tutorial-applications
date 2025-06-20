import { HermesClient, PriceUpdate } from "@pythnetwork/hermes-client";
import { createWalletClient, http, getContract, createPublicClient, defineChain, Account, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { abi } from "../../contracts/out/TutorialContract.sol/TutorialContract.json";

// Pyth ID for exchange rate of XTZ to USD
const XTZ_USD_ID = process.env["XTZ_USD_ID"] as string;

// Contract I deployed
const CONTRACT_ADDRESS = process.env["DEPLOYMENT_ADDRESS"] as any; // sandbox

// My account based on private key
const myAccount: Account = privateKeyToAccount(`0x${process.env["PRIVATE_KEY"] as any}`);

// Viem custom chain definition for Etherlink sandbox
const etherlinkSandbox = defineChain({
  id: 128123,
  name: 'EtherlinkSandbox',
  nativeCurrency: {
    decimals: 18,
    name: 'tez',
    symbol: 'xtz',
  },
  rpcUrls: {
    default: {
      http: [process.env["RPC_URL"] as string],
    },
  },
});

// Viem objects that allow programs to call the chain
const walletClient = createWalletClient({
  account: myAccount,
  chain: etherlinkSandbox, // Or use etherlinkTestnet from "viem/chains"
  transport: http(),
});
const contract = getContract({
  address: CONTRACT_ADDRESS,
  abi: abi,
  client: walletClient,
});
const publicClient = createPublicClient({
  chain: etherlinkSandbox, // Or use etherlinkTestnet from "viem/chains"
  transport: http()
});

// Delay in seconds between polling Hermes for price data
const DELAY = 3;
// Minimum change in exchange rate that counts as a price fluctuation
const CHANGE_THRESHOLD = 0.0001;

// Utility function to call read-only smart contract function
const getBalance = async () => parseInt(await contract.read.getBalance([myAccount.address]) as string);

// Pause for a given number of seconds
const delaySeconds = (seconds: number) => new Promise(res => setTimeout(res, seconds*1000));

// Utility function to call Hermes and return the current price of one XTZ in USD
const getPrice = async (connection: HermesClient) => {
  const priceIds = [XTZ_USD_ID];
  const priceFeedUpdateData = await connection.getLatestPriceUpdates(priceIds) as PriceUpdate;
  const parsedPrice = priceFeedUpdateData.parsed![0].price;
  const actualPrice = parseInt(parsedPrice.price) * (10 ** parsedPrice.expo)
  return actualPrice;
}

// Get the baseline price and poll until it changes past the threshold
const alertOnPriceFluctuations = async (_baselinePrice: number, connection: HermesClient): Promise<number> => {
  const baselinePrice = _baselinePrice;
  await delaySeconds(DELAY);
  let updatedPrice = await getPrice(connection);
  while (Math.abs(baselinePrice - updatedPrice) < CHANGE_THRESHOLD) {
    await delaySeconds(DELAY);
    updatedPrice = await getPrice(connection);
  }
  return updatedPrice;
}

const run = async () => {

  // Check balance first
  let balance = await getBalance();
  console.log("Starting balance:", balance);
  // If not enough tokens, initialize balance with 5 tokens in the contract
  if (balance < 5) {
    console.log("Initializing account with 5 tez");
    const initHash = await contract.write.initAccount([myAccount.address]);
    await publicClient.waitForTransactionReceipt({ hash: initHash });
    balance = await getBalance()
    console.log("Initialized account. New balance is", balance);
  }

  const connection = new HermesClient("https://hermes.pyth.network");

  let i = 0;
  while (balance > 0 && i < 5) {
    console.log("\n");
    console.log("Iteration", i++);
    let baselinePrice = await getPrice(connection);
    console.log("Baseline price:", baselinePrice);

    const updatedPrice = await alertOnPriceFluctuations(baselinePrice, connection);
    console.log("Price changed:", updatedPrice);
    const priceFeedUpdateData = await connection.getLatestPriceUpdates([XTZ_USD_ID]);
    if (baselinePrice > updatedPrice) {
      // Buy
      console.log("Price went down; time to buy");
      const oneUSD = Math.ceil((1/updatedPrice) * 100) / 100; // Round up to two decimals
      console.log("Sending", oneUSD, "XTZ (about one USD)");
      const buyHash = await contract.write.buy(
        [[`0x${priceFeedUpdateData.binary.data[0]}`]] as any,
        { value: parseEther(oneUSD.toString()), gas: 30000000n },
      );
      await publicClient.waitForTransactionReceipt({ hash: buyHash });
      console.log("Bought one token");
    } else if (baselinePrice < updatedPrice) {
      console.log("Price went up; time to sell");
      // Sell
      const sellHash = await contract.write.sell(
        [[`0x${priceFeedUpdateData.binary.data[0]}`]] as any,
        { gas: 30000000n }
      );
      await publicClient.waitForTransactionReceipt({ hash: sellHash });
      console.log("Sold one token");
    }
    balance = await getBalance();
  }

  // Cash out
  console.log("Cashing out");
  // Call the cashout function to retrieve the XTZ you've sent to the contract (for tutorial purposes)
  await contract.write.cashout();
}

run();
