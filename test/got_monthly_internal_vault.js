import {expectThrow, waitNDays, getEvents, BigNumber} from './helpers/tools';
import {logger as log} from "./helpers/logger";

const {ecsign} = require('ethereumjs-util');
const abi = require('ethereumjs-abi');
const BN = require('bn.js');

const GotCrowdSale = artifacts.require('./GotCrowdSale.sol');
const PGOMonthlyInternalVault = artifacts.require('./PGOMonthlyInternalVault.sol');
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


contract('PGOMonthlyInternalVault',(accounts) => {
  const owner = accounts[0];
  const activeInvestor = accounts[1];

  // Provide gotTokenInstance for every test case
  let gotTokenInstance;
  let gotCrowdSaleInstance;
  let PGOVaultInstance;
  let PGOMonthlyInternalVaultInstance;

    beforeEach(async () => {
        gotCrowdSaleInstance = await GotCrowdSale.deployed();
        const gotTokenAddress = await gotCrowdSaleInstance.token();
        gotTokenInstance = await GotToken.at(gotTokenAddress);
        PGOMonthlyInternalVaultInstance = await PGOMonthlyInternalVault.deployed();
    });

    it('should have vested pgolocked tokens', async () => {
        let balance = await PGOVaultInstance.unreleasedAmount();
        log.info(balance);
    });

    it('should initially have token amount equal to crowdsale locked cap', async () => {
        const lockedCap = await gotCrowdSaleInstance.PGOLOCKED_CAP();
        const balance = await PGOVaultInstance.unreleasedAmount();
        balance.should.equal(lockedCap);
    });

    it('should increase vested amount after passing time offsets', async () => {
        const vestedAmount1 = await PGOVaultInstance.vestedAmount();
        log.info(vestedAmount1);
        await waitNDays(380);

        const vestedAmount2 = await PGOVaultInstance.vestedAmount();
        log.info(vestedAmount2);
        vestedAmount2.should.not.equal(vestedAmount1);
    });

});
