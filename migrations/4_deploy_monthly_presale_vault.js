var PGOMonthlyPresaleVault = artifacts.require("./PGOMonthlyPresaleVault.sol");
module.exports = function(deployer, network, accounts) {
  deployer.deploy(PGOMonthlyPresaleVault).then(() => {
    return PGOMonthlyPresaleVault.deployed().then(function(PGOMonthlyPresaleVaultInstance){
      let PGOMonthlyPresaleVaultAddress = PGOMonthlyPresaleVaultInstance.address;
      console.log('[ PGOMonthlyPresaleVaultInstance.address ]: ' + PGOMonthlyPresaleVaultAddress);
    });
  });
};
