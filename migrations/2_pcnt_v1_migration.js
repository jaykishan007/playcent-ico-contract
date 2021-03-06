const { deployProxy } = require("@openzeppelin/truffle-upgrades");

const tokenContract = artifacts.require("PlaycentTokenV1");

module.exports = async function (deployer, network, accounts) {
  await deployProxy(tokenContract, [accounts[1], accounts[2], "12345"], {
    deployer,
    initializer: "initialize",
  });
};
