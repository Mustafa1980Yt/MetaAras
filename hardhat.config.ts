import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ignition-ethers";
import "@openzeppelin/hardhat-upgrades";
import "dotenv/config";

// Placeholder veya eksik key varsa sıfır key kullan (hardhat compile hatasını engeller)
const _rawKey = process.env.PRIVATE_KEY || "";
const PRIVATE_KEY = /^0x[0-9a-fA-F]{64}$/.test(_rawKey) ? _rawKey : "0x" + "0".repeat(64);
const ALCHEMY_API_KEY  = process.env.ALCHEMY_API_KEY  || "";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";
const BSCSCAN_API_KEY  = process.env.BSCSCAN_API_KEY  || "";

// BSC Testnet RPC — custom URL opsiyonel; yoksa üç public endpoint arasında dönüşümlü kullanılır.
// Özel RPC için (daha stabil): QuickNode, Ankr, Chainstack BSC Testnet endpoint'i
const BSC_TESTNET_RPC_URL = process.env.BSC_TESTNET_RPC_URL ||
  "https://data-seed-prebsc-1-s1.binance.org:8545";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
      allowUnlimitedContractSize: false,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: [PRIVATE_KEY],
      chainId: 11155111,
    },
    bscTestnet: {
      url: BSC_TESTNET_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 97,
      timeout: 60000,
    },
    mainnet: {
      url: `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: [PRIVATE_KEY],
      chainId: 1,
    },
    bsc: {
      url: "https://bsc-dataseed1.binance.org",
      accounts: [PRIVATE_KEY],
      chainId: 56,
    },
  },
  etherscan: {
    apiKey: {
      mainnet: ETHERSCAN_API_KEY,
      sepolia: ETHERSCAN_API_KEY,
      bsc: BSCSCAN_API_KEY,
      bscTestnet: BSCSCAN_API_KEY,
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
    coinmarketcap: process.env.CMC_API_KEY,
    token: "ETH",
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6",
  },
  mocha: {
    timeout: 120000,
  },
};

export default config;
