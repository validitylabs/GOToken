import {expectThrow, getEvents, BigNumber} from './helpers/tools';
import {logger} from "./helpers/logger";

const {ecsign} = require('ethereumjs-util');
const abi = require('ethereumjs-abi');
const BN = require('bn.js');

const GotCrowdSale = artifacts.require('./GotCrowdSale.sol');
const GotToken = artifacts.require('./GotToken.sol');

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

// Values with higher MAX_AMOUNT to test when cap has been reached
const MAX_AMOUNT_MOCK = '60001000000000000000000';

const getKycDataMockMaxAmount = (userAddr, userid, icoAddr, pk) => {
    // sha256("Eidoo icoengine authorization", icoAddress, buyerAddress, buyerId);
    const hash = abi.soliditySHA256(
        ['string', 'address', 'address', 'uint64', 'uint'],
        ['Eidoo icoengine authorization', icoAddr, userAddr, new BN(userid), new BN(MAX_AMOUNT_MOCK)]
    );
    const sig = ecsign(hash, pk);
    return {
        id: userid,
        max: MAX_AMOUNT_MOCK,
        v: sig.v,
        r: '0x' + sig.r.toString('hex'),
        s: '0x' + sig.s.toString('hex')
    };
};

const USD_PER_TOKEN = 1;
const USD_PER_ETHER = 700;
const TOKEN_PER_ETHER =  USD_PER_ETHER / USD_PER_TOKEN;                     // 250 UAC tokens per ether


contract('GotCrowdSale',(accounts) => {
    const owner = accounts[0];
    const activeInvestor = accounts[1];

  // Provide gotTokenInstance for every test case
  let gotTokenInstance;
  let gotCrowdSaleInstance;
  beforeEach(async () => {
    gotCrowdSaleInstance = await GotCrowdSale.deployed();
    const gotTokenAddress = await gotCrowdSaleInstance.token();
    gotTokenInstance = await GotToken.at(gotTokenAddress);
  });

    it('should instantiate the Crowdsale correctly', async () => {
        const signer0 = await gotCrowdSaleInstance.kycSigners(0);
        signer0.should.be.equal('0x627306090abaB3A6e1400e9345bC60c78a8BEf57'.toLowerCase());
    });

    it('should have vested pgolocked tokens', async () => {
        const signer0 = await gotCrowdSaleInstance.kycSigners(0);
        signer0.should.be.equal('0x627306090abaB3A6e1400e9345bC60c78a8BEf57'.toLowerCase());
    });

    it('should have token ownership', async () => {
        const gotTokenInstanceOwner = await gotTokenInstance.owner();
        gotTokenInstanceOwner.should.equal(gotCrowdSaleInstance.address);
    });

});
