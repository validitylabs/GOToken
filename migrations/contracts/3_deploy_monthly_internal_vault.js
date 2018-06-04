const PGOMonthlyInternalVault = artifacts.require("./PGOMonthlyInternalVault.sol");

module.exports = function(deployer) {
    deployer.deploy(PGOMonthlyInternalVault).then(() => {
        return PGOMonthlyInternalVault.deployed().then(function(PGOMonthlyInternalVaultInstance){
            let PGOMonthlyInternalVaultAddress = PGOMonthlyInternalVaultInstance.address;
            console.log('[ PGOMonthlyInternalVaultInstance.address ]: ' + PGOMonthlyInternalVaultAddress);
        });
    });
};
