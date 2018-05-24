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
const TOKEN_PER_ETHER =  USD_PER_ETHER / USD_PER_TOKEN;                     // 700 GOT tokens per ether

/*INVESTORS DATA*/
// First investment: activeInvestor1
const INVESTOR1_WEI = 1e18;
const INVESTOR1_TOKEN_AMOUNT = 270 * 1e18;

/*TOKEN CAPS*/
const INTERNAL_VAULT_CAP = 2.5e7 * 1e18;
const PRESALE_VAULT_CAP = 1.35e7 * 1e18;
const PGO_VAULT_CAP = 3.5e7 * 1e18;


contract('GotCrowdSale',(accounts) => {
  const owner = accounts[0];
  const activeInvestor1 = accounts[1];

  // Provide gotTokenInstance for every test case
  let gotTokenInstance;
  let gotCrowdSaleInstance;

  let internalVaultAddress;
  let internalVaultInstance;
  let presaleVaultAddress;
  let pgoVaultAddress;

  beforeEach(async () => {
    gotCrowdSaleInstance = await GotCrowdSale.deployed();
    const gotTokenAddress = await gotCrowdSaleInstance.token();
    gotTokenInstance = await GotToken.at(gotTokenAddress);
  });

    it('should instantiate the Crowdsale correctly', async () => {
      const signer0 = await gotCrowdSaleInstance.kycSigners(0);
      signer0.should.be.equal('0x627306090abaB3A6e1400e9345bC60c78a8BEf57'.toLowerCase());
    });

    it('should instantiate the internal vault correctly', async () => {
      internalVaultAddress = await gotCrowdSaleInstance.pgoMonthlyInternalVault();
      //internalVaultInstance = await TokenVesting.at();
      const internalVaultBalance = await gotTokenInstance.balanceOf(internalVaultAddress);

      internalVaultBalance.should.be.bignumber.equal(INTERNAL_VAULT_CAP);
    });

    it('should instantiate the presale vault correctly', async () => {
      presaleVaultAddress = await gotCrowdSaleInstance.pgoMonthlyPresaleVault();
      const presaleVaultBalance = await gotTokenInstance.balanceOf(presaleVaultAddress);

      presaleVaultBalance.should.be.bignumber.equal(PRESALE_VAULT_CAP);
    });

    it('should instantiate the ParkinGO vault correctly', async () => {
        pgoVaultAddress = await gotCrowdSaleInstance.pgoVault();
        const pgoVaultBalance = await gotTokenInstance.balanceOf(pgoVaultAddress);

        pgoVaultBalance.should.be.bignumber.equal(PGO_VAULT_CAP);
    });

    // it('should have vested pgolocked tokens', async () => {
    //     const signer0 = await gotCrowdSaleInstance.kycSigners(0);
    //     signer0.should.be.equal('0x627306090abaB3A6e1400e9345bC60c78a8BEf57'.toLowerCase());
    // });

    // it('should fail, buyTokens method can not be called before crowdsale phase starts', async () => {
    //     const d = getKycData(activeInvestor1, 1, gotCrowdSaleInstance.address, SIGNER_PK);
    //     await expectThrow(gotCrowdSaleInstance.buyTokens(d.id, d.max, d.v, d.r, d.s, {from: activeInvestor1, value: INVESTOR1_WEI}));
    // });

    it('should buyTokens', async () => {
      const activeInvestorBalance1 = await gotTokenInstance.balanceOf(activeInvestor1);
      const totalSupply1 = await gotTokenInstance.totalSupply();

      const d = getKycData(activeInvestor1, 1, gotCrowdSaleInstance.address, SIGNER_PK);
      gotCrowdSaleInstance.buyTokens(d.id, d.max, d.v, d.r, d.s, {from: activeInvestor1, value: INVESTOR1_WEI});

      const activeInvestorBalance2 = await gotTokenInstance.balanceOf(activeInvestor1);
      const totalSupply2 = await gotTokenInstance.totalSupply();

      activeInvestorBalance2.should.not.be.bignumber.equal(activeInvestorBalance1);
      totalSupply2.should.not.be.bignumber.equal(totalSupply1);
    });

    it('should have token ownership', async () => {
      const gotTokenInstanceOwner = await gotTokenInstance.owner();
      gotTokenInstanceOwner.should.equal(gotCrowdSaleInstance.address);
    });

});
