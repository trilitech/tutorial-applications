import "@nomicfoundation/hardhat-toolbox-viem";
import "@nomicfoundation/hardhat-verify";
import type { HardhatUserConfig } from "hardhat/config";
import { vars } from "hardhat/config";

if (!vars.has("DEPLOYER_PRIVATE_KEY")) {
  console.error("Missing env var DEPLOYER_PRIVATE_KEY");
}

const deployerPrivateKey = vars.get("DEPLOYER_PRIVATE_KEY");

const config: HardhatUserConfig = {
  solidity: "0.8.24",

  networks: {
    etherlinkMainnet: {
      url: "https://node.mainnet.etherlink.com",
      accounts: [deployerPrivateKey],
    },
    etherlinkTestnet: {
      url: "https://node.ghostnet.etherlink.com",
      accounts: [deployerPrivateKey],
    },
  },
  etherscan: {
    apiKey: {
      etherlinkMainnet: "YOU_CAN_COPY_ME",
      etherlinkTestnet: "YOU_CAN_COPY_ME",
    },
    customChains: [
      {
        network: "etherlinkMainnet",
        chainId: 42793,
        urls: {
          apiURL: "https://explorer.etherlink.com/api",
          browserURL: "https://explorer.etherlink.com",
        },
      },
      {
        network: "etherlinkTestnet",
        chainId: 128123,
        urls: {
          apiURL: "https://testnet.explorer.etherlink.com/api",
          browserURL: "https://testnet.explorer.etherlink.com",
        },
      },
    ],
  },
  sourcify: {
    // Disabled by default
    // Doesn't need an API key
    enabled: false,
  },
};

export default config;
