import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000001";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    amoy: {
      url: "https://rpc-amoy.polygon.technology",
      accounts: [DEPLOYER_PRIVATE_KEY],
      chainId: 80002,
    },
    polygon: {
      url: "https://polygon-rpc.com",
      accounts: [DEPLOYER_PRIVATE_KEY],
      chainId: 137,
    },
  },
};

export default config;
