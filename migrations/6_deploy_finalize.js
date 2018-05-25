const BigNumber = web3.BigNumber;

const Got = artifacts.require("./GotToken.sol");
const GotCrowdSale = artifacts.require("./GotCrowdSale.sol");
const PGOMonthlyInternalVault = artifacts.require("./PGOMonthlyInternalVault.sol");
const PGOMonthlyPresaleVault = artifacts.require("./PGOMonthlyPresaleVault.sol");

module.exports = function(deployer, network, accounts) {
  const internalWallet = accounts[6];
  const presaleWallet = accounts[5];
  const reservationWallet = accounts[4];
  //Initialize internal addresses
  const internalAddresses = [internalWallet];
  const internalBalances = [new BigNumber(2.5e7 * 1e18)];
  //Initialize presale addresses
  const presaleAddresses = [presaleWallet];
  const presaleBalances = [new BigNumber(1.35e7 * 1e18)];
  //Initialize reservation addresses
  const reservationAddresses = [reservationWallet];
  const reservationBalances = [new BigNumber(0.8e7 * 1e18)];

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
