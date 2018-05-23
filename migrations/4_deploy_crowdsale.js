var Got = artifacts.require("./GotToken.sol");
var GotCrowdSale = artifacts.require("./GotCrowdSale.sol");
var PGOMonthlyVault = artifacts.require("./PGOMonthlyVault.sol");
module.exports = function(deployer, network, accounts) {

  const wallet = accounts[9];
  const pgoTokenWallet = accounts[8];
  const kycSigners = ['0x627306090abaB3A6e1400e9345bC60c78a8BEf57'.toLowerCase()];


  deployer.deploy(GotCrowdSale,Got.address,wallet,pgoTokenWallet,PGOMonthlyVault.address,kycSigners).then(function(){
    return GotCrowdSale.deployed().then(function(gotCrowdSaleInstance){
      let gotCrowdSaleAddress = gotCrowdSaleInstance.address;
      console.log('[ gotCrowdSaleAddress.address ]: ' + gotCrowdSaleAddress);

    });
  });


};
