import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ignition-ethers";
import "@openzeppelin/hardhat-upgrades";
import "dotenv/config";

// Deployer private key — compile time'da fallback to zero key so `hardhat compile` works
// without any .env. The zero key is rejected by real networks at tx broadcast time.
const _rawKey   = process.env.PRIVATE_KEY || "";
const VALID_KEY = /^0x[0-9a-fA-F]{64}$/.test(_rawKey);
const PRIVATE_KEY = VALID_KEY ? _rawKey : "0x" + "0".repeat(64);

// Guard against accidental mainnet deploys with a missing or placeholder key.
// The process.env.npm_lifecycle_script check avoids triggering during `hardhat compile`.
const _isMainnetTask =
  (process.env.HARDHAT_NETWORK === "mainnet" || process.env.HARDHAT_NETWORK === "bsc") &&
  process.env.npm_lifecycle_script?.includes("deploy");
if (_isMainnetTask && !VALID_KEY) {
  throw new Error(
    "PRIVATE_KEY missing or invalid — refusing to proceed with mainnet deploy.\n" +
    "Set a valid 0x-prefixed 64-hex-char key in your .env file."
  );
}

const ALCHEMY_API_KEY   = process.env.ALCHEMY_API_KEY   || "";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";
const BSCSCAN_API_KEY   = process.env.BSCSCAN_API_KEY   || "";

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
    // Etherscan V2: single key covers mainnet + sepolia
    apiKey: ETHERSCAN_API_KEY,
    customChains: [
      {
        network: "bscTestnet",
        chainId: 97,
        urls: {
          apiURL:     `https://api-testnet.bscscan.com/api`,
          browserURL: "https://testnet.bscscan.com",
        },
      },
      {
        network: "bsc",
        chainId: 56,
        urls: {
          apiURL:     `https://api.bscscan.com/api`,
          browserURL: "https://bscscan.com",
        },
      },
    ],
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
