const PcntContract = artifacts.require("PlayToken");

var BN = require("bignumber.js");

const { time,ether,expectRevert } = require("@openzeppelin/test-helpers");

contract("TokenSale Contract", accounts => {
  let tokenInstance = null;

  before(async () => {
    tokenInstance = await PcntContract.deployed();
  });


  it("Owner should be able to add User4,5,6 to the Sale Vesting Schedule", async()=>{
    const user4_amount = ether('2000');
    const user5_amount = ether('2000');
    const user6_amount = ether('2000');

    await tokenInstance.addVestingDetails([accounts[4]],[user4_amount],7);
    await tokenInstance.addVestingDetails([accounts[5]],[user5_amount],8);
    await tokenInstance.addVestingDetails([accounts[6]],[user6_amount],9);

    const userVestingData_4 = await tokenInstance.userToVestingDetails(accounts[4],7)
    const userVestingData_5 = await tokenInstance.userToVestingDetails(accounts[5],8)
    const userVestingData_6 = await tokenInstance.userToVestingDetails(accounts[6],9)
  
    // User 1 checks
    assert.equal(userVestingData_4[0].toString(),"7","Vesting Category Is wrongly assigned");
    assert.equal(userVestingData_4[1],accounts[4],"Wallet Address Is wrongly assigned");
    assert.equal(userVestingData_4[2].toString(),user4_amount.toString(),"Total Amount is wrongly assigned");
    assert.equal(userVestingData_4[8].toString(),"0","Total Amount claimed Is wrongly assigned");
    assert.equal(userVestingData_4[9],true,"IsVesting Is wrongly assigned");

    // User 2 checks
    assert.equal(userVestingData_5[0].toString(),"8","Vesting Category Is wrongly assigned for User 2");
    assert.equal(userVestingData_5[1],accounts[5],"Wallet Address Is wrongly assigned for User 2");
    assert.equal(userVestingData_5[2].toString(),user5_amount.toString(),"Total Amount is wrongly assigned for User 2");
    assert.equal(userVestingData_5[8].toString(),"0","Total Amount claimed wrongly assigned for User 2");
    assert.equal(userVestingData_5[9],true,"IsVesting Is wrongly assigned for User 2");

  })
it("Transfer tokens to contract", async()=>{
    const intialSupply = ether("50000")
    await tokenInstance.transfer(tokenInstance.address,intialSupply);
    const contractBalance = await tokenInstance.balanceOf(tokenInstance.address);
    assert.equal(contractBalance.toString(),intialSupply.toString(),"Balance Not transferred");
  })



 //  it("User 5 should return expected CLaim amount before Cliff", async()=>{
 //      const expectedClaims_user5 = await tokenInstance.calculateClaimableTokens(accounts[5],8);
 //      //console.log(` Before CLiff ${expectedClaims_user5.toString()}`)
 // })


  it("User 6 should not be able to claim amount before Cliff", async()=>{
       try{
           await tokenInstance.calculateClaimableTokens(accounts[6],9);
      }catch(error){
        const invalidOpcode = error.message.search("revert") >= 0;
        console.log(error.message);
        assert(invalidOpcode,`Expected revert but Got ${error}`)
      }
 })


    // 30 days later
  it("Time should increase by 30 Days", async() =>{
    await time.increase(time.duration.days(30));
  })

    it("User 6 should not be able to claim amount before Cliff after 1 month", async()=>{
       try{
           await tokenInstance.calculateClaimableTokens(accounts[6],9);
      }catch(error){
        const invalidOpcode = error.message.search("revert") >= 0;
        console.log(error.message);
        assert(invalidOpcode,`Expected revert but Got ${error}`)
      }
 })
    // 60
  it("Time should increase by 60 Days", async() =>{
    await time.increase(time.duration.days(30));
  })

 //  it("User 6 should claim TGE Tokens", async()=>{
 //      await tokenInstance.claimTGETokens(accounts[6],9);
 //      const balanceUser6 = await tokenInstance.balanceOf(accounts[6]);
 //      console.log(` After tge balance - ${balanceUser6.toString()}`)
 // })

    it("User 6 should not be able to claim amount before Cliff after 1 month", async()=>{
        const balanceBefore = "0";
        const balanceAfter = ether('400');

        const totalAmountAllocated_user6 = ether('2000');
        const expectedClaim_user6 = ether('400');
        const totalClaimed_user6 = ether('400');


        const balanceBefore_user6 = await tokenInstance.balanceOf(accounts[6]);
        const claimablTokens_before = await tokenInstance.calculateClaimableTokens(accounts[6],9);
        await tokenInstance.claimVestTokens(accounts[6],9,{from:accounts[6]});

        const totalClaimed = await tokenInstance.totalTokensClaimed(accounts[6],9);
        const userVestingData_6 = await tokenInstance.userToVestingDetails(accounts[6],9);
        const balanceAfter_user6 = await tokenInstance.balanceOf(accounts[6]);

        assert.equal(balanceBefore_user6.toString(),balanceBefore.toString(),"Balance Before is Wrong");
        assert.equal(balanceAfter_user6.toString(),balanceAfter.toString(),"Balance after is not right");
        assert.equal(totalClaimed.toString(),totalClaimed_user6.toString(),"Total Claimed is wrong");
        assert.equal(claimablTokens_before.toString(),expectedClaim_user6.toString(),"Expected claims is wrong")
        assert.equal(userVestingData_6[9],true,"Vesting is false");
        assert.equal(userVestingData_6[10],false,"TGe Claimed is true");

       })

  it("User 6 should not be able to claim amount  twice after 1 month", async()=>{
       try{
           await tokenInstance.claimVestTokens(accounts[6],9,{from:accounts[6]});
      }catch(error){
        const invalidOpcode = error.message.search("revert") >= 0;
        console.log(error.message);
        assert(invalidOpcode,`Expected revert but Got ${error}`)
      }
  })

  // TGE TOKEN CLAIM CHECK CHECK

    it("User 6 should not be able to claim TGE TOKENS", async()=>{
        const balanceBefore = ether('400');
        const balanceAfter = ether('800');

        const totalAmountAllocated_user6 = ether('2000');
        const expectedClaim_user6 = ether('400');
        const totalClaimed_user6 = ether('800');


        const balanceBefore_user6 = await tokenInstance.balanceOf(accounts[6]);
        await tokenInstance.claimTGETokens(accounts[6],9,{from:accounts[6]});

        const totalClaimed = await tokenInstance.totalTokensClaimed(accounts[6],9);
        const userVestingData_6 = await tokenInstance.userToVestingDetails(accounts[6],9);
        const balanceAfter_user6 = await tokenInstance.balanceOf(accounts[6]);

        assert.equal(balanceBefore_user6.toString(),balanceBefore.toString(),"Balance Before is Wrong");
        assert.equal(balanceAfter_user6.toString(),balanceAfter.toString(),"Balance after is not right");
        assert.equal(totalClaimed.toString(),totalClaimed_user6.toString(),"Total Claimed is wrong");
        assert.equal(userVestingData_6[9],true,"Vesting is false");
        assert.equal(userVestingData_6[10],true,"TGe Claimed is true");

       })
       // it("User 4 should not be able to claim TGE TOKENS", async()=>{
       //  const balanceBefore = "0";
       //  const balanceAfter = ether('200');

       //  const totalAmountAllocated_user6 = ether('2000');
       //  const totalClaimed_user6 = ether('200');


       //  const balanceBefore_user6 = await tokenInstance.balanceOf(accounts[4]);
       //  await tokenInstance.claimTGETokens(accounts[4],7,{from:accounts[4]});

       //  const totalClaimed = await tokenInstance.totalTokensClaimed(accounts[4],7);
       //  const userVestingData_6 = await tokenInstance.userToVestingDetails(accounts[4],7);
       //  const balanceAfter_user6 = await tokenInstance.balanceOf(accounts[4]);

       //  assert.equal(balanceBefore_user6.toString(),balanceBefore.toString(),"Balance Before is Wrong");
       //  assert.equal(balanceAfter_user6.toString(),balanceAfter.toString(),"Balance after is not right");
       //  assert.equal(totalClaimed.toString(),totalClaimed_user6.toString(),"Total Claimed is wrong");
       //  assert.equal(userVestingData_6[9],true,"Vesting is false");
       //  assert.equal(userVestingData_6[10],true,"TGe Claimed is true");

       // })

  it("Time should increase by 90 Days", async() =>{
    await time.increase(time.duration.days(30));
  })

  it("User 6 should not be able to claim amount before Cliff after 3 month from Cliff", async()=>{
        const balanceBefore = ether('800');
        const balanceAfter = ether('1400');

        const totalAmountAllocated_user6 = ether('2000');
        const expectedClaim_user6 = ether('600');
        const totalClaimed_user6 = ether('1400');


        const balanceBefore_user6 = await tokenInstance.balanceOf(accounts[6]);
        const claimablTokens_before = await tokenInstance.calculateClaimableTokens(accounts[6],9);
        await tokenInstance.claimVestTokens(accounts[6],9,{from:accounts[6]});

        const totalClaimed = await tokenInstance.totalTokensClaimed(accounts[6],9);
        const userVestingData_6 = await tokenInstance.userToVestingDetails(accounts[6],9);
        const balanceAfter_user6 = await tokenInstance.balanceOf(accounts[6]);

        assert.equal(balanceBefore_user6.toString(),balanceBefore.toString(),"Balance Before is Wrong");
        assert.equal(balanceAfter_user6.toString(),balanceAfter.toString(),"Balance after is not right");
        assert.equal(totalClaimed.toString(),totalClaimed_user6.toString(),"Total Claimed is wrong");
        assert.equal(claimablTokens_before.toString(),expectedClaim_user6.toString(),"Expected claims is wrong")
        assert.equal(userVestingData_6[9],true,"Vesting is false");
        assert.equal(userVestingData_6[10],true,"TGe Claimed is true");

       })

    it("Time should increase by 120 Days", async() =>{
    await time.increase(time.duration.days(30));
  })


   it("User 6 should not be able to claim amount before Cliff after 3 month from Cliff", async()=>{
        const balanceBefore = ether('1400');
        const balanceAfter = ether('2000');

        const totalAmountAllocated_user6 = ether('2000');
        const expectedClaim_user6 = ether('600');
        const totalClaimed_user6 = ether('2000');


        const balanceBefore_user6 = await tokenInstance.balanceOf(accounts[6]);
        const claimablTokens_before = await tokenInstance.calculateClaimableTokens(accounts[6],9);
        await tokenInstance.claimVestTokens(accounts[6],9,{from:accounts[6]});

        const totalClaimed = await tokenInstance.totalTokensClaimed(accounts[6],9);
        const userVestingData_6 = await tokenInstance.userToVestingDetails(accounts[6],9);
        const balanceAfter_user6 = await tokenInstance.balanceOf(accounts[6]);
        console.log(balanceBefore_user6.toString())
        console.log(balanceAfter_user6.toString())

        assert.equal(balanceBefore_user6.toString(),balanceBefore.toString(),"Balance Before is Wrong");
        assert.equal(balanceAfter_user6.toString(),balanceAfter.toString(),"Balance after is not right");
        assert.equal(totalClaimed.toString(),totalClaimed_user6.toString(),"Total Claimed is wrong");
        assert.equal(claimablTokens_before.toString(),expectedClaim_user6.toString(),"Expected claims is wrong")
        assert.equal(userVestingData_6[9],false,"Vesting is false");
        assert.equal(userVestingData_6[10],true,"TGe Claimed is true");

       })

     it("User 6 should not be able to claim amount  twice after 3 month", async()=>{
       try{
           await tokenInstance.claimVestTokens(accounts[6],9,{from:accounts[6]});
      }catch(error){
        const invalidOpcode = error.message.search("revert") >= 0;
        console.log(error.message);
        assert(invalidOpcode,`Expected revert but Got ${error}`)
      }
  })

      it("User 6 should not be able to claim amount  twice after 3 month", async()=>{
            const userVestingData_6 = await tokenInstance.userToVestingDetails(accounts[6],9);
                    console.log(userVestingData_6[9])
  })

    it("Time should increase by 270 Days", async() =>{
    await time.increase(time.duration.days(180));
  })


   it("User 4 should not be able to claim amount before Cliff after Complete vesting Period", async()=>{
        const balanceBefore = ether('200');
        const balanceAfter = ether('2000');

        const totalAmountAllocated_user4 = ether('2000');
        const expectedClaim_user4 = ether('1800');
        const totalClaimed_user4 = ether('2000');

        const balanceBefore_user4 = await tokenInstance.balanceOf(accounts[4]);
        const claimablTokens_before = await tokenInstance.calculateClaimableTokens(accounts[4],7);
        await tokenInstance.claimVestTokens(accounts[4],7,{from:accounts[4]});

        const totalClaimed = await tokenInstance.totalTokensClaimed(accounts[4],7);
        const userVestingData_4 = await tokenInstance.userToVestingDetails(accounts[4],7);
        const balanceAfter_user4 = await tokenInstance.balanceOf(accounts[4]);

        console.log(balanceAfter_user4.toString())
        console.log(totalClaimed.toString())
  
       //  assert.equal(balanceBefore_user4.toString(),balanceBefore.toString(),"Balance Before is Wrong");
       //  assert.equal(balanceAfter_user4.toString(),balanceAfter.toString(),"Balance after is not right");
       // // assert.equal(totalClaimed.toString(),totalClaimed_user4.toString(),"Total Claimed is wrong");
       //  assert.equal(claimablTokens_before.toString(),expectedClaim_user4.toString(),"Expected claims is wrong")
       //  assert.equal(userVestingData_4[9],false,"Vesting is false");
       //  assert.equal(userVestingData_4[10],true,"TGe Claimed is true");

       })
    it("Time should increase by 180 Days", async() =>{
    await time.increase(time.duration.days(30));
  })


 // //  it("User 5 should return expected CLaim amount before Cliff", async()=>{
 // //      const expectedClaims_user5 = await tokenInstance.calculateClaimableTokens(accounts[5],8);
 // //      console.log(` After 180 days ${expectedClaims_user5.toString()}`)
 // // })


 //  it("User 6 should return expected CLaim amount before Cliff", async()=>{
 //      const expectedClaims_user5 = await tokenInstance.calculateClaimableTokens(accounts[6],9);
 //      console.log(` After 180 days ${expectedClaims_user5.toString()}`)
 // })

 //    it("Time should increase by 210 Days", async() =>{
 //    await time.increase(time.duration.days(30));
 //  })


 // //  it("User 5 should return expected CLaim amount before Cliff", async()=>{
 // //      const expectedClaims_user5 = await tokenInstance.calculateClaimableTokens(accounts[5],8);
 // //      console.log(` After 210 days ${expectedClaims_user5.toString()}`)
 // // })


 //  it("User 6 should return expected CLaim amount before Cliff", async()=>{
 //      const expectedClaims_user5 = await tokenInstance.calculateClaimableTokens(accounts[6],9);
 //      console.log(` After 180 days ${expectedClaims_user5.toString()}`)
 // })

});
