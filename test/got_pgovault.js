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
const SIGNER_PK = Buffer.from('c87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3', 'hex');
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
};

const USD_PER_TOKEN = 1;
const USD_PER_ETHER = 700;
const TOKEN_PER_ETHER =  USD_PER_ETHER / USD_PER_TOKEN;                     // 250 UAC tokens per ether

const VAULT_START_TIME = 1530003600;

/*TOKEN CAPS*/
const PGO_VAULT_CAP = new BigNumber(3.5e7 * 1e18);
const PGO_VAULT_STEP1 = new BigNumber(0.875e7 * 1e18);
const PGO_VAULT_STEP2 = new BigNumber(1.75e7 * 1e18);
const PGO_VAULT_STEP3 = new BigNumber(2.625e7 * 1e18);
const PGO_VAULT_STEP4 = new BigNumber(3.5e7 * 1e18);

contract('GotPGOVault',(accounts) => {
  const owner = accounts[0];
  const activeInvestor = accounts[1];

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
        let balance = await PGOVaultInstance.unreleasedAmount();
        balance.should.be.bignumber.equal(PGO_VAULT_CAP);
    });

    it('should initially have token amount equal to crowdsale locked cap', async () => {
        const lockedCap = await gotCrowdSaleInstance.PGO_LOCKED_LIQUIDITY_CAP();
        const balance = await PGOVaultInstance.unreleasedAmount();
        balance.should.be.bignumber.equal(lockedCap);
    });

    it('should have vested amount 0', async () => {
        let vested = await PGOVaultInstance.vestedAmount();
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

        const lockedLiquidityWalletBalance = await gotTokenInstance.balanceOf(lockedLiquidityWallet);
        const vaultBalance1 = await gotTokenInstance.balanceOf(PGOVaultAddress);

        lockedLiquidityWalletBalance.should.be.bignumber.equal(0);
        vaultBalance1.should.be.bignumber.equal(PGO_VAULT_CAP);

        let vested = await PGOVaultInstance.vestedAmount();
        vested.should.be.bignumber.equal(PGO_VAULT_STEP1);

        await PGOVaultInstance.release();

        const lockedLiquidityWalletBalance2 = await gotTokenInstance.balanceOf(lockedLiquidityWallet);
        const vaultBalance2 = await gotTokenInstance.balanceOf(PGOVaultAddress);

        log.info(lockedLiquidityWalletBalance2);

        assert.notEqual(lockedLiquidityWalletBalance2, 0);
        vaultBalance1.should.be.bignumber.equal(vaultBalance2.plus(lockedLiquidityWalletBalance2));

        lockedLiquidityWalletBalance2.should.be.bignumber.equal(PGO_VAULT_STEP1);

    });

    it('should increase time to release 2', async () => {
        log.info('[ Move Time to Vesting step 2]');
        await waitNDays(180);
    });

    it('should release locked liquidity vested tokens 2', async () => {
        //force ico closing 

        const lockedLiquidityWalletBalance = await gotTokenInstance.balanceOf(lockedLiquidityWallet);
        const vaultBalance1 = await gotTokenInstance.balanceOf(PGOVaultAddress);

        lockedLiquidityWalletBalance.should.be.bignumber.equal(PGO_VAULT_STEP1);
        vaultBalance1.should.be.bignumber.equal(PGO_VAULT_CAP);

        let vested = await PGOVaultInstance.vestedAmount();
        vested.should.be.bignumber.equal(PGO_VAULT_STEP2);

        await PGOVaultInstance.release();

        const lockedLiquidityWalletBalance2 = await gotTokenInstance.balanceOf(lockedLiquidityWallet);
        const vaultBalance2 = await gotTokenInstance.balanceOf(PGOVaultAddress);

        log.info(lockedLiquidityWalletBalance2);

        assert.notEqual(lockedLiquidityWalletBalance2, 0);
        vaultBalance1.should.be.bignumber.equal(vaultBalance2.plus(lockedLiquidityWalletBalance2));

        lockedLiquidityWalletBalance2.should.be.bignumber.equal(PGO_VAULT_STEP2);

    });

});
