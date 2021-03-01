pragma solidity 0.6.2;
// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/math/SafeMathUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/math/SafeMathUpgradeable.sol";


contract PlayToken is Initializable,OwnableUpgradeable,ERC20PausableUpgradeable{
    using SafeMathUpgradeable for uint;
    /**
     * Category 0 - Team
     * Category 1 - Operations
     * Category 2 - Marketing/Partners
     * Category 3 - Advisors
     * Category 4 - Staking/Earn Incentives
     * Category 5 - Play/Mining
     * Category 6 - Reserve
     * Category 7 - Seed Sale
     * Category 8 - Private 1
     * Category 9 - Private 2
     */
    struct VestingDetails{
        uint8 vestingIndex;
        uint vestingCliff;
        uint vestingDuration;
        uint tgePercent;
        uint monthlyPercent;
        uint totalAllocatedToken;
    }

    struct VestAccountDetails{
        uint8 vestingIndex;
        address walletAddress;
        uint totalTokensAllocated;
        uint tgeTokensAllocated;
        uint monthlyTokens;
        uint vestingDuration;
        uint vestingCliff;
        uint totalVestingTokensClaimed;
        bool isVesting;
        bool isTgeTokensClaimed;
    }

    mapping (uint => VestingDetails) public vestCategory;
    
    mapping(address => mapping(uint8 => VestAccountDetails)) public userToVestingDetails;
    
    function initialize(address _PublicSaleAddress) initializer public{
        __Ownable_init();
        __ERC20_init('Playcent','PCNT');        
        __ERC20Pausable_init();
        _mint(owner(),57600000 ether);
        _mint(_PublicSaleAddress,2400000 ether);
        
        vestCategory[0] = VestingDetails(0,12,32,0,5,9000000 ether); // Team
        vestCategory[1] = VestingDetails(1,3,13,0,10,4800000 ether); // Operations
        vestCategory[2] = VestingDetails(2,3,13,0,10,4800000 ether); // Marketing/Partners
        vestCategory[3] = VestingDetails(3,1,11,0,10,2400000 ether); // Advisors
        vestCategory[4] = VestingDetails(4,1,10,0,10,4800000 ether); //Staking/Early Incentive Rewards
        vestCategory[5] = VestingDetails(5,3,28,0,4, 9000000 ether); //Play Mining  
        vestCategory[6] = VestingDetails(6,6,31,0,4, 4200000 ether); //Reserve  
        // Sale Vesting Strategies
        vestCategory[7] = VestingDetails(7,1,7,10,15,5700000 ether); // Seed Sale
        vestCategory[8] = VestingDetails(8,1,5,15,20,5400000 ether); // Private Sale 1
        vestCategory[9] = VestingDetails(9,1,4,20,20,5100000 ether); // Private Sale 2
    }

    modifier onlyValidVestingBenifciary(address _userAddresses,uint8 _vestingIndex) { 
        require(_vestingIndex >= 0 && _vestingIndex <= 9,"Invalid Vesting Index");        
        require (_userAddresses != address(0),"Invalid Address");
        require (!userToVestingDetails[_userAddresses][_vestingIndex].isVesting,"User Vesting Details Already Added to this Category");
        _; 
    }

    modifier checkValidVestingCategory(uint8 _index){ 
        require(_index >= 0 && _index <= 9,"Invalid Vesting Index");
        _; 
    }

    modifier checkVestingStatus(address _userAddresses,uint8 _vestingIndex){ 
        require (userToVestingDetails[_userAddresses][_vestingIndex].isVesting,"User NOT added to any Vesting Category");
        _; 
    }

    function getCurrentTime() public view returns(uint256){
        return block.timestamp;
    }   

    function monthInSeconds() internal pure returns(uint256){       
        return 2592000;
    }
    
    function daysInSeconds() internal pure returns(uint256){        
        return 86400;
    }

    function  getTgeTIME() public pure returns(uint256){
        return 1615018379; // Sat Mar 06 2021 11:30:00 GMT+0000
    }

    function getTokenAmount(uint x, uint y, uint z) public pure returns (uint) {
        return x.mul(y).div(z);
    }
    
    

    /**
     * @notice - Allows only the Owner to ADD an array of Addresses as well as their Vesting Amount
               - The array of user and amounts should be passed along with the vestingCategory Index. 
               - Thus, a particular batch of addresses shall be added under only one Vesting Category Index 
     * @param _userAddresses array of addresses of the Users
     * @param _vestingAmounts array of amounts to be vested
     * @param _vestnigType allows the owner to select the type of vesting category
     * @return - true if Function executes successfully
     */

    function addVestingDetails(address[] calldata _userAddresses, uint256[] calldata _vestingAmounts, uint8 _vestnigType) external onlyOwner returns(bool){
        require(_userAddresses.length == _vestingAmounts.length,"Unequal arrays passed");

        // Get Vesting Category Details
        VestingDetails memory vestData = vestCategory[_vestnigType];
        uint arrayLength = _userAddresses.length;

        for(uint i= 0; i<arrayLength; i++){
            uint8 vestingIndex = _vestnigType;
            address user = _userAddresses[i];
            uint256 amount = _vestingAmounts[i];
            uint256 vestingCliff = vestData.vestingCliff;
            uint256 vestingDuration = vestData.vestingDuration;
            uint tgeAmount = getTokenAmount(_vestingAmounts[i], vestData.tgePercent, 100);
            uint monthlyAmount = getTokenAmount(_vestingAmounts[i], vestData.monthlyPercent, 100);

            addUserVestingDetails(user,vestingIndex,amount,vestingCliff,vestingDuration,tgeAmount,monthlyAmount);
        }
        return true;
    }


    
    /** @notice - Internal functions that is initializes the VestAccountDetails Struct with the respective arguments passed
     * @param _userAddresses addresses of the User
     * @param _totalAmount total amount to be lockedUp
     * @param _vestingIndex denotes the type of vesting selected
     * @param _vestingCliff denotes the cliff of the vesting category selcted
     * @param _vestingDuration denotes the total duration of the vesting category selcted
     * @param _tgeAmount denotes the total TGE amount to be transferred to the userVestingData
     * @param _monthlyAmount denotes the total Monthly Amount to be transferred to the user
     */
     
     
    function addUserVestingDetails(address _userAddresses, uint8 _vestingIndex, uint256 _totalAmount, uint256 _vestingCliff, uint256 _vestingDuration,uint256 _tgeAmount,uint256 _monthlyAmount) onlyValidVestingBenifciary(_userAddresses,_vestingIndex) internal{ 
        VestAccountDetails memory userVestingData = VestAccountDetails(
            _vestingIndex,
            _userAddresses,
            _totalAmount,
            _tgeAmount,
            _monthlyAmount,
            _vestingDuration,
            _vestingCliff,
            0,
            true,
            false   
        );
        userToVestingDetails[_userAddresses][_vestingIndex] = userVestingData;
    }

    function totalTokensClaimed(address _userAddresses,uint8 _vestingIndex) public view returns(uint256){
        // Get Vesting Details
        uint256 totalClaimedTokens;
        VestAccountDetails memory vestData = userToVestingDetails[_userAddresses][_vestingIndex];

        totalClaimedTokens = totalClaimedTokens.add(vestData.totalVestingTokensClaimed);
        
        if(vestData.isTgeTokensClaimed){
            totalClaimedTokens = totalClaimedTokens.add(vestData.tgeTokensAllocated);
        }
        
        return totalClaimedTokens;
    }
    
    
  /**
     * @notice Calculates the amount of tokens to be transferred at any given point of time
     * @param _userAddresses address of the User  
     */
     function calculateClaimableTokens(address _userAddresses,uint8 _vestingIndex) public view checkVestingStatus(_userAddresses,_vestingIndex) returns(uint256){       
        // Get Vesting Details
        VestAccountDetails memory vestData = userToVestingDetails[_userAddresses][_vestingIndex];
        
        uint[4] memory monthsToRates;
        monthsToRates[1] = 20;
        monthsToRates[2] = 50;
        monthsToRates[3] = 80;

        // Get Time Details
        uint256 actualClaimableAmount;
        uint256 tokensAfterElapsedMonths;
        uint256 vestStartTime = getTgeTIME();
        uint256 currentTime = getCurrentTime();
        uint256 timeElapsed = currentTime.sub(vestStartTime);
        uint256 totalMonthsElapsed = timeElapsed.div(monthInSeconds());
        uint256 _totalTokensClaimed = totalTokensClaimed(_userAddresses,_vestingIndex);

        //Check whether or not the VESTING CLIFF has been reached
        require (totalMonthsElapsed > vestData.vestingCliff,"Vesting Cliff Not Crossed Yet");

        // If total duration of Vesting already crossed, return pending tokens to claimed
        if(totalMonthsElapsed > vestData.vestingDuration){ 
                actualClaimableAmount = vestData.totalTokensAllocated.sub(_totalTokensClaimed);
         // if current time has crossed the Vesting Cliff but not the total Vesting Duration
         // Calculating Actual Months(Excluding the CLIFF) to initiate vesting
         }else{ 

            uint actualMonthElapsed = totalMonthsElapsed.sub(vestData.vestingCliff); 
            require (actualMonthElapsed > 0,"Number of months elapsed is ZERO");
            // Calculate the Total Tokens on the basis of Vesting Index and Month elapsed
            if (vestData.vestingIndex == 9){
                tokensAfterElapsedMonths = getTokenAmount(vestData.totalTokensAllocated,monthsToRates[actualMonthElapsed],100);
            }else{
                tokensAfterElapsedMonths = vestData.monthlyTokens.mul(actualMonthElapsed);
            }
            require (tokensAfterElapsedMonths > vestData.totalVestingTokensClaimed, "No Claimable Tokens at this Time");
            // Get the actual Claimable Tokens
            actualClaimableAmount = tokensAfterElapsedMonths.sub(vestData.totalVestingTokensClaimed);
         }
        return actualClaimableAmount;

     }

    
    /**
     * @notice Function to transfer tokens from this contract to the user
     * @param _beneficiary address of the User  
     * @param _amountOfTokens number of tokens to be transferred
     */
    function _sendTokens(address _beneficiary, uint256 _amountOfTokens) private returns(bool){
        _transfer(address(this),_beneficiary,_amountOfTokens);
        return true;
    }


    /**
     * @notice Calculates and Transfer the total tokens to be transferred to the user after Token Generation Event is over
     * @dev The function shall only work for users under Sale Vesting Category(index - 7,8,9). 
     * @dev The function can only be called once by the user(only if the isTgeTokensClaimed boolean value is FALSE). 
     * Once the tokens have been transferred, isTgeTokensClaimed becomes TRUE for that particular address
     * @param _userAddresses address of the User  
     */
    function  claimTGETokens(address _userAddresses,uint8 _vestingIndex) external checkVestingStatus(_userAddresses,_vestingIndex) returns(bool){
        uint256 currentTime = getCurrentTime();
        require (currentTime>getTgeTIME(), "Token Generation Event Not Started Yet");
        // Get Vesting Details
        VestAccountDetails memory vestData = userToVestingDetails[_userAddresses][_vestingIndex];

        require (vestData.vestingIndex >= 7 && vestData.vestingIndex <= 9, "Vesting Category doesn't belong to SALE VEsting" );
        require (vestData.isTgeTokensClaimed == false, "TGE Tokens Have already been claimed for Given Address");
        
        uint256 tokensToTransfer = vestData.tgeTokensAllocated;

        // Updating Contract State
        vestData.isTgeTokensClaimed = true;
        userToVestingDetails[_userAddresses][_vestingIndex] = vestData;
        _sendTokens(_userAddresses,tokensToTransfer);
    }
    
    /**
     * @notice Calculates and Transfers the total tokens to be transferred to the user by calculating the Amount of tokens to be transferred at the given time
     * @dev The function shall only work for users under Vesting Category is valid(index - 1 to 9). 
     * @dev isVesting becomes false if all allocated tokens have been claimed.
     * @dev User cannot claim more tokens than actually allocated to them by the OWNER
     * @param _userAddresses address of the User  
     */
    function claimVestTokens(address _userAddresses,uint8 _vestingIndex) external checkVestingStatus(_userAddresses,_vestingIndex) returns(bool){
        // Get Vesting Details
        VestAccountDetails memory vestData = userToVestingDetails[_userAddresses][_vestingIndex];
        
        // Get total token amount to be transferred
        uint256 _totalTokensClaimed = totalTokensClaimed(_userAddresses,_vestingIndex);
        uint256 tokensToTransfer = calculateClaimableTokens(_userAddresses,_vestingIndex);
        
        require (tokensToTransfer > 0,"No tokens to transfer");
        uint256 contractTokenBalance = balanceOf(address(this));
        require(contractTokenBalance > tokensToTransfer,"Not Enough Token Balance in Contract");
        require(_totalTokensClaimed.add(tokensToTransfer) <= vestData.totalTokensAllocated,"Cannot Claim more than Allocated");
        
        vestData.totalVestingTokensClaimed += tokensToTransfer;
        if(_totalTokensClaimed.add(tokensToTransfer) == vestData.totalTokensAllocated){
            vestData.isVesting = false;
        }
        userToVestingDetails[_userAddresses][_vestingIndex] = vestData;
        _sendTokens(_userAddresses,tokensToTransfer);
    }
    
}