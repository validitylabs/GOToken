/**
 * @title GotCrowdSale
 *
 * @version 1.0
 * @author Validity Labs AG <info@validitylabs.org>
 */
pragma solidity ^0.4.19;

import "../../node_modules/openzeppelin-solidity/contracts/token/ERC20/TokenVesting.sol";

import "./CrowdsaleBase.sol";
//import "./Reservation.sol";
import "./PGOVault.sol";
import "./GotToken.sol";
//import "./PresaleTokenVault.sol";

contract GotCrowdSale is CrowdsaleBase {

    /*** CONSTANTS ***/
    uint256 public constant START_TIME = 1527066712;                     // 9 May 2018 09:00:00 GMT
    uint256 public constant END_TIME = 1527068712;                       // 8 June 2018 09:00:00 GMT

    //Token allocation
    //Private presale allocation
    uint256 public constant PRIVATE_PRESALE_CAP = 1e6 * 1e18;
    //Team allocation
    uint256 public constant TEAM_CAP = 1e6 * 1e18;
    //Advisor allocation
    uint256 public constant ADVISOR_CAP = 0.5e6 * 1e18;
    //Company liquidity and Airdrop allocation
    uint256 public constant PGOUNLOCKED_CAP = 1.5e6 * 1e18;
    //Locked company liquidity
    uint256 public constant PGOLOCKED_CAP = 3.5e6 * 1e18;
    //ICO TOKEN ALLOCATION
    //Public ICO Cap
    uint256 public constant CROWDSALE_CAP = 0.275e6 * 1e18;
    //Reservation contract Cap
    uint256 public constant RESERVATION_CAP = 0.875e6 * 1e18;
    //Public Presale Allocation
    uint256 public constant PUBLIC_PRESALE_CAP = 1.35e6 * 1e18;
    //TOTAL ICO CAP
    uint256 public constant TOTAL_MAX_CAP = 2.5e6 * 1e18;                

    // Eidoo interface requires price as tokens/ether, therefore the discounts are presented as bonus tokens.
    // uint256 public constant BONUS_TIER1 = 108;                           // 8% during first 3 hours
    // uint256 public constant BONUS_TIER2 = 106;                           // 6% during next 9 hours
    // uint256 public constant BONUS_TIER3 = 104;                           // 4% during next 30 hours
    // uint256 public constant BONUS_DURATION_1 = 3 hours;
    // uint256 public constant BONUS_DURATION_2 = 12 hours;
    // uint256 public constant BONUS_DURATION_3 = 42 hours;

    // uint256 public constant FOUNDERS_VESTING_CLIFF = 1 years;
    // uint256 public constant FOUNDERS_VESTING_DURATION = 2 years;

    //Reservation public reservation;

    // Vesting contracts.
    //PresaleTokenVault public presaleTokenVault;
    //TokenVesting public foundersVault;
    PGOVault public pgoVault;

    // Vesting wallets.
    // address public foundersWallet;
    // address public advisorsWallet;
    address public pgoWallet;

    address public wallet;

    GotToken public token;

    // Lets owner manually end crowdsale.
    bool public didOwnerEndCrowdsale;

    /**
     * @dev Constructor.
     * @param _token address contract got tokens.
     * @param _wallet The address where funds should be transferred.
     * @param _pgoWallet The address where token will be send after vesting should be transferred.
     * @param _kycSigners Array of the signers addresses required by the KYCBase constructor, provided by Eidoo.
     * See https://github.com/eidoo/icoengine
     */
    function GotCrowdSale(
        address _token,
        address _wallet,
        address _pgoWallet,
        address[] _kycSigners
    )
        public
        CrowdsaleBase(START_TIME, END_TIME, TOTAL_MAX_CAP, _wallet, _kycSigners)
    {
        token = GotToken(_token);
        //reservation = Reservation(_reservation);
        //presaleTokenVault = PresaleTokenVault(_presaleTokenVault);
        //foundersWallet = _foundersWallet;
        //advisorsWallet = _advisorsWallet;
        pgoWallet = _pgoWallet;
        wallet = _wallet;
        // Creates founders vault contract
        //foundersVault = new TokenVesting(foundersWallet, END_TIME, FOUNDERS_VESTING_CLIFF, FOUNDERS_VESTING_DURATION, false);

        // Creates Ubiatar Play vault contract
        pgoVault = new PGOVault(pgoWallet, address(token), END_TIME);
    }

    /**
     * @dev Mints tokens to be held into the founders and Ubiatar Play vault contracts. Also mints the advisor's tokens to be held into the corresponding wallet.
     * To be called by the crowdsale's owner only.
     */
    function mintPreAllocatedTokens() public onlyOwner {
        // mintTokens(address(foundersVault), FOUNDERS_CAP);
        // mintTokens(advisorsWallet, ADVISORS_CAP);
        mintTokens(address(pgoVault), PGOLOCKED_CAP);
    }

    /**
     * @dev Sets the state of the presale vault contract and mints presale tokens. So far, the presale vault contract has been deployed and this function needs to be called to set its investments and vesting conditions.
     * @param beneficiaries Array of the presale investors addresses to whom vested tokens are transferred.
     * @param balances Array of token amount per beneficiary.
     */
    function initPresaleTokenVault(address[] beneficiaries, uint256[] balances) public onlyOwner {
        // require(beneficiaries.length == balances.length);

        // presaleTokenVault.init(beneficiaries, balances, PRESALE_VAULT_START, token);

        // uint256 totalPresaleBalance = 0;
        // uint256 balancesLength = balances.length;
        // for(uint256 i = 0; i < balancesLength; i++) {
        //     totalPresaleBalance = totalPresaleBalance.add(balances[i]);
        // }

        // mintTokens(presaleTokenVault, totalPresaleBalance);
    }

    /**
     * @dev Implements the price function from EidooEngineInterface.
     * @notice Calculates the price as tokens/ether based on the corresponding bonus bracket.
     * @return Price as tokens/ether.
     */
    function price() public view returns (uint256 _price) {
        // if (block.timestamp <= start.add(BONUS_DURATION_1)) {
        //     return tokenPerEth.mul(BONUS_TIER1).div(1e2);
        // } else if (block.timestamp <= start.add(BONUS_DURATION_2)) {
        //     return tokenPerEth.mul(BONUS_TIER2).div(1e2);
        // } else if (block.timestamp <= start.add(BONUS_DURATION_3)) {
        //     return tokenPerEth.mul(BONUS_TIER3).div(1e2);
        // }
        return tokenPerEth;
    }

    /**
     * @dev Mints tokens being sold during the reservation phase, as part of the implementation of the releaseTokensTo function
     * from the KYCBase contract.
     * Also, updates tokensSold and availableTokens in the crowdsale contract.
     * @param to The address that will receive the minted tokens.
     * @param amount The amount of tokens to mint.
     */
    function mintReservationTokens(address to, uint256 amount) public {
        // require(msg.sender == address(reservation));
        // tokensSold = tokensSold.add(amount);
        // availableTokens = availableTokens.sub(amount);
        // mintTokens(to, amount);
    }

    /**
     * @dev Mints tokens being sold during the crowdsale phase as part of the implementation of releaseTokensTo function
     * from the KYCBase contract.
     * @param to The address that will receive the minted tokens.
     * @param amount The amount of tokens to mint.
     */
    function mintTokens(address to, uint256 amount) private {
        token.mint(to, amount);
    }

    /**
     * @dev Allows the owner to close the crowdsale manually before the end time.
     */
    function closeCrowdsale() public onlyOwner {
        require(block.timestamp >= START_TIME && block.timestamp < END_TIME);
        didOwnerEndCrowdsale = true;
    }

    /**
     * @dev Allows the owner to unpause tokens, stop minting and transfer ownership of the token contract.
     */
    function finalise() public onlyOwner {
        require(didOwnerEndCrowdsale || block.timestamp > end || capReached);
        token.finishMinting();
        token.unpause();

        // Token contract extends CanReclaimToken so the owner can recover any ERC20 token received in this contract by mistake.
        // So far, the owner of the token contract is the crowdsale contract.
        // We transfer the ownership so the owner of the crowdsale is also the owner of the token.
        token.transferOwnership(owner);
    }
}

