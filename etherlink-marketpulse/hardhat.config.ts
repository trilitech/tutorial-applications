import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import { configVariable, defineConfig } from "hardhat/config";

if (!configVariable("DEPLOYER_PRIVATE_KEY")) {
  console.error("Missing env var DEPLOYER_PRIVATE_KEY");
}

const deployerPrivateKey = configVariable("DEPLOYER_PRIVATE_KEY");

export default defineConfig({
  plugins: [hardhatToolboxViemPlugin],
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
      },
      production: {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
  networks: {
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
    },
    hardhatOp: {
      type: "edr-simulated",
      chainType: "op",
    },
    etherlinkMainnet: {
      type: "http",
      url: "https://node.mainnet.etherlink.com",
      accounts: [deployerPrivateKey],
    },
    etherlinkShadownet: {
      type: "http",
      url: "https://node.shadownet.etherlink.com",
      accounts: [deployerPrivateKey],
    },
  },
  chainDescriptors: {
    127823: {
      chainType: "generic",
      name: "etherlinkShadownet",
      blockExplorers: {
        etherscan: {
          name: "EtherlinkExplorer",
          apiUrl: "https://shadownet.explorer.etherlink.com/api",
          url: "https://shadownet.explorer.etherlink.com",
        },
        blockscout: {
          name: "EtherlinkExplorer",
          apiUrl: "https://shadownet.explorer.etherlink.com/api",
          url: "https://shadownet.explorer.etherlink.com",
        },
      },
    },
    42793: {
      name: "EtherlinkMainnet",
    }
  },
  verify: {
    blockscout: {
      enabled: true,
    },
    etherscan: {
      apiKey: "DUMMY",
      enabled: true,
    },
    sourcify: {
      enabled: false,
    }
  }
});
