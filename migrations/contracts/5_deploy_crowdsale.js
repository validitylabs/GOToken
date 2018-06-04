const Got = artifacts.require("./GotToken.sol");
const GotCrowdSale = artifacts.require("./GotCrowdSale.sol");
const PGOMonthlyInternalVault = artifacts.require("./PGOMonthlyInternalVault.sol");
const PGOMonthlyPresaleVault = artifacts.require("./PGOMonthlyPresaleVault.sol");

module.exports = function(deployer, network, accounts) {
    const lockedLiquidityWallet = accounts[9];
    const unlockedLiquidityWallet = accounts[8];
    const wallet = accounts[7];
    const kycSigners = ['0x627306090abaB3A6e1400e9345bC60c78a8BEf57'.toLowerCase()];

    deployer.deploy(
        GotCrowdSale,
        Got.address,
        wallet,
        lockedLiquidityWallet,
        unlockedLiquidityWallet,
        PGOMonthlyInternalVault.address,
        PGOMonthlyPresaleVault.address,
        kycSigners)
        .then(function(){
            return GotCrowdSale.deployed().then(function(gotCrowdSaleInstance){
                let gotCrowdSaleAddress = gotCrowdSaleInstance.address;
                console.log('[ gotCrowdSaleAddress.address ]: ' + gotCrowdSaleAddress);
            });
        });
};
