var Got = artifacts.require("./GotToken.sol");
var GotCrowdSale = artifacts.require("./GotCrowdSale.sol");
module.exports = function(deployer, network, accounts) {
  // const foundersWallet = accounts[6];
  // const advisorsWallet = accounts[7];
  // const ubiatarPlayWallet = accounts[8];
  const wallet = accounts[9];
  const pgoTokenWallet = accounts[8];
  const kycSigners = ['0x627306090abaB3A6e1400e9345bC60c78a8BEf57'.toLowerCase()];


  deployer.deploy(GotCrowdSale,Got.address,wallet,pgoTokenWallet,kycSigners).then(function(){
    return GotCrowdSale.deployed().then(function(gotCrowdSaleInstance){
      let gotCrowdSaleAddress = gotCrowdSaleInstance.address;
      console.log('[ gotCrowdSaleAddress.address ]: ' + gotCrowdSaleAddress);

    });
  });


    // deployer.deploy(PresaleTokenVault)
    //     .then(() => {
    //         return PresaleTokenVault.deployed().then((presaleTokenVaultInstance) => {
    //             presaleTokenVaultAddress = presaleTokenVaultInstance.address;
    //             console.log('[ presaleTokenVaultInstance.address ]: ' + presaleTokenVaultAddress);
    //             // function Reservation(address _wallet, address[] _kycSigners)
    //             return deployer.deploy(Reservation, wallet, kycSigners).then(() => {
    //                 return Reservation.deployed().then((reservationInstance) => {
    //                     reservationAddress = reservationInstance.address;
    //                     console.log('[ reservationInstance.address ]: ' + reservationAddress);
    //                     // function UacToken()
    //                     return deployer.deploy(UacToken).then(() => {
    //                         return UacToken.deployed().then((uacTokenInstance) => {
    //                             uacTokenAddress = uacTokenInstance.address;
    //                             console.log('[ uacTokenInstance.address ]: ' + uacTokenAddress);
    //                             // function UacCrowdsale(address _token, address _reservation, address _presaleTokenVault, address _foundersWallet, address _advisorsWallet, address _ubiatarPlayWallet, address _wallet, address[] _kycSigners)
    //                             return deployer.deploy(UacCrowdsale, uacTokenAddress, reservationAddress, presaleTokenVaultAddress, foundersWallet, advisorsWallet, ubiatarPlayWallet, wallet, kycSigners).then(() => {
    //                                 return UacCrowdsale.deployed().then(async (uacCrowdsaleInstance) => {
    //                                     uacCrowdsaleAddress = uacCrowdsaleInstance.address;
    //                                     console.log('[ uacCrowdsaleInstance.address ]: ' + uacCrowdsaleAddress);
    //                                     await reservationInstance.setCrowdsale(uacCrowdsaleAddress);
    //                                     await uacTokenInstance.transferOwnership(uacCrowdsaleAddress);
    //                                     await uacCrowdsaleInstance.mintPreAllocatedTokens();
    //                                 });
    //                             });
    //                         });
    //                     });
    //                 });
    //             });
    //         });
    //     });


};
