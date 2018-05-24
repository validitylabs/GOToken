# GOToken

## Deployment
1. Deploy GotToken and note the address
`2. Deploy Reservation and note the address`
`3. Deploy PresaleTokenVault and note the address`
4. Deploy GotCrowdSale and pass the addresses of token, reservation and presale token vault addresses (and further parameters as per constructor definition)
5. Set the crowdsale address in the reservation contract by calling `reservationInstance.setCrowdsale(gotCrowdsaleAddress)`
6. Transfer ownership of the token to the crowdsale by calling `gotTokenInstance.transferOwnership(gotCrowdsaleAddress)`
`7. Call the function in the crowdsale that mints the pre-allocated tokens for founders, advisors and UbiatarPlay gotCrowdsaleInstance.mintPreAllocatedTokens()`
8. Set the presale investments in the crowdsale by calling `gotCrowdSaleInstance.initPresaleTokenVault(beneficiaries, balances)`. **Note that this function can be called only one time!**.

## During the Reservation & Crowdsale phases
###### Callable by the owner only:
* Pause/unpause the sales in case of an emergency:
    - `reservationInstance.pause()`, `reservationInstance.unpause()`
    - `gotCrowdSaleInstance.pause()`, `gotCrowdSaleInstance.unpause()`

  **Note that no tokens can be minted when paused**.
* Recover ERC20 tokens sent by mistake to the GotToken, Reservation and GotCrowdSaleCrowdsale contracts:
    - `gotTokenInstance.reclaimToken(token)`
    - `reservationInstance.reclaimToken(token)`
    - `gotCrowdSaleInstance.reclaimToken(token)`

  The balance would be sent to the contract's owner. Then, the owner can transfer the recovered tokens to their respective owner.
* Close the crowdsale manually before the end time:
    - `gotCrowdSaleInstance.closeCrowdsale()`
* Finalise the crowdsale to make the tokens transferable, when the owner has closed the crowdsale or the max cap or end time has been reached:
    - `gotCrowdSaleInstance.finalise()`

  The ownership of the GotToken contract will be transferred to the Crowdsale contract's owner.

## Vesting phases
* Presale investor can claim the vested tokens by calling `presaleTokenVaultInstance.release()`.  Tokens can be transferred by a sender to the beneficiary's address, when calling `ubiatarPlayVault.release(beneficiary)`
* Transfer vested tokens to the UbiatarPlay wallet by calling `ubiatarPlayVaultInstance.release()`
* Transfer vested tokens to the founders wallet by calling `foundersVaultInstance.release()`

## Specifications
###### Token
* Basic ERC20 token features.
* Mintable (by corresponding crowdsale contract only).
* Pausable by owner.
* Name: “GOToken”.
* Symbol: “GOT”.
* Decimals: 18.
* Reclaimable token: allows the owner to recover any ERC20 token received. During the crowdsale period, the owner of the token is the crowdsale contract, therefore, it is convenient to reclaim tokens after the crowdsale has ended.

###### Reservation contract
* Start time: Epoch timestamp: TBA.
* End time: Epoch timestamp: TBA.
* Hard cap: 8.750.000 tokens (part of the ICO’s 11.500.000 hard cap).
* Price: USD 0.75 per token.
* Bonus: 25%.

###### Crowdsale
* Start time: Epoch timestamp: 1528794000 (12 June 2018 09:00:00 GMT).
* End time: Epoch timestamp: 1530003600 (26 June 2018 09:00:00 GMT).
* Price: USD 0.75 per token.
* Hard cap: 11.500.000 GOT tokens.
* Pausable: owner is able to pause (and unpause) the crowdsale phase.
* Reclaimable token: allows the owner to recover any ERC20 token received.
* Paused until ICO end epoch time.
* It should be possible to buy tokens for a specific address.
* Controlled: once the ICO has finished, it may not be possible to arbitrarily issue new
tokens.
* Tokens issued simultaneously with the reception of ether.
* Implements Eidoo interface:
https://github.com/eidoo/icoengine/blob/master/contracts/ICOEngineInterface.sol
* KYC implementation, based on
https://github.com/eidoo/icoengine/blob/master/contracts/KYCBase.sol

