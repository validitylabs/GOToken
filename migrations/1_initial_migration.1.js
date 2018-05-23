var Migrations = artifacts.require("./Migrations.sol");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
};

// var Got = artifacts.require("./GotToken.sol");
// var GotCrowdSale = artifacts.require("./GotCrowdSale.sol");
// module.exports = function(deployer, network, accounts) {
//   // const foundersWallet = accounts[6];
//   // const advisorsWallet = accounts[7];
//   // const ubiatarPlayWallet = accounts[8];
//   const wallet = accounts[9];
//   const kycSigners = ['0x627306090abaB3A6e1400e9345bC60c78a8BEf57'.toLowerCase()];

//   deployer.deploy(Got).then(() => {
//     return Got.deployed().then((gotTokenInstance) => {
//       let gotTokenAddress = gotTokenInstance.address;
//       console.log('[ gotTokenInstance.address ]: ' + gotTokenAddress);
//       deployer.deploy(GotCrowdSale,gotTokenAddress,wallet,kycSigners).then(() => {
//         return GotCrowdSale.deployed().then((gotCrowdSaleInstance) => {
//           let gotCrowdSaleAddress = gotCrowdSaleInstance.address;
//           console.log('[ gotCrowdSaleAddress.address ]: ' + gotCrowdSaleAddress);
    
//         });
//       });
//     });
//   });
// };
