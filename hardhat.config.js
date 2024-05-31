require("@nomiclabs/hardhat-waffle");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.4",
  paths: {
    artifacts: "./src/artifacts",
  },
  networks: {
    matic: {
      url: "https://polygon-amoy.g.alchemy.com/v2/8axWEb6ISoZH6U3sGeLllRuNlMe5ehaV",
      accounts: [
        "47bf7aa16a5131f75785eecbd7d4ef3b751fa30fc6b58fd833c42ea661a4c159",
      ],
    },
  },
};
