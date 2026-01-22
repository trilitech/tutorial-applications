import dotenv from 'dotenv';
dotenv.config();

import hardhatViem from "@nomicfoundation/hardhat-viem";
import hardhatViemAssertions from "@nomicfoundation/hardhat-viem-assertions";
import hardhatNodeTestRunner from "@nomicfoundation/hardhat-node-test-runner";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  plugins: [
    hardhatViem,
    hardhatViemAssertions,
    hardhatNodeTestRunner,
  ],
  solidity: "0.8.24",
  networks: {
    etherlinkShadownet: {
      type: 'http',
      url: "https://node.shadownet.etherlink.com",
      chainId: 127823,
      accounts: [process.env.PRIVATE_KEY],
    },
    etherlinkSandbox: {
      type: 'http',
      url: "http://localhost:8545",
      chainId: 127823,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};
