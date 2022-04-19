import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";

dotenv.config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {

  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  // solidity: "0.8.4",

  solidity: {
    compilers: [
      {
        version: "0.8.4",
      }
    ],
    overrides: {
      "contracts/test/OracleLibraryTest.sol": {  
        version: "0.7.6",
        settings: { }
      },
      "contracts/helpers/PoolHelper.sol": {  
        version: "0.7.6",
        settings: { }
      },
      "@uniswap/v3-periphery/contracts/libraries/OracleLibrary.sol":{
        version: "0.7.6",
        settings: { }
      },
      "@uniswap/v3-core/contracts/libraries/FullMath.sol":{
        version: "0.7.6",
        settings: { }
      },
      "@uniswap/v3-core/contracts/libraries/TickMath.sol":{
        version: "0.7.6",
        settings: { }
      },
      "@uniswap/v3-core/contracts/libraries/Oracle.sol":{
        version: "0.7.6",
        settings: { }
      },
    }
  },

  networks: {
    hardhat: {
      forking: {
        url: `https://speedy-nodes-nyc.moralis.io/${process.env.MORALIS_KEY}/polygon/mainnet`,
      },
      gasPrice: 45000000000,
      // "accounts": {
      //   "mnemonic": process.env.MNEMONIC_LOCAL
      // }
    },
    matic: {
      url: `https://speedy-nodes-nyc.moralis.io/${process.env.MORALIS_KEY}/polygon/mainnet`,
      chainId: 137,
      gas: 65000000,
      gasPrice: 45000000000, //current price on polygon is 30000000000
      accounts: [process.env.POLY_ACCOUNT || ""],
      gasMultiplier: 10,
      blockGasLimit: 65000000,
    },
  },

  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;
