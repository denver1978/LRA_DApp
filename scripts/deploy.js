const hre = require("hardhat");

async function main() {

  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying the contracts with the account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance));

  const LandRegistry = await hre.ethers.getContractFactory("BaguioLandRegistry");

  const landRegistry = await LandRegistry.deploy();

  await landRegistry.waitForDeployment();

  const address = await landRegistry.getAddress();

  console.log("BaguioLandRegistry deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});