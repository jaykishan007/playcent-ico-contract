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
	struct vestingDetails{
		uint8 categoryId;
		uint cliff;
		uint lockUpPeriod;
		uint vestPercentage;
		uint totalAllocatedToken;
	}

	struct vestAccountDetails{
		uint8 categoryId;
		address walletAddress;
		uint totalAmount;
		uint startTime;
		uint vestingDuration;
		uint vestingCliff;
		uint vestingPercent;
		uint totalAmountClaimed;
		bool isVesting;
		bool tgeTokensClaimed;
	}

mapping (uint => vestingDetails) public vestCategory;
mapping(address => mapping(uint8 => vestAccountDetails)) public userToVestingDetails;
	
	function initialize() initializer public{
		__Ownable_init();
        __ERC20_init('Playcent','PCNT');		
		__ERC20Pausable_init();
		_mint(owner(),60000000 ether);
 		
 		vestCategory[0] = vestingDetails(0,360 days,960 days,5 ether,9000000 ether); // Team
		vestCategory[1] = vestingDetails(1,90 days, 390 days,10 ether,4800000 ether); // Operations
		vestCategory[2] = vestingDetails(2,90 days, 390 days,10 ether,4800000 ether); // Marketing/Partners
		vestCategory[3] = vestingDetails(3,30 days, 330 days,10 ether,2400000 ether); // Advisors
		vestCategory[4] = vestingDetails(4,7 days, 300 days,10 ether,4800000 ether); //Staking/Early Incentive Rewards
		vestCategory[5] = vestingDetails(5,90 days, 840 days,4 ether,9000000 ether); //Play Mining	
		vestCategory[6] = vestingDetails(6,180 days, 900 days,4160000000000000000,4200000 ether); //Reserve	
		// Sale Vesting Strategies
		vestCategory[7] = vestingDetails(7,60 days,210 days,10 ether,5700000 ether); // Seed Sale
		vestCategory[8] = vestingDetails(8,60 days,150 days,15 ether,5400000 ether); // Private Sale 1
		vestCategory[9] = vestingDetails(9,60 days,120 days,20 ether,5100000 ether); // Private Sale 2
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
		return 1615746600; // March 15th
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

		vestingDetails memory vestData = vestCategory[_vestnigType];
		uint arrayLength = _userAddresses.length;

		for(uint i= 0; i<arrayLength; i++){
			uint8 categoryId = _vestnigType;
			address user = _userAddresses[i];
			uint256 amount = _vestingAmounts[i];
			uint256 vestingDuration = vestData.lockUpPeriod;
			uint256 vestingCliff = vestData.cliff;
			uint256 vestPercent = vestData.vestPercentage;


			addUserVestingDetails(user,categoryId,amount,vestingCliff,vestingDuration,vestPercent);
		}
		return true;
	}


	/** @notice - Internal functions that is initializes the vestAccountDetails Struct with the respective arguments passed
	 * @param _userAddresses addresses of the User
	 * @param _totalAmount total amount to be lockedUp
	 * @param _categoryId denotes the type of vesting selected
	 * @param _vestingCliff denotes the cliff of the vesting category selcted
	 * @param _vestingDuration denotes the total duration of the vesting category selcted
	 * @param _vestPercent denotes the percentage of total amount to be vested after cliff period
	 */
	 
	function addUserVestingDetails(address _userAddresses, uint8 _categoryId, uint256 _totalAmount, uint256 _vestingCliff, uint256 _vestingDuration,uint256 _vestPercent) onlyValidVestingBenifciary(_userAddresses,_categoryId) internal{	
		vestAccountDetails memory userVestingData = vestAccountDetails(
			_categoryId,
			_userAddresses,
			_totalAmount,
			block.timestamp,
			_vestingDuration,
			_vestingCliff,
			_vestPercent,
			0,
			true,
			false	
		);
		userToVestingDetails[_userAddresses][_categoryId] = userVestingData;
	}

	/**
	 * @notice Calculates the Variable Rate of Vest depending on the amount of time(months) elapsed
	 * @param user address of the User  
	 */
	function _getSaleVestRate(address user,uint8 _vestingIndex) internal view returns(uint256){
		vestAccountDetails memory vestingData = userToVestingDetails[user][_vestingIndex];
		uint8 category = vestingData.categoryId;
		//Check whether the category id is of any particular Sale(Seed,Private 1 or Private 2)
		require(category >= 7 && category <= 9,"Invalid Sale Vest Index");

		uint256 currentTime = getCurrentTime();
		uint256 userStartTime = vestingData.startTime;
		uint256 timeElapsed = currentTime.sub(userStartTime);
		uint256 oneDayInSeconds = daysInSeconds();

		uint256 timeElapsedInDays = timeElapsed.div(oneDayInSeconds);
		uint256 currentVestRate;

		if(category == 7){
            if(timeElapsedInDays > 60 && timeElapsedInDays <= 213 ){
            	currentVestRate = 15 ether;
            }
		}
		if(category == 8){
            if(timeElapsedInDays > 60 && timeElapsedInDays <= 120 ){
            	currentVestRate = 20 ether;
            }else if(timeElapsedInDays > 120 && timeElapsedInDays <= 150 ){
            	currentVestRate = 25 ether;
            }
		}
		if(category == 9){
            if(timeElapsedInDays > 60 && timeElapsedInDays <= 90 ){
            	currentVestRate = 20 ether;
            }else if(timeElapsedInDays > 90 && timeElapsedInDays <= 120 ){
            	currentVestRate = 30 ether;
            }
		}
		return currentVestRate;
	}

	function getVestingRate(address _userAddresses,uint8 _vestingIndex) public checkVestingStatus(_userAddresses,_vestingIndex) view returns(uint256){
		uint256 vestRate;
		vestAccountDetails memory vestData = userToVestingDetails[_userAddresses][_vestingIndex];

		if(vestData.categoryId <= 6){
	 		vestRate = vestData.vestingPercent;
	 	}else{
	 		vestRate = _getSaleVestRate(_userAddresses,_vestingIndex);
	 	}

	 	return vestRate;
	}
	
   /**
	 * @notice Calculates the amount of tokens to be transferred at any given point of time
	 * @param _userAddresses address of the User  
	 */
	 function calculateClaimableTokens(address _userAddresses,uint8 _vestingIndex) public view checkVestingStatus(_userAddresses,_vestingIndex) returns(uint256){	 	
	 	// Get Vesting Details
	 	vestAccountDetails memory vestData = userToVestingDetails[_userAddresses][_vestingIndex];
	 	
	 	uint256 vestRate;
	 	uint256 totalClaimableAmount;
	 	uint256 vestStartTime = vestData.startTime;
	 	uint256 currentTime = getCurrentTime();
	 	uint256 vestCliff = vestStartTime.add(vestData.vestingCliff);
	 	uint256 vestDuration = vestStartTime.add(vestData.vestingDuration);
	 	
	 	
	 	uint256 timeElapsed = currentTime.sub(vestStartTime);
	 	uint256 oneMonthInSeconds = monthInSeconds();

		vestRate = getVestingRate(_userAddresses,_vestingIndex);
	 	// Finally check the Claimable Amount by comparing the timeElapsed with the Current Time

	 	if(currentTime < vestCliff){  // If Vesting Cliff is not reached yet
	 		return 0;
	 	}else if(currentTime > vestDuration){ // If total duration of Vesting already crossed
	 		totalClaimableAmount = vestData.totalAmount.sub(vestData.totalAmountClaimed);
	 	}else{ // if current time has crossed the Vesting Cliff but not the total Vesting Duration
	 		
	 		uint256 amountPerMonth = (vestData.totalAmount.mul(vestRate)).div(100000000000000000000);
	 		uint256 totalMonthsElapsed = timeElapsed.div(oneMonthInSeconds);
	 		
	 		// Calculating Actual Months(Excluding the CLIFF) to initiate vesting
	 		
	 		uint actualMonthElapsed = totalMonthsElapsed.sub(vestData.vestingCliff.div(oneMonthInSeconds)); 
	 		require (actualMonthElapsed > 0,"Number of months elapsed is ZERO");
	 		totalClaimableAmount = (amountPerMonth.mul(actualMonthElapsed)).sub(vestData.totalAmountClaimed);
	 	}
	 	return totalClaimableAmount;

	 }
	 

   /**
	 * @notice An Internal Function to transfer tokens from this contract to the user
	 * @param _beneficiary address of the User  
	 * @param _amountOfTokens number of tokens to be transferred
	 */
	function _sendTokens(address _beneficiary, uint256 _amountOfTokens) internal returns(bool){
		_transfer(address(this),_beneficiary,_amountOfTokens);
		return true;
	}

	/**
	 * @notice Calculates and Transfer the total tokens to be transferred to the user after Token Generation Event is over
	 * @dev The function shall only work for users under Sale Vesting Category(index - 7,8,9). 
	 * @dev The function can only be called once by the user(only if the tgeTokensClaimed boolean value is FALSE). 
	 * Once the tokens have been transferred, tgeTokensClaimed becomes TRUE for that particular address
	 * @param _userAddresses address of the User  
	 */
	function  claimTGETokens(address _userAddresses,uint8 _vestingIndex) external checkVestingStatus(_userAddresses,_vestingIndex) returns(bool){
		uint256 currentTime = getCurrentTime();
		require (currentTime>getTgeTIME(), "Token Generation Event Not Started Yet");
		// Get Vesting Details
	 	vestAccountDetails memory vestData = userToVestingDetails[_userAddresses][_vestingIndex];

	 	require (vestData.categoryId >= 7 && vestData.categoryId <= 9, "Vesting Category doesn't belong to SALE VEsting" );
	 	require (vestData.tgeTokensClaimed == false, "TGE Tokens Have already been claimed for Given Address");
	 	
	 	uint256 totalAmount = vestData.totalAmount;
	 	uint256 vestRate = vestData.vestingPercent;

	 	uint256 tokensToTransfer = totalAmount.mul(vestRate).div(100000000000000000000);

	 	// Updating Contract State
	 	vestData.totalAmountClaimed += tokensToTransfer;
		vestData.tgeTokensClaimed = true;
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
	 	vestAccountDetails memory vestData = userToVestingDetails[_userAddresses][_vestingIndex];
		
		// Get total token amount to be transferred
		uint256 tokensToTransfer = calculateClaimableTokens(_userAddresses,_vestingIndex);
		uint256 contractTokenBalance = balanceOf(address(this));
		require(contractTokenBalance > tokensToTransfer,"Not Enough Token Balance in Contract");
		require(vestData.totalAmountClaimed.add(tokensToTransfer) <= vestData.totalAmount,"Cannot Claim more than Allocated");
		

		vestData.totalAmountClaimed += tokensToTransfer;
		if(vestData.totalAmountClaimed == vestData.totalAmount){
			vestData.isVesting = false;
		}
		userToVestingDetails[_userAddresses][_vestingIndex] = vestData;
		_sendTokens(_userAddresses,tokensToTransfer);
	}
	
	
}