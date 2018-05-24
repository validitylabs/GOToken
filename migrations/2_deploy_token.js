var Got = artifacts.require("./GotToken.sol");
module.exports = function(deployer, network, accounts) {
  deployer.deploy(Got).then(() => {
    return Got.deployed().then(function(gotTokenInstance){
      let gotTokenAddress = gotTokenInstance.address;
      console.log('[ gotTokenInstance.address ]: ' + gotTokenAddress);
    });
  });

};
