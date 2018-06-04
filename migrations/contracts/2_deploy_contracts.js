const BigNumber = web3.BigNumber;

const Got = artifacts.require("./GotToken.sol");
const GotCrowdSale = artifacts.require("./GotCrowdSale.sol");
const PGOMonthlyInternalVault = artifacts.require("./PGOMonthlyInternalVault.sol");
const PGOMonthlyPresaleVault = artifacts.require("./PGOMonthlyPresaleVault.sol");

module.exports = function(deployer, network, accounts) {
    const lockedLiquidityWallet = accounts[9];
    const unlockedLiquidityWallet = accounts[8];
    const wallet = accounts[7];
    const internalWallet = accounts[6];
    const presaleWallet = accounts[5];
    const reservationWallet = accounts[4];

    const kycSigners = ['0x627306090abaB3A6e1400e9345bC60c78a8BEf57'.toLowerCase()];

    //The lists of addresses and expected token amounts will be loaded here at ICO deploy time
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
    let gotTokenAddress;
    
    let gotCrowdSaleInstance;
    let gotCrowdSaleAddress;
    
    let pGOMonthlyInternalVaultInstance;
    let pGOMonthlyInternalVaultAddress;

    let pGOMonthlyPresaleVaultInstance;
    let pGOMonthlyPresaleVaultAddress;

    deployer.deploy(Got).then(() => {
        return Got.deployed().then(function(tokenInstance){
            gotInstance = tokenInstance;
            gotTokenAddress = tokenInstance.address;
            console.log('[ gotTokenInstance.address ]: ' + gotTokenAddress);
            return deployer.deploy(PGOMonthlyInternalVault).then(() => {
                return PGOMonthlyInternalVault.deployed().then(function(PGOMonthlyInternalVaultInstance){
                    pGOMonthlyInternalVaultInstance = PGOMonthlyInternalVaultInstance;
                    pGOMonthlyInternalVaultAddress = PGOMonthlyInternalVaultInstance.address;
                    console.log('[ PGOMonthlyInternalVaultInstance.address ]: ' + pGOMonthlyInternalVaultAddress);
                    return deployer.deploy(PGOMonthlyPresaleVault).then(() => {
                        return PGOMonthlyPresaleVault.deployed().then(function(PGOMonthlyPresaleVaultInstance){
                            pGOMonthlyPresaleVaultInstance = PGOMonthlyPresaleVaultInstance;
                            pGOMonthlyPresaleVaultAddress = PGOMonthlyPresaleVaultInstance.address;
                            console.log('[ PGOMonthlyPresaleVaultInstance.address ]: ' + pGOMonthlyPresaleVaultAddress);
                            return deployer.deploy(
                                GotCrowdSale,
                                gotTokenAddress,
                                wallet,
                                lockedLiquidityWallet,
                                unlockedLiquidityWallet,
                                pGOMonthlyInternalVaultAddress,
                                pGOMonthlyPresaleVaultAddress,
                                kycSigners)
                                .then(function(){
                                    return GotCrowdSale.deployed().then(function(GotCrowdSaleInstance){
                                        gotCrowdSaleInstance = GotCrowdSaleInstance;
                                        gotCrowdSaleAddress = GotCrowdSaleInstance.address;
                                        console.log('[ gotCrowdSaleAddress.address ]: ' + gotCrowdSaleAddress);
                                        gotInstance.transferOwnership(gotCrowdSaleAddress);
                                        gotCrowdSaleInstance.mintPreAllocatedTokens();
                                        gotCrowdSaleInstance.initPGOMonthlyInternalVault(internalAddresses, internalBalances);
                                        gotCrowdSaleInstance.initPGOMonthlyPresaleVault(presaleAddresses, presaleBalances);
                                        gotCrowdSaleInstance.mintReservation(reservationAddresses, reservationBalances);
                                    });
                                });
                        });
                    });
                });
            });
        });
    });
};
