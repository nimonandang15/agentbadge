const { ethers } = require("hardhat");

// Binance Agent ID registry on BNB Chain (SPACE ID Agent ID, ERC-721, non-transferable).
const AGENT_ID_REGISTRY = "0x60B9262456dE011F7d15a54CdD8c48bAaa8B022F";

async function main() {
  const Badge = await ethers.getContractFactory("AgentBadge");
  const badge = await Badge.deploy(AGENT_ID_REGISTRY);
  await badge.waitForDeployment();
  const address = await badge.getAddress();
  console.log("AgentBadge deployed to:", address);
  console.log("Agent ID registry:    ", AGENT_ID_REGISTRY);
  console.log("Owner (deployer):     ", (await ethers.getSigners())[0].address);
  console.log("Verify on BscScan:    npx hardhat verify --network bsc", address, AGENT_ID_REGISTRY);
}

main().catch((e) => { console.error(e); process.exit(1); });
