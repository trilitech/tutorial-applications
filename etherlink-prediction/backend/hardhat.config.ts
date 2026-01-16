import dotenv from 'dotenv';
dotenv.config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks: {
    etherlink: {
      type: 'http',
      url: "https://node.shadownet.etherlink.com",
      chainId: 127823,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};
