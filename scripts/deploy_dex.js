const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);
  console.log("OPN balance:", hre.ethers.formatEther(await deployer.getBalance()));

  // 1. Deploy WOPN
  const WOPN = await hre.ethers.getContractFactory("WOPN");
  const wopn = await WOPN.deploy();
  await wopn.waitForDeployment();
  console.log("WOPN →", await wopn.getAddress());

  // 2. Deploy Factory
  const Factory = await hre.ethers.getContractFactory("UniswapV2Factory");
  const factory = await Factory.deploy(deployer.address);
  await factory.waitForDeployment();
  console.log("Factory →", await factory.getAddress());

  // 3. Deploy Router
  const Router = await hre.ethers.getContractFactory("UniswapV2Router02");
  const router = await Router.deploy(await factory.getAddress(), await wopn.getAddress());
  await router.waitForDeployment();
  console.log("Router →", await router.getAddress());

  console.log("\nDEX SIAP PAKAI!");
  console.log("Factory :", await factory.getAddress());
  console.log("Router  :", await router.getAddress());
  console.log("WOPN    :", await wopn.getAddress());
  console.log("\nCek di: https://testnet.iopn.tech/address/" + await router.getAddress());
}

main().catch((error) => {
  console.error("ERROR:", error.message);
  process.exitCode = 1;
});