###### Token allocation
* Family Pre-sale
    * Already finished.
    * List of Presale investors wallet with GOT amount.
    * 13.500.000 tokens.
    * 1⁄3 tokens unlocked right after the end of ICO.
    * Continuous vesting of remaining 2⁄3 tokens: starts 9 months after the end of ICO
    and ends 36 months later.

 * Pre-sale
    * Already finished.
    * List of Presale investors wallet with GOT amount.
    * 10.000.000 tokens.
    * Continuous vesting: starts 9 months after the end of ICO and ends 36 months
    later.

* Founders
    * 10.000.000 tokens assigned to a unique wallet address.
    * Continuous vesting: starts 9 months after the end of ICO and ends 36 months
    later.

* Advisors
    * List of Advisors wallet with GOT amount.
    * 5.000.000 tokens.
    * Continuous vesting: starts 9 months after the end of ICO and ends 36 months
    later.

* ICO
    * 15.000.000 tokens.

* UbiatarPlay Vault
    * 25.000.000 tokens assigned to a unique wallet address.
    * Unlocked in this way (starting from the end of ICO):
        * 2.000.000 GOT after 3 month
        * 4.000.000 GOT after 6 month
        * 6.000.000 GOT after 9 month
        * 8.000.000 GOT after 12 month
        * 10.000.000 GOT after 18 month
        * 20.500.000 GOT after 24 months

## Requirements
The server side scripts requires NodeJS 8 to work properly.
Go to [NVM](https://github.com/creationix/nvm) and follow the installation description.
By running `source ./tools/initShell.sh`, the correct NodeJs version will be activated for the current shell.

NVM supports both Linux and OS X, but that’s not to say that Windows users have to miss out. There is a second project named [nvm-windows](https://github.com/coreybutler/nvm-windows) which offers Windows users the possibility of easily managing Node environments.

__nvmrc support for windows users is not given, please make sure you are using the right Node version (as defined in .nvmrc) for this project!__

For the Rinkeby and MainNet deployment, you need Geth on your machine.
Follow the [installation instructions](https://github.com/ethereum/go-ethereum/wiki/Building-Ethereum) for your OS.

Depending on your system the following components might be already available or have to be provided manually:
* [Python](https://www.python.org/downloads/windows/) 2.7 Version only! Windows users should put python into the PATH by cheking the mark in installation process. The windows build tools contain python, so you don't have to install this manually.
* GIT, should be already installed on *nix systems. Windows users have to install [GIT](http://git-scm.com/download/win) manually.
* On Windows systems, PowerShell is mandatory
* On Windows systems, windows build tools are required (npm install --global windows-build-tools)
* make (on Ubuntu this is part of the commonly installed `sudo apt-get install build-essential`)
* On OSX, the build tools included in XCode are required

## General
Before running the provided scripts, you have to initialize your current terminal via `source ./tools/initShell.sh` for every terminal in use. This will add the current directory to the system PATH variables and must be repeated for time you start a new terminal window from project base directory. Windows users with installed PoserShell should use the script `. .\tools\initShell.ps1` instead.
```
# *nix
cd <project base directory>
source ./tools/initShell.sh

# Win
cd <project base directory>
. .\tools\initShell.ps1
```

__Every command must be executed from within the projects base directory!__

## Setup
Open your terminal and change into your project base directory. From here, install all needed dependencies.
```
npm install
```
This will install all required dependecies in the directory _node_modules_.

## Compile, migrate, test and coverage
To compile, deploy and test the smart contracts, go into the projects root directory and use the task runner accordingly.
```
# Compile contract
truffle compile

# Migrate contract
truffle migrate

# Test the contract
truffle test `./test/testfilename`
```

### Contract Verification
The final step for the Rinkeby / MainNet deployment is the contract verificationSmart contract verification.

This can be done on [Etherscan](https://etherscan.io/address/<REAL_ADDRESS_HERE>) or [Rinkeby Etherscan](https://rinkeby.etherscan.io/address/<REAL_ADDRESS_HERE>).
- Click on the `Contract Creation` link in the `to` column
- Click on the `Contract Code` link

Fill in the following data.
```
Contract Address:       <CONTRACT_ADDRESS>
Contract Name:          <CONTRACT_NAME>
Compiler:               v0.4.19+commit.c4cbbb05
Optimization:           YES
Solidity Contract Code: <Copy & Paste from ./build/bundle/IcoCrowdsale_all.sol>
Constructor Arguments:  <ABI from deployment output>
```
Visit [Solc version number](https://github.com/ethereum/solc-bin/tree/gh-pages/bin) page for determining the correct version number for your project.

- Confirm you are not a robot
- Hit `verify and publish` button

Now your smart contract is verified.