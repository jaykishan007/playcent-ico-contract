const { deployProxy } = require('@openzeppelin/truffle-upgrades');

const tokenContract = artifacts.require('PlaycentToken');

module.exports = async function (deployer) {
  await deployProxy(tokenContract,{ deployer, initializer: 'initialize' });
  
};