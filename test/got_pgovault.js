import {expectThrow, waitNDays,increaseTimeTo, getEvents, BigNumber} from './helpers/tools';
import {logger as log} from "./helpers/logger";

const {ecsign} = require('ethereumjs-util');
const abi = require('ethereumjs-abi');
const BN = require('bn.js');

const GotCrowdSale = artifacts.require('./GotCrowdSale.sol');
const GotToken = artifacts.require('./GotToken.sol');
const PGOVault = artifacts.require('./PGOVault.sol');

const should = require('chai') // eslint-disable-line
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber')(BigNumber))
    .should();

// Values for testing buy methods with the required MAX_AMOUNT by Eidoo's KYCBase contract
/*const SIGNER_PK = Buffer.from('c87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3', 'hex');
const MAX_AMOUNT = '1000000000000000000';

const getKycData = (userAddr, userid, icoAddr, pk) => {
    // sha256("Eidoo icoengine authorization", icoAddress, buyerAddress, buyerId, maxAmount);
    const hash = abi.soliditySHA256(
        ['string', 'address', 'address', 'uint64', 'uint'],
        ['Eidoo icoengine authorization', icoAddr, userAddr, new BN(userid), new BN(MAX_AMOUNT)]
    );
    const sig = ecsign(hash, pk);
    return {
        id: userid,
        max: MAX_AMOUNT,
        v: sig.v,
        r: '0x' + sig.r.toString('hex'),
        s: '0x' + sig.s.toString('hex')
    };
};*/

const USD_PER_TOKEN = 1;
const USD_PER_ETHER = 700;
const TOKEN_PER_ETHER =  USD_PER_ETHER / USD_PER_TOKEN;                     

const VAULT_START_TIME = 1530003600;        // 26 June 2018 09:00:00 GMT

/*TOKEN CAPS*/
const PGO_VAULT_CAP = new BigNumber(3.5e7 * 1e18);
const PGO_VAULT_STEP1 = new BigNumber(0.875e7 * 1e18);
const PGO_VAULT_STEP2 = new BigNumber(1.75e7 * 1e18);
const PGO_VAULT_STEP3 = new BigNumber(2.625e7 * 1e18);
const PGO_VAULT_STEP4 = new BigNumber(3.5e7 * 1e18);

