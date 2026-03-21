import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("═══════════════════════════════════════════");
  console.log("  DEPLOYING WISERY TOKEN (WSR) v2");
  console.log("  + Pausable + Daily Limits + Withdrawal");
  console.log("═══════════════════════════════════════════");
  console.log("Deployer:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Balance:", ethers.formatEther(balance), "POL");

  if (balance === 0n) {
    console.error("No POL for gas! Get testnet POL from faucet first.");
    process.exit(1);
  }

  console.log("\nDeploying WiseryToken...");
  const WiseryToken = await ethers.getContractFactory("WiseryToken");
  const token = await WiseryToken.deploy();

  await token.waitForDeployment();
  const address = await token.getAddress();

  console.log("\n✅ WiseryToken deployed!");
  console.log("Contract Address:", address);
  console.log("Token: Wisery (WSR)");
  console.log("Total Supply: 1,000,000,000 WSR");
  console.log("Reward Pool: 300,000,000 WSR (30%)");

  // Verify reward pool
  const rewardPool = await token.rewardPool();
  console.log("Reward Pool (on-chain):", ethers.formatEther(rewardPool), "WSR");

  // Set deployer as distributor (same wallet for testnet)
  const DISTRIBUTOR_ADDRESS = process.env.DISTRIBUTOR_ADDRESS || deployer.address;
  console.log("\nSetting distributor:", DISTRIBUTOR_ADDRESS);
  const setTx = await token.setDistributor(DISTRIBUTOR_ADDRESS, true);
  await setTx.wait();
  console.log("✅ Distributor authorized!");

  // Verify distributor status
  const isDistributor = await token.rewardDistributors(DISTRIBUTOR_ADDRESS);
  console.log("Distributor verified:", isDistributor);

  // Check daily limit
  const dailyLimit = await token.distributorDailyLimit();
  console.log("Daily limit:", ethers.formatEther(dailyLimit), "WSR");

  console.log("\n═══════════════════════════════════════════");
  console.log("  DEPLOYMENT COMPLETE");
  console.log("═══════════════════════════════════════════");
  console.log("");
  console.log("Add to wisery .env:");
  console.log(`NEXT_PUBLIC_WSR_CONTRACT=${address}`);
  console.log(`WSR_DISTRIBUTOR_PRIVATE_KEY=<your distributor private key>`);
  console.log(`POLYGON_RPC_URL=https://rpc-amoy.polygon.technology`);
  console.log("");
  console.log("Verify on PolygonScan Amoy:");
  console.log(`https://amoy.polygonscan.com/address/${address}`);
  console.log("═══════════════════════════════════════════");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
