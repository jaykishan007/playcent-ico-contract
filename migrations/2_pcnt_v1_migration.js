const { deployProxy } = require("@openzeppelin/truffle-upgrades");

const tokenContract = artifacts.require("PlaycentTokenV1");

module.exports = async function (deployer, network, accounts) {
  await deployProxy(
    tokenContract,
    [accounts[1], accounts[2], "283c89f312d21cbc0cd3d3bbfd2514b6aee37264"],
    {
      deployer,
      initializer: "initialize",
    }
  );
};
