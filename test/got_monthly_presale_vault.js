import {expectThrow, waitNDays, getEvents, BigNumber, increaseTimeTo} from './helpers/tools';
import {logger as log} from "./helpers/logger";

const {ecsign} = require('ethereumjs-util');
const abi = require('ethereumjs-abi');
const BN = require('bn.js');

const GotCrowdSale = artifacts.require('./GotCrowdSale.sol');
const PGOMonthlyPresaleVault = artifacts.require('./PGOMonthlyPresaleVault.sol');
const GotToken = artifacts.require('./GotToken.sol');

const should = require('chai') // eslint-disable-line
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber')(BigNumber))
    .should();

// Values for testing buy methods with the required MAX_AMOUNT by Eidoo's KYCBase contract
const SIGNER_PK = Buffer.from('c87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3', 'hex');
const SIGNER_ADDR = '0x627306090abaB3A6e1400e9345bC60c78a8BEf57'.toLowerCase();
const OTHER_PK = Buffer.from('0dbbe8e4ae425a6d2687f1a7e3ba17bc98c673636790f1b8ad91193c05875ef1', 'hex');
const OTHER_ADDR = '0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef'.toLowerCase();
const MAX_AMOUNT = '1000000000000000000';

const getKycData = (userAddr, userid, icoAddr, pk) => {
    // sha256("Eidoo icoengine authorization", icoAddress, buyerAddress, buyerId, maxAmount);
    const hash = abi.soliditySHA256(
        [ 'string', 'address', 'address', 'uint64', 'uint' ],
        [ 'Eidoo icoengine authorization', icoAddr, userAddr, new BN(userid), new BN(MAX_AMOUNT) ]
    );
    const sig = ecsign(hash, pk);
    return {
        id: userid,
        max: MAX_AMOUNT,
        v: sig.v,
        r: '0x' + sig.r.toString('hex'),
        s: '0x' + sig.s.toString('hex')
    }
};

const USD_PER_TOKEN = 1;
const USD_PER_ETHER = 700;
const TOKEN_PER_ETHER =  USD_PER_ETHER / USD_PER_TOKEN;                     // 250 UAC tokens per ether

const VAULT_START_TIME = 1530004000;      // 26 June 2018 09:00:00 GMT

contract('PGOMonthlyPresaleVault',(accounts) => {
    const beneficiary1 = accounts[5];
    const beneficiary1_balance = new BigNumber(1.35e7 * 1e18);

    // Provide gotTokenInstance for every test case
    let gotTokenInstance;
    let gotCrowdSaleInstance;
    let gotTokenAddress;
    //let PGOVaultInstance;
    let pgoMonthlyPresaleVaultInstance;

    beforeEach(async () => {
        gotCrowdSaleInstance = await GotCrowdSale.deployed();
        gotTokenAddress = await gotCrowdSaleInstance.token();
        gotTokenInstance = await GotToken.at(gotTokenAddress);
        pgoMonthlyPresaleVaultInstance = await PGOMonthlyPresaleVault.deployed();
    });

    it('should increase time to ICO END', async () => {
        log.info('[ ICO END TIME ]');
        await increaseTimeTo(VAULT_START_TIME);

        let isICOEnded = await gotCrowdSaleInstance.ended();
        assert.isTrue(isICOEnded);
        await gotCrowdSaleInstance.finalise();
        isICOEnded = await gotCrowdSaleInstance.ended();
        assert.isTrue(isICOEnded);
        log.info('[ Finalized ]');
    });

    it('should check unlocked tokens before 9 month are 1/3', async () => {
        let beneficiary1Balance = await gotTokenInstance.balanceOf(beneficiary1);
        let vaultBalance = await gotTokenInstance.balanceOf(pgoMonthlyPresaleVaultInstance.address);

        beneficiary1Balance.should.be.bignumber.equal(0);
        vaultBalance.should.be.bignumber.equal(beneficiary1_balance);

        const vested = await pgoMonthlyPresaleVaultInstance.vestedAmount(beneficiary1);
        vested.should.be.bignumber.equal(beneficiary1_balance.div(3));

        let releasable = await pgoMonthlyPresaleVaultInstance.releasableAmount(beneficiary1);
        releasable.should.be.bignumber.equal(beneficiary1_balance.div(3));

        await pgoMonthlyPresaleVaultInstance.release(beneficiary1);

        releasable = await pgoMonthlyPresaleVaultInstance.releasableAmount(beneficiary1);
        releasable.should.be.bignumber.equal(0);

        beneficiary1Balance = await gotTokenInstance.balanceOf(beneficiary1);
        vaultBalance = await gotTokenInstance.balanceOf(pgoMonthlyPresaleVaultInstance.address);

        beneficiary1Balance.should.be.bignumber.equal(beneficiary1_balance.div(3));
        vaultBalance.should.be.bignumber.equal(beneficiary1_balance.sub(beneficiary1_balance.div(3)));
    });

    it('should check 1/27 of token are unlocked after 10 month ', async () => {
        BigNumber.config({DECIMAL_PLACES:0});

        await waitNDays(300);
        await pgoMonthlyPresaleVaultInstance.release(beneficiary1);

        const beneficiary1Balance = await gotTokenInstance.balanceOf(beneficiary1);

        log.info(beneficiary1Balance);

        const div27BeneficiaryBalance = beneficiary1_balance.mul(2).div(3).div(27);
        const initial33percentBalance = beneficiary1_balance.div(3);

        //div27BeneficiaryBalance.should.be.bignumber.equal(beneficiary1Balance.add(initial33percentBalance));
        beneficiary1Balance.should.be.bignumber.equal(div27BeneficiaryBalance.add(initial33percentBalance));
    });

    it('should check 2/27 of token are unlocked after 11 month ', async () => {
        BigNumber.config({DECIMAL_PLACES:0});

        await waitNDays(30);
        await pgoMonthlyPresaleVaultInstance.release(beneficiary1);

        let beneficiary1Balance = await gotTokenInstance.balanceOf(beneficiary1);

        log.info(beneficiary1Balance);

        let div27BeneficiaryBalance = beneficiary1_balance.mul(2).div(3).div(27);
        div27BeneficiaryBalance = div27BeneficiaryBalance.mul(2);
        const initial33percentBalance = beneficiary1_balance.div(3);

        beneficiary1Balance.should.be.bignumber.equal(div27BeneficiaryBalance.add(initial33percentBalance));
    });

    it('should release all token after vault end ', async () => {
        BigNumber.config({DECIMAL_PLACES:0});
        const days = 30*36;
        const endTime = VAULT_START_TIME + (days * 24 * 60 * 60);
        await increaseTimeTo(endTime);

        await pgoMonthlyPresaleVaultInstance.release(beneficiary1);

        const beneficiary1Balance = await gotTokenInstance.balanceOf(beneficiary1);

        beneficiary1Balance.should.be.bignumber.equal(beneficiary1_balance);
    });
});
