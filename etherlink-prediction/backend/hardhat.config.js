require("@nomiclabs/hardhat-ethers")
require("dotenv").config();


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.9",
  networks: {
    etherlink: {
      url: "https://node.shadownet.etherlink.com",
      chainId: 127823,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};
