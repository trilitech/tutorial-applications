# Tutorial application: Create a prediction market on Etherlink

A simple **Polymarket-inspired prediction market smart contract** built on [**Etherlink**](https://etherlink.com) — Tezos’ Layer 2 EVM-compatible chain.

This project demonstrates how to create a decentralized prediction market where users can bet on binary outcomes (Yes/No) of real-world events, using a hybrid **Pari-mutuel / AMM model** for pricing and payouts.

---

## 🔮 What Are Prediction Markets?

Prediction markets let users **take a position on future events** with binary outcomes. For example:

> *Will Manchester United win the English Premier League in 2026?*
> Possible answers: **Yes / No**

Users buy **Yes/No tokens**, whose prices adjust dynamically as bets are placed. At resolution:

- Losing side’s funds are redistributed to the winning side
- Winnings are proportional to the number of tokens held

This implementation follows a **hybrid model**:
- Prices adjust instantly when bets are placed (AMM-like)
- Payouts are redistributed like a **Pari-mutuel pool**

---

## 📂 Repository Structure

- `contracts/Contract.sol` → Core prediction market smart contract
- `scripts/deploy.js` → Hardhat deployment script
- `hardhat.config.js` → Hardhat + Etherlink network configuration
- `starter` branch → Minimal starter project
- `main` branch → Fully implemented contract

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/onedebos/etherlink-prediction-market-contract.git
cd etherlink-prediction-market-contract
```
### 2. Install dependencies

```bash
npm install
```

---

## 🛠 Usage

### Option A: Starter Project (recommended for learners)

If you're on the **starter branch**:

1. Write your contract in:

   ```
   contracts/Contract.sol
   ```

2. Update your deployment script in:

   ```
   scripts/deploy.js
   ```

3. Create a `.env` file in the project root:

   ```
   PRIVATE_KEY=your_testnet_wallet_private_key
   ```

   ⚠️ Make sure this wallet has **testnet XTZ** on Etherlink.

4. Compile the contract:

   ```bash
   npx hardhat compile
   ```

5. Deploy to Etherlink testnet:

   ```bash
   npx hardhat run scripts/deploy.js --network etherlink
   ```

---

### Option B: Fully Implemented Contract

Switch to the **main branch** for the complete code:

```bash
git checkout main
```

Then follow the same steps as above to **compile and deploy**.

---

## 🌐 Deploying to Etherlink

The repo includes a working **Hardhat config** for Etherlink:

```js
// hardhat.config.js
require("@nomiclabs/hardhat-ethers");
require("dotenv").config();

module.exports = {
  solidity: "0.8.9",
  networks: {
    etherlink: {
      url: "https://node.ghostnet.etherlink.com",
      chainId: 128123,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};
```

Deployment script example:

```js
// scripts/deploy.js
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contract with account:", deployer.address);

  const Market = await hre.ethers.getContractFactory("PredictxtzContract");
  const contract = await Market.deploy();

  await contract.deployed();
  console.log("Contract deployed to:", contract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

---

## 🔗 Interacting With Your Contract

1. After deployment, open [Etherlink Testnet Explorer](https://testnet-explorer.etherlink.com/).
2. Paste your contract address.
3. Upload the **ABI** generated under:

   ```
   artifacts/contracts/Contract.sol/PredictxtzContract.json
   ```
4. You can now call functions like `createMarket`, `placeBet`, `resolveMarket`, and `claimWinnings` directly.

---

## ✨ Features

* **createMarket** → Create a new prediction market
* **placeBet** → Bet on Yes/No outcome
* **calculateShares** → Calculate how many tokens are issued per bet
* **resolveMarket** → Resolve an event outcome (admin-only)
* **claimWinnings** → Claim winnings after resolution

---

## 📖 Tutorial

This repo is based on the tutorial:
**[Building a Polymarket Prediction Market Clone on Etherlink](#)**
(Walks through the math, models, and Solidity implementation step by step.)

---

## ⚠️ Disclaimer

This project is for **educational purposes only**.
Not audited. **Do not use in production** without a security review.