contract('GotPGOVault',(accounts) => {
  const lockedLiquidityWallet = accounts[9];

  // Provide gotTokenInstance for every test case
  let gotTokenInstance;
  let gotCrowdSaleInstance;
  let PGOVaultInstance;
  let gotTokenAddress;
  let PGOVaultAddress;

  beforeEach(async () => {
    gotCrowdSaleInstance = await GotCrowdSale.deployed();
    gotTokenAddress = await gotCrowdSaleInstance.token();
    gotTokenInstance = await GotToken.at(gotTokenAddress);
    PGOVaultAddress = await gotCrowdSaleInstance.pgoVault();
    PGOVaultInstance = await PGOVault.at(PGOVaultAddress);
  });

    it('should have unreleased amount equal to PGO_VAULT_CAP', async () => {
        const balance = await PGOVaultInstance.unreleasedAmount();
        balance.should.be.bignumber.equal(PGO_VAULT_CAP);
    });

    it('should initially have token amount equal to crowdsale locked cap', async () => {
        const lockedCap = await gotCrowdSaleInstance.PGO_LOCKED_LIQUIDITY_CAP();
        const balance = await PGOVaultInstance.unreleasedAmount();
        balance.should.be.bignumber.equal(lockedCap);
    });

    it('should have vested amount 0', async () => {
        const vested = await PGOVaultInstance.vestedAmount();
        log.info(vested);
        vested.should.be.bignumber.equal(new BigNumber(0));
    });

    it('should increase time to ICO END', async () => {
        log.info('[ ICO END TIME ]');
        await increaseTimeTo(VAULT_START_TIME);

        await gotCrowdSaleInstance.finalise();
        log.info('[ Finalized ]');
    });
    

    it('should increase time to release 1', async () => {
        log.info('[ Move Time to Vesting step 1]');
        await waitNDays(361);
    });

    it('should release locked liquidity vested tokens 1', async () => {
        //force ico closing 

        let lockedLiquidityWalletBalance = await gotTokenInstance.balanceOf(lockedLiquidityWallet);
        let vaultBalance = await gotTokenInstance.balanceOf(PGOVaultAddress);

        lockedLiquidityWalletBalance.should.be.bignumber.equal(0);
        vaultBalance.should.be.bignumber.equal(PGO_VAULT_CAP);

        const vested = await PGOVaultInstance.vestedAmount();
        vested.should.be.bignumber.equal(PGO_VAULT_STEP1);

        await PGOVaultInstance.release();

        lockedLiquidityWalletBalance = await gotTokenInstance.balanceOf(lockedLiquidityWallet);
        vaultBalance = await gotTokenInstance.balanceOf(PGOVaultAddress);

        log.info(lockedLiquidityWalletBalance);

        lockedLiquidityWalletBalance.should.not.be.bignumber.equal(0);
        lockedLiquidityWalletBalance.should.be.bignumber.equal(PGO_VAULT_STEP1);
        vaultBalance.should.be.bignumber.equal(PGO_VAULT_CAP - PGO_VAULT_STEP1);
    });

    it('should increase time to release 2', async () => {
        log.info('[ Move Time to Vesting step 2]');
        await waitNDays(180);
    });

    it('should release locked liquidity vested tokens 2', async () => {
        let lockedLiquidityWalletBalance = await gotTokenInstance.balanceOf(lockedLiquidityWallet);
        let vaultBalance = await gotTokenInstance.balanceOf(PGOVaultAddress);

        lockedLiquidityWalletBalance.should.be.bignumber.equal(PGO_VAULT_STEP1);
        vaultBalance.should.be.bignumber.equal(PGO_VAULT_CAP - PGO_VAULT_STEP1);

        const vested = await PGOVaultInstance.vestedAmount();
        vested.should.be.bignumber.equal(PGO_VAULT_STEP2);

        await PGOVaultInstance.release();

        lockedLiquidityWalletBalance = await gotTokenInstance.balanceOf(lockedLiquidityWallet);
        vaultBalance = await gotTokenInstance.balanceOf(PGOVaultAddress);

        log.info(lockedLiquidityWalletBalance);

        lockedLiquidityWalletBalance.should.not.be.bignumber.equal(PGO_VAULT_STEP1);
        lockedLiquidityWalletBalance.should.be.bignumber.equal(PGO_VAULT_STEP2);
        vaultBalance.should.be.bignumber.equal(PGO_VAULT_CAP - PGO_VAULT_STEP2);
    });

    it('should increase time to release 3', async () => {
        log.info('[ Move Time to Vesting step 3]');
        await waitNDays(180);
    });

    it('should release locked liquidity vested tokens 3', async () => {
        let lockedLiquidityWalletBalance = await gotTokenInstance.balanceOf(lockedLiquidityWallet);
        let vaultBalance = await gotTokenInstance.balanceOf(PGOVaultAddress);

        lockedLiquidityWalletBalance.should.be.bignumber.equal(PGO_VAULT_STEP2);
        vaultBalance.should.be.bignumber.equal(PGO_VAULT_CAP - PGO_VAULT_STEP2);

        const vested = await PGOVaultInstance.vestedAmount();
        vested.should.be.bignumber.equal(PGO_VAULT_STEP3);

        await PGOVaultInstance.release();

        lockedLiquidityWalletBalance = await gotTokenInstance.balanceOf(lockedLiquidityWallet);
        vaultBalance = await gotTokenInstance.balanceOf(PGOVaultAddress);

        log.info(lockedLiquidityWalletBalance);

        lockedLiquidityWalletBalance.should.be.bignumber.equal(PGO_VAULT_STEP3);
        vaultBalance.should.be.bignumber.equal(PGO_VAULT_CAP.minus(PGO_VAULT_STEP3));
    });

    it('should increase time to release 4', async () => {
        log.info('[ Move Time to Vesting step 4]');
        await waitNDays(180);
    });

    it('should release locked liquidity vested tokens 4', async () => {
        let lockedLiquidityWalletBalance = await gotTokenInstance.balanceOf(lockedLiquidityWallet);
        let vaultBalance = await gotTokenInstance.balanceOf(PGOVaultAddress);

        lockedLiquidityWalletBalance.should.be.bignumber.equal(PGO_VAULT_STEP3);
        vaultBalance.should.be.bignumber.equal(PGO_VAULT_CAP.minus(PGO_VAULT_STEP3));

        const vested = await PGOVaultInstance.vestedAmount();
        vested.should.be.bignumber.equal(PGO_VAULT_STEP4);

        await PGOVaultInstance.release();

        lockedLiquidityWalletBalance = await gotTokenInstance.balanceOf(lockedLiquidityWallet);
        vaultBalance = await gotTokenInstance.balanceOf(PGOVaultAddress);

        log.info(lockedLiquidityWalletBalance);

        lockedLiquidityWalletBalance.should.be.bignumber.equal(PGO_VAULT_STEP4);
        vaultBalance.should.be.bignumber.equal(PGO_VAULT_CAP - PGO_VAULT_STEP4);
        vaultBalance.should.be.bignumber.equal(0);
    });

    it('should increase time to a time after vesting completion', async () => {
        log.info('[ Move Time after vesting completion]');
        await waitNDays(40);
    });

    it('should not not have any locked liquidity left to release', async () => {
        let lockedLiquidityWalletBalance = await gotTokenInstance.balanceOf(lockedLiquidityWallet);
        let vaultBalance = await gotTokenInstance.balanceOf(PGOVaultAddress);

        lockedLiquidityWalletBalance.should.be.bignumber.equal(PGO_VAULT_STEP4);
        vaultBalance.should.be.bignumber.equal(PGO_VAULT_CAP - PGO_VAULT_STEP4);

        const vested = await PGOVaultInstance.vestedAmount();
        vested.should.be.bignumber.equal(PGO_VAULT_STEP4);

        await expectThrow(PGOVaultInstance.release());

        lockedLiquidityWalletBalance = await gotTokenInstance.balanceOf(lockedLiquidityWallet);
        vaultBalance = await gotTokenInstance.balanceOf(PGOVaultAddress);

        log.info(lockedLiquidityWalletBalance);

        lockedLiquidityWalletBalance.should.be.bignumber.equal(PGO_VAULT_STEP4);
        vaultBalance.should.be.bignumber.equal(0);
    });

    it('should finally have vault token amount equal to 0', async () => {
        const lockedCap = await gotCrowdSaleInstance.PGO_LOCKED_LIQUIDITY_CAP();
        const balance = await PGOVaultInstance.unreleasedAmount();
        balance.should.not.be.bignumber.equal(lockedCap);
        balance.should.be.bignumber.equal(0);
    });
});
