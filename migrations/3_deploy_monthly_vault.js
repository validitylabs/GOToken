var PGOMonthlyVault = artifacts.require("./PGOMonthlyVault.sol");
module.exports = function(deployer, network, accounts) {
  deployer.deploy(PGOMonthlyVault).then(() => {
    return PGOMonthlyVault.deployed().then(function(PGOMonthlyVaultInstance){
      let PGOMonthlyVaultAddress = PGOMonthlyVaultInstance.address;
      console.log('[ PGOMonthlyVaultInstance.address ]: ' + PGOMonthlyVaultAddress);
    });
  });
};
