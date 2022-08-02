import { ethers } from "hardhat";

async function main() {
  const ClothMarketplace = await ethers.getContractFactory("ClothMarketplace");
  const clothMarketplace = await ClothMarketplace.deploy();

  await clothMarketplace.deployed();

  console.log("ClothMarketplace deployed to:", clothMarketplace.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
