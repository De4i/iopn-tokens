const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy DEX first
  console.log("\nDeploying SimpleDEX...");
  const SimpleDEX = await ethers.getContractFactory("SimpleDEX");
  const dex = await SimpleDEX.deploy();
  await dex.deployed();
  console.log("SimpleDEX deployed to:", dex.address);

  // Token configurations
  const tokens = [
    { name: "USD Coin", symbol: "USDC" },
    { name: "USD Tether", symbol: "USDT" },
    { name: "NBLAD Token", symbol: "NBLAD" },
    { name: "Test1 Token", symbol: "TEST1" },
    { name: "Test2 Token", symbol: "TEST2" },
    { name: "DE4I Token", symbol: "DE4I" }
  ];

  const totalSupply = ethers.utils.parseUnits("1000000000", 18);
  const deployedTokens = {};

  // Deploy all tokens
  for (const token of tokens) {
    console.log(`\nDeploying ${token.symbol}...`);
    const IOPNToken = await ethers.getContractFactory("IOPNToken");
    const tokenContract = await IOPNToken.deploy(
      token.name,
      token.symbol,
      totalSupply
    );
    await tokenContract.deployed();
    
    deployedTokens[token.symbol] = {
      address: tokenContract.address,
      name: token.name,
      symbol: token.symbol
    };
    console.log(`${token.symbol} deployed to:`, tokenContract.address);
  }

  // Save deployment info
  const deploymentInfo = {
    network: "IOPN Testnet",
    dexAddress: dex.address,
    tokens: deployedTokens,
    deployer: deployer.address,
    timestamp: new Date().toISOString()
  };

  console.log("\n" + "=".repeat(50));
  console.log("DEPLOYMENT COMPLETED SUCCESSFULLY!");
  console.log("=".repeat(50));
  console.log("DEX Address:", dex.address);
  console.log("\nTokens Deployed:");
  Object.keys(deployedTokens).forEach(symbol => {
    console.log(`- ${symbol}: ${deployedTokens[symbol].address}`);
  });
  console.log("\nYou can now add liquidity and swap tokens!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
