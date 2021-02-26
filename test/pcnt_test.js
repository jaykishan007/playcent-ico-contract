const PcntContract = artifacts.require("PlaycentToken");

var BN = require("bignumber.js");

const { time,ether,expectRevert } = require("@openzeppelin/test-helpers");

contract("TokenSale Contract", accounts => {
  let tokenInstance = null;

  before(async () => {
    tokenInstance = await PcntContract.deployed();
  });

  it("Contract is deployed", async () => {
    const contractAdd = tokenInstance.address;
    console.log(contractAdd);
  
  });
  //Testing the SWAN Token Contract
  it("Owner is Correct", async () => {
    const owner = await tokenInstance.owner();
    assert.equal(owner, accounts[0], "Owner's address is wrongly assigned");
  });

  it("Total Supply is correctly assigend", async ()=>{
    const total = await tokenInstance.totalSupply();
    const actualSupply = ether('60000000') 
    assert.equal(total.toString(),actualSupply.toString(),"Balance is not updated")

  })

  it("Owner has the all the minted totalSupply",async ()=>{
    const totalSupply = ether('60000000')
    const ownerBalance = await tokenInstance.balanceOf(accounts[0]);
    assert.equal(ownerBalance.toString(),totalSupply.toString(),"Balance is not updated")
  })

  it("Transfer tokens to contract", async()=>{
    const intialSupply = ether("50000")
    await tokenInstance.transfer(tokenInstance.address,intialSupply);
    const contractBalance = await tokenInstance.balanceOf(tokenInstance.address);
    assert.equal(contractBalance.toString(),intialSupply.toString(),"Balance Not transferred");
  })

  // Adding User details w.r.t vesting Categories by Owner
  it("Owner should be able to add User1,2 and 3 to the Vesting Schedule", async()=>{
    const user1_amount = ether('2000');
    const user2_amount = ether('4000');
    const user3_amount = ether('6000');
    const userArray = [accounts[1],accounts[2],accounts[3]];
    const amountsArray = [user1_amount,user2_amount,user3_amount];

    await tokenInstance.addVestingDetails(userArray,amountsArray,0);

    const userVestingData_1 = await tokenInstance.userToVestingDetails(accounts[1])
    const userVestingData_2 = await tokenInstance.userToVestingDetails(accounts[2])
    const userVestingData_3 = await tokenInstance.userToVestingDetails(accounts[3])
  
    // User 1 checks
    assert.equal(userVestingData_1[0].toString(),"0","Vesting Category Is wrongly assigned");
    assert.equal(userVestingData_1[1],accounts[1],"Wallet Address Is wrongly assigned");
    assert.equal(userVestingData_1[2].toString(),user1_amount.toString(),"Total Amount is wrongly assigned");
    assert.equal(userVestingData_1[6].toString(),"5000000000000000000","Vesting Rate Is wrongly assigned");
    assert.equal(userVestingData_1[7].toString(),user1_amount.toString(),"Total Remaining Amount Is wrongly assigned");
    assert.equal(userVestingData_1[8].toString(),"0","Total Amount claimed Is wrongly assigned");
    assert.equal(userVestingData_1[9],true,"IsVesting Is wrongly assigned");

    // User 2 checks
    assert.equal(userVestingData_2[0].toString(),"0","Vesting Category Is wrongly assigned for User 2");
    assert.equal(userVestingData_2[1],accounts[2],"Wallet Address Is wrongly assigned for User 2");
    assert.equal(userVestingData_2[2].toString(),user2_amount.toString(),"Total Amount is wrongly assigned for User 2");
    assert.equal(userVestingData_2[6].toString(),"5000000000000000000","Vesting Rate Is wrongly assigned  for User 2");
    assert.equal(userVestingData_2[7].toString(),user2_amount.toString(),"Remaining Amount Is wrongly assigned for User 2");
    assert.equal(userVestingData_2[8].toString(),"0","Total Amount claimed wrongly assigned for User 2");
    assert.equal(userVestingData_2[9],true,"IsVesting Is wrongly assigned for User 2");

  })

  it("Owner should be able to add User4,5,6 to the Sale Vesting Schedule", async()=>{
    const user4_amount = ether('2000');
    const user5_amount = ether('4000');
    const user6_amount = ether('6000');

    await tokenInstance.addVestingDetails([accounts[4]],[user4_amount],7);
    await tokenInstance.addVestingDetails([accounts[5]],[user5_amount],8);
    await tokenInstance.addVestingDetails([accounts[6]],[user6_amount],9);

    const userVestingData_4 = await tokenInstance.userToVestingDetails(accounts[4])
    const userVestingData_5 = await tokenInstance.userToVestingDetails(accounts[5])
    const userVestingData_6 = await tokenInstance.userToVestingDetails(accounts[6])
  
    // User 1 checks
    assert.equal(userVestingData_4[0].toString(),"7","Vesting Category Is wrongly assigned");
    assert.equal(userVestingData_4[1],accounts[4],"Wallet Address Is wrongly assigned");
    assert.equal(userVestingData_4[2].toString(),user4_amount.toString(),"Total Amount is wrongly assigned");
    assert.equal(userVestingData_4[6].toString(),"10000000000000000000","Vesting Rate Is wrongly assigned");
    assert.equal(userVestingData_4[7].toString(),user4_amount.toString(),"Total Remaining Amount Is wrongly assigned");
    assert.equal(userVestingData_4[8].toString(),"0","Total Amount claimed Is wrongly assigned");
    assert.equal(userVestingData_4[9],true,"IsVesting Is wrongly assigned");

    // User 2 checks
    assert.equal(userVestingData_5[0].toString(),"8","Vesting Category Is wrongly assigned for User 2");
    assert.equal(userVestingData_5[1],accounts[5],"Wallet Address Is wrongly assigned for User 2");
    assert.equal(userVestingData_5[2].toString(),user5_amount.toString(),"Total Amount is wrongly assigned for User 2");
    assert.equal(userVestingData_5[6].toString(),"15000000000000000000","Vesting Rate Is wrongly assigned  for User 2");
    assert.equal(userVestingData_5[7].toString(),user5_amount.toString(),"Remaining Amount Is wrongly assigned for User 2");
    assert.equal(userVestingData_5[8].toString(),"0","Total Amount claimed wrongly assigned for User 2");
    assert.equal(userVestingData_5[9],true,"IsVesting Is wrongly assigned for User 2");

  })



  // Adding User details w.r.t vesting Categories by only Owner
  // it("Only Owner should be able to add User1 to the Vesting Schedule", async()=>{
  //     const user1_amount = ether('2000');
  //   const user2_amount = ether('4000');
  //   const user3_amount = ether('6000');
  //     const userArray = [accounts[1],accounts[2],accounts[3]];
  //   const amountsArray = [user1_amount,user2_amount,user3_amount];
  //     expectRevert(
  //       await tokenInstance.addVestingDetails
  //       (userArray,amountsArray,0 , {from:accounts[4]}),
  //       "Only Owner Function Cannot be Called by NON Owner");
    
  // })


  //Check Normal Vesting RATE withRespect to time
  it("Normal Vesting Rates should be calculated as expected", async()=>{
      const expectedRate = ether('5');
      
      const vestRate_1 = await tokenInstance.getVestingRate(accounts[1]);
      const vestRate_2 = await tokenInstance.getVestingRate(accounts[2]);
      const vestRate_3 = await tokenInstance.getVestingRate(accounts[3]);
    
      assert.equal(vestRate_1.toString(),expectedRate.toString(),"Rates didn't match for User 1")
      assert.equal(vestRate_2.toString(),expectedRate.toString(),"Rates didn't match for User 2")
      assert.equal(vestRate_3.toString(),expectedRate.toString(),"Rates didn't match for User 3")
  })

  // Calculate Claimable Tokens before increasing time
  it("Calculate Claimable Tokens function should work as expected before increasing time ", async()=>{
      const expectedClaimableTokens_user1 = 0;
      const expectedClaimableTokens_user6 = 0;

      const actualClaimableReturn_user1 = await tokenInstance.calculateClaimableTokens(accounts[1]);
      const actualClaimableReturn_user6 = await tokenInstance.calculateClaimableTokens(accounts[6]);

      assert.equal(actualClaimableReturn_user1.toString(),expectedClaimableTokens_user1.toString(),"Calcualted Rate is wrong for user 1");
      assert.equal(actualClaimableReturn_user6.toString(),expectedClaimableTokens_user6.toString(),"Calcualted Rate is wrong for user 6");
 })

  // Claculating Rate before CLIFF 

   it("Calculate Claimable Tokens function should work as expected before 60 days cliff ", async()=>{
      const expectedClaimableTokens_user4 = 0;

      const actualClaimableReturn_user4 = await tokenInstance.calculateClaimableTokens(accounts[4]);
      
      assert.equal(actualClaimableReturn_user4.toString(),expectedClaimableTokens_user4.toString(),"Calcualted Rate is wrong for user 4");

 })
  /**
   * Time Checks Boundaries
   * Below 60 Days
   * Between 60 to 90 days
   * Between 90 to 120
   * Between 120 to 150 days
   * Between 150 to 213 days
   */



// CLAIMING FUNCTIONS CHECK (Time of Claiming )
/**
  * Claimining Before Cliff Period
  * Claiming After Vesting Duration is Over
  * Claiming Betweeen Cliff and Vesting Total Duration
  * Claiming Before TGE 
  * Claiming After TGE
  */


// CLAIMING FUNCTIONS CHECK (State Variables to CHECK)
/**
  * Token Balance of Contract Should update
  * Token Balance of Claiming User Should update
  * Total Amount Claimed by a particular address should update
  * Total Remaining Amount to be claimed should be update
  * If Complete Vesting Done, isVesting boolean should update to false
  * If TGE tokens claimed, tgeTokensClaimed boolean should update to false
  */

  // TGE CLAIM CHECK 

  // it('User 6 should not be able to Claim TGE tokens before TGE Time', async ()=>{
  //     try{
  //       await tokenInstance.claimTGETokens(accounts[6],{from:accounts[6]})
  //     }catch(error){
  //       const invalidOpcode = error.message.search("revert") >= 0;
  //       console.log(error.message);
  //       assert(invalidOpcode,`Expected revert but Got ${error}`)
  //     }
  // })

  // // 20 days later -> After TGE  Time Lock
  // it("Time should increase by 20 Days", async() =>{
  //   await time.increase(time.duration.days(20));
  // })

  // it('User 6 should be able to Claim TGE tokens after TGE Time', async ()=>{
  //     const user6_amount = ether('6000');
  //     const expectedClaims_user6 = ether('600');
  //     const user6_remainingAmount = ether('5400')
  //     const contractInitialBalance = ether('50000')
  //     const contractRemainingBalance = ether('49400')

  //     const balanceBefore_user6 = await tokenInstance.balanceOf(accounts[6]);
  //     const contractBalanceBefore = await tokenInstance.balanceOf(tokenInstance.address);

  //     // Claim Claiming Function
  //    await tokenInstance.claimTGETokens(accounts[6],{from:accounts[6]});
  //     const userVestingData_6 = await tokenInstance.userToVestingDetails(accounts[6])
      
  //     const balanceAfter_user6 = await tokenInstance.balanceOf(accounts[6]);
  //     const contractBalanceAfter = await tokenInstance.balanceOf(tokenInstance.address);
  //     const actualClaim_user6 = await tokenInstance.calculateClaimableTokens(accounts[6]);

     
  //     assert.equal(balanceBefore_user6.toString(),"0","No Toknes Transferred")
  //     assert.equal(balanceAfter_user6.toString(),expectedClaims_user2.toString(),"No Toknes Transferred")
  //     assert.equal(contractBalanceBefore.toString(),contractInitialBalance.toString(),"Contract Balance is less than expected");
  //     assert.equal(contractRemainingBalance.toString(),contractRemainingBalance.toString(),"Contract Balance didn't update after token transfer");
  //     assert.equal(userVestingData_6[8].toString(),expectedClaims_user6.toString(),"Total Amount Claimed Didn't update");
  //     assert.equal(userVestingData_6[7].toString(),user2_remainingAmount.toString(),"Remaining Amounts didn't update");
  //     assert.equal(userVestingData_6[9],true,"isVesting Boolean is false")
  //     assert.equal(userVestingData_6[10],true,"tgeTokensClaimed Boolean is false")
  // })

  //  it('User 6 should not be able to Claim TGE tokens Twice', async ()=>{
  //     try{
  //       await tokenInstance.claimTGETokens(accounts[6],{from:accounts[6]})
  //     }catch(error){
  //       const invalidOpcode = error.message.search("revert") >= 0;
  //       console.log(error.message);
  //       assert(invalidOpcode,`Expected revert but Got ${error}`)
  //     }
  // })


  it('User 4 should not be able to Claim Vest tokens before Cliff Period Time', async ()=>{
      try{
        await tokenInstance.claimVestTokens(accounts[4],{from:accounts[4]})
      }catch(error){
        const invalidOpcode = error.message.search("revert") >= 0;
        console.log(error.message);
        assert(invalidOpcode,`Expected revert but Got ${error}`)
      }
  })


// 120 Days later => 2 months after CLIFF
 it("Time should increase by 120 Days", async() =>{
    await time.increase(time.duration.days(120));
  })
  // User 2 claiming before CLIFF Period
   it("User 4 should be able to claim After Claim Period", async()=>{
      const user4_amount = ether('2000');
      const expectedClaims_user4 = ether('600');
      const user2_remainingAmount = ether('1400')
      const contractInitialBalance = ether('49400')
      const contractRemainingBalance = ether('49200')
      const balanceBefore_user4 = await tokenInstance.balanceOf(accounts[4]);
      const contractBalanceBefore = await tokenInstance.balanceOf(tokenInstance.address);

      // Claim Claiming Function
      await tokenInstance.claimVestTokens(accounts[4],{from:accounts[4]});
      const userVestingData_4 = await tokenInstance.userToVestingDetails(accounts[4])
      
      const balanceAfter_user4 = await tokenInstance.balanceOf(accounts[4]);
      const actualClaim_user4 = await tokenInstance.calculateClaimableTokens(accounts[4]);
      const contractBalanceAfter = await tokenInstance.balanceOf(tokenInstance.address);
      
      assert.equal(balanceBefore_user4.toString(),"0","No Toknes Transferred")
      assert.equal(balanceAfter_user4.toString(),expectedClaims_user4.toString(),"No Toknes Transferred")
     // assert.equal(contractBalanceBefore.toString(),contractInitialBalance.toString(),"Contract Balance is less than expected");
     // assert.equal(contractRemainingBalance.toString(),contractRemainingBalance.toString(),"Contract Balance didn't update after token transfer");
      assert.equal(userVestingData_4[8].toString(),expectedClaims_user4.toString(),"Total Amount Claimed Didn't update");
      assert.equal(userVestingData_4[7].toString(),user2_remainingAmount.toString(),"Remaining Amounts didn't update");
      assert.equal(userVestingData_4[9],true,"isVesting Boolean is false before than expected")
      assert.equal(userVestingData_4[10],false,"tgeTokensClaimed Boolean is true");
})


  it("User 2 should not be able to claim before Claim Period", async()=>{
     try{
        await tokenInstance.claimVestTokens(accounts[2],{from:accounts[2]})
      }catch(error){
        const invalidOpcode = error.message.search("revert") >= 0;
        console.log(error.message);
        assert(invalidOpcode,`Expected revert but Got ${error}`)
      }
 })

  // 275 Days after Cliff Period of User 2
  it("Time should increase by 275 Days", async() =>{
    await time.increase(time.duration.days(275));
  })
  // User 2 claiming before CLIFF Period
   it("User 2 should be able to claim After Claim Period", async()=>{
      const user2_amount = ether('4000');
      const expectedClaims_user2 = ether('200');
      const user2_remainingAmount = ether('3800')
      const contractInitialBalance = ether('49400')
      const contractRemainingBalance = ether('49200')
      const balanceBefore_user2 = await tokenInstance.balanceOf(accounts[2]);
      const contractBalanceBefore = await tokenInstance.balanceOf(tokenInstance.address);

      // Claim Claiming Function
      await tokenInstance.claimVestTokens(accounts[2],{from:accounts[2]});
      const userVestingData_2 = await tokenInstance.userToVestingDetails(accounts[2])
      
      const balanceAfter_user2 = await tokenInstance.balanceOf(accounts[2]);
      const contractBalanceAfter = await tokenInstance.balanceOf(tokenInstance.address);
      const actualClaim_user2 = await tokenInstance.calculateClaimableTokens(accounts[2]);

      
      assert.equal(balanceBefore_user2.toString(),"0","No Toknes Transferred")
      assert.equal(balanceAfter_user2.toString(),expectedClaims_user2.toString(),"No Toknes Transferred")
      //assert.equal(contractBalanceBefore.toString(),contractInitialBalance.toString(),"Contract Balance is less than expected");
     // assert.equal(contractRemainingBalance.toString(),contractRemainingBalance.toString(),"Contract Balance didn't update after token transfer");
      assert.equal(userVestingData_2[8].toString(),expectedClaims_user2.toString(),"Total Amount Claimed Didn't update");
      assert.equal(userVestingData_2[7].toString(),user2_remainingAmount.toString(),"Remaining Amounts didn't update");
      assert.equal(userVestingData_2[9],true,"isVesting Boolean is false before than expected")
 })


  // Check Claimable token for a particular user at any given time
   it("Claimable token should be calculated correctly at any given time", async()=>{
    
  })

});
