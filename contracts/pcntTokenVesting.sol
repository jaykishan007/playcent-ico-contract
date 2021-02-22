pragma solidity 0.6.2;
// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/math/SafeMathUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/math/SafeMathUpgradeable.sol";


contract PlaycentToken is Initializable,OwnableUpgradeable,ERC20PausableUpgradeable{
	using SafeMathUpgradeable for uint;

	/**
	 * @notice The initialize funtion acts as the constructor in Upgradable Contracts
	 * @dev All minted tokens goes to the owner of the contract
	*/
	function initialize() initializer public{
		__Ownable_init();
        __ERC20_init('Playcent','PCNT');		
		__ERC20Pausable_init();
		_mint(owner(),60000000 ether);
 		
	}
	
}