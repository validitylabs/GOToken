var Got = artifacts.require("./GotToken.sol");
module.exports = function(deployer, network, accounts) {
  deployer.deploy(Got).then(() => {
    return Got.deployed().then(function(gotTokenInstance){
      let gotTokenAddress = gotTokenInstance.address;
      console.log('[ gotTokenInstance.address ]: ' + gotTokenAddress);
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
