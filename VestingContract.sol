pragma solidity 0.6.2;


import { SafeMath } from "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/math/SafeMath.sol";
import { IERC20 } from "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/SafeERC20.sol";
import { Ownable } from "./Ownable.sol";

contract PlayCentTokenVesting is Ownable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    IERC20 private PlayCentToken;
    uint256 private tokensToVest;
    
    uint256 public vestingId;

    struct Vesting {
        uint256 releaseTime;
        uint256 amount;
        address beneficiary;
        bool released;
    }
    
    
    mapping(uint256 => Vesting) public vestings;
    mapping (address => uint256[]) public ListOfVestings;
    
    
    event TokenVestingAdded(uint256 indexed vestingId, address indexed beneficiary, uint256 amount);
    event TokenVestingReleased(uint256 indexed vestingId, address indexed beneficiary, uint256 amount);
    
    constructor(IERC20 _token) public {
        PlayCentToken = _token;
    }
    
    
    function addVesting(address _beneficiary, uint256 _releaseTime, uint256 _amount) public onlyOwner {
        require(_beneficiary != address(0x0), 'Invalid address');
        require(_releaseTime > block.timestamp, "Invalid release time");
        require(_amount != 0, "Amount must be greater then 0");
        tokensToVest = _amount;
        vestingId = vestingId.add(1);
        vestings[vestingId] = Vesting({
            beneficiary: _beneficiary,
            releaseTime: _releaseTime,
            amount: _amount,
            released: false
        });
        ListOfVestings[_beneficiary].push(vestingId);
        emit TokenVestingAdded(vestingId, _beneficiary, _amount);
    }
    
        function release(uint256 _vestingId) public {
        Vesting storage vesting = vestings[_vestingId];
        require(vesting.beneficiary != address(0x0), 'Invalid address');
        require(!vesting.released , 'Already released');
        require(block.timestamp >= vesting.releaseTime, 'Invalid release time');
        vesting.released = true;
        tokensToVest = tokensToVest.sub(vesting.amount);
        PlayCentToken.safeTransfer(vesting.beneficiary, vesting.amount);
        emit TokenVestingReleased(_vestingId, vesting.beneficiary, vesting.amount);
    }
    
        function currentTime() public view returns (uint256) {
        return block.timestamp;
    }
}
