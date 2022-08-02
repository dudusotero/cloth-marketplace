import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.9",
  networks: {
    // TODO: Make these values come from "env/schema.mjs"
    rinkeby: {
      url: "https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
      accounts: ["0000000000000000000000000000000000000000000000000000000000000000"],
    },
  },
  paths: {
    root: "./src/server/",
  },
};

export default config;
