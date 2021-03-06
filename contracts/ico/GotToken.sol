/**
 * @title ParkinGO token
 *
 * @version 1.0
 * @author ParkinGO
 */
pragma solidity ^0.4.19;

import "../../node_modules/openzeppelin-solidity/contracts/token/ERC20/MintableToken.sol";
import "../../node_modules/openzeppelin-solidity/contracts/token/ERC20/PausableToken.sol";
import "../../node_modules/openzeppelin-solidity/contracts/ownership/CanReclaimToken.sol";


contract GotToken is CanReclaimToken, MintableToken, PausableToken {
    string public constant name = "GOToken";
    string public constant symbol = "GOT";
    uint8 public constant decimals = 18;

    /**
     * @dev Constructor of GotToken that instantiates a new Mintable Pausable Token
     */
    function GotToken() public {
        // token should not be transferable until after all tokens have been issued
        paused = true;
    }
}

