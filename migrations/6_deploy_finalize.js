const Got = artifacts.require("./GotToken.sol");
const GotCrowdSale = artifacts.require("./GotCrowdSale.sol");
const PGOMonthlyInternalVault = artifacts.require("./PGOMonthlyInternalVault.sol");
const PGOMonthlyPresaleVault = artifacts.require("./PGOMonthlyPresaleVault.sol");

module.exports = function(deployer, network, accounts) {
  const lockedLiquidityWallet = accounts[9];
  const unlockedLiquidityWallet = accounts[8];
  const wallet = accounts[7];
  const kycSigners = ['0x627306090abaB3A6e1400e9345bC60c78a8BEf57'.toLowerCase()];

  const internalWallet = accounts[6];
  const presaleWallet = accounts[5];
  const reservationWallet = accounts[4];

  //Initialize internal addresses
  const internalAddresses = [internalWallet];
  const internalBalances = [2.5e7 * 1e18];
  //Initialize presale addresses
  const presaleAddresses = [presaleWallet];
  const presaleBalances = [1.35e7 * 1e18];
  //Initialize reservation addresses
  const reservationAddresses = [reservationWallet];
  const reservationBalances = [0.8e7 * 1e18];

  let gotInstance;
  let gotCrowdSaleInstance;
  //load contract instances
  Got.at(Got.address).then(x => {
    gotInstance = x;
    GotCrowdSale.at(GotCrowdSale.address).then(crowdInst => {
      gotCrowdSaleInstance = crowdInst;
      gotInstance.transferOwnership(GotCrowdSale.address).then(() => {
        console.log('[ Token ownership transferred to] '+ GotCrowdSale.address);
        gotCrowdSaleInstance.mintPreAllocatedTokens().then(() => {
          console.log('[ UnlockedLiquidity minted, LockedLiquidity moved to PGOVAULT]');
          gotCrowdSaleInstance.initPGOMonthlyInternalVault(internalAddresses, internalBalances).then(() => {
            console.log('[ Initialized internal vault]');
            gotCrowdSaleInstance.initPGOMonthlyPresaleVault(presaleAddresses, presaleBalances).then(() => {
              console.log('[ Initialized presale vault]');
              gotCrowdSaleInstance.mintReservation(reservationAddresses, reservationBalances).then(() => {
                console.log('[ Minted presale second step]');
              });
            });
          });
        });
      });
    });
  });
};
