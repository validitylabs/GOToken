var got = artifacts.require("./GotToken.sol");

module.exports = function(deployer) {
  deployer.deploy(got);
};
