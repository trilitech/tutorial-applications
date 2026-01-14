
# Etherlink Prediction Market Frontend

A **Next.js + thirdweb SDK dApp frontend** for interacting with the [Prediction Market Smart Contract](https://github.com/onedebos/etherlink-prediction-market-contract) on [**Etherlink**](https://etherlink.com), Tezos’ Layer 2 EVM-compatible chain.  

This app provides a simple UI for:  
- ✅ Placing bets on **Yes/No outcomes** in a market
- ✅ Viewing live market prices and probabilities  
- ✅ Claiming winnings after a market is resolved  

## ⚡ Tech Stack

- [Next.js](https://nextjs.org/) (React framework with SSR)  
- [TypeScript](https://www.typescriptlang.org/) (type safety)  
- [TailwindCSS](https://tailwindcss.com/) (styling)  
- [thirdweb SDK](https://portal.thirdweb.com/) (wallet connection & contract interaction)  
- Deployed on **Etherlink Shadownet** (testnet)  

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/onedebos/prediction-markets-on-etherlink-demo
cd etherlink-prediction-market-frontend
````

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```
NEXT_PUBLIC_CONTRACT_ADDRESS=your_deployed_contract_address
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_thirdweb_client_id

```

* `NEXT_PUBLIC_CONTRACT_ADDRESS` → The address of your deployed prediction market contract
* `NEXT_PUBLIC_THIRDWEB_CLIENT_ID` → Your [thirdweb client ID](https://portal.thirdweb.com/dashboard)

### 4. Run the development server

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## 📖 Features

* **Market List** → Browse all active prediction markets
* **Market Details** → See market description, expiration, and current odds
* **Place Bet** → Users bet on Yes/No using thirdweb’s `useContractWrite`
* **Resolve Market** → Admin resolves an event outcome
* **Claim Winnings** → Winning participants withdraw rewards

---

## 🌐 Network Setup

Connect your wallet to **Etherlink Shadownet (testnet):**

* **Network Name**: Etherlink Shadownet
* **RPC URL**: `https://node.shadownet.etherlink.com`
* **Chain ID**: `127823`
* **Currency Symbol**: `XTZ`

Get free testnet XTZ from the [Etherlink Faucet](https://shadownet.faucet.etherlink.com/).

---

## 🛠 Development Scripts

* `npm run dev` → Start Next.js dev server

---

## 🔗 Related Repositories

* [Prediction Market Smart Contract](https://github.com/onedebos/etherlink-prediction-market-contract)

---

## ⚠️ Disclaimer

This frontend is for **educational/demo purposes only**.
It has **not been audited** and should not be used with real funds in production.