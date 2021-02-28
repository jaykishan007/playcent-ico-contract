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


  it("User 6 should return expected CLaim amount before Cliff", async()=>{
      const expectedClaims_user5 = await tokenInstance.calculateClaimableTokens(accounts[6],9);
      console.log(` Before CLiff ${expectedClaims_user5.toString()}`)
 })


    // 91 days later
  it("Time should increase by 30 Days", async() =>{
    await time.increase(time.duration.days(30));
  })


 //  it("User 5 should return expected CLaim amount before Cliff", async()=>{
 //      const expectedClaims_user5 = await tokenInstance.calculateClaimableTokens(accounts[5],8);
 //     // console.log(` After 30 days ${expectedClaims_user5.toString()}`)
 // })

    it("User 6 should return expected CLaim amount before Cliff", async()=>{
      const expectedClaims_user5 = await tokenInstance.calculateClaimableTokens(accounts[6],9);
      console.log(` After 30 days ${expectedClaims_user5.toString()}`)
 })

  it("Time should increase by 60 Days", async() =>{
    await time.increase(time.duration.days(30));
  })

  it("User 6 should claim TGE Tokens", async()=>{
      await tokenInstance.claimTGETokens(accounts[6],9);
      const balanceUser6 = await tokenInstance.balanceOf(accounts[6]);
      console.log(` After tge balance - ${balanceUser6.toString()}`)
 })


 //  it("User 5 should be able to CLaim TGE tokens", async()=>{
 //      const expectedClaims_user5 = await tokenInstance.claimTGETokens(accounts[5],8);
      
 //      const user5_balance = await tokenInstance.balanceOf(accounts[5]);
 //      //console.log(user5_balance.toString());
 // })

  it("User 6 should return expected CLaim amount before Cliff", async()=>{
      const expectedClaims_user5 = await tokenInstance.calculateClaimableTokens(accounts[6],9);
      console.log(` After 60 days ${expectedClaims_user5.toString()}`)
 })


  it("Time should increase by 90 Days", async() =>{
    await time.increase(time.duration.days(30));
  })


 //  it("User 5 should return expected CLaim amount before Cliff", async()=>{
 //      const expectedClaims_user5 = await tokenInstance.calculateClaimableTokens(accounts[5],8);
 //    //  console.log(` After 90 days ${expectedClaims_user5.toString()}`)
 // })

    it("User 6 should return expected CLaim amount before Cliff", async()=>{
      const expectedClaims_user5 = await tokenInstance.calculateClaimableTokens(accounts[6],9);
      console.log(` After 90 days ${expectedClaims_user5.toString()}`)
 })

    it("Time should increase by 120 Days", async() =>{
    await time.increase(time.duration.days(30));
  })


 //  it("User 5 should return expected CLaim amount before Cliff", async()=>{
 //      const expectedClaims_user5 = await tokenInstance.calculateClaimableTokens(accounts[5],8);
 //      await tokenInstance.claimVestTokens(accounts[5],8);
 //      //const expectedClaims_user5_after = await tokenInstance.calculateClaimableTokens(accounts[5],8);

 //      const user5_balance = await tokenInstance.balanceOf(accounts[5]);
 //      console.log(user5_balance.toString());
 //      console.log(` After 120 days before ${expectedClaims_user5.toString()}`)
 //      //console.log(` After 120 days after ${expectedClaims_user5_after.toString()}`)

 // })

   it("User 6 should return expected CLaim amount before Cliff", async()=>{
      const expectedClaims_user5 = await tokenInstance.calculateClaimableTokens(accounts[6],9);
      console.log(` After 120 days ${expectedClaims_user5.toString()}`)
 })

    it("Time should increase by 150 Days", async() =>{
    await time.increase(time.duration.days(30));
  })


 //  it("User 5 should return expected CLaim amount before Cliff", async()=>{
 //      const expectedClaims_user5 = await tokenInstance.calculateClaimableTokens(accounts[5],8);
 //      //console.log(` After 150 days ${expectedClaims_user5.toString()}`)
 // })


  it("User 6 should return expected CLaim amount before Cliff", async()=>{
      const expectedClaims_user5 = await tokenInstance.calculateClaimableTokens(accounts[6],9);
      console.log(` After 150 days ${expectedClaims_user5.toString()}`)
 })

    it("Time should increase by 180 Days", async() =>{
    await time.increase(time.duration.days(30));
  })


 //  it("User 5 should return expected CLaim amount before Cliff", async()=>{
 //      const expectedClaims_user5 = await tokenInstance.calculateClaimableTokens(accounts[5],8);
 //      console.log(` After 180 days ${expectedClaims_user5.toString()}`)
 // })


  it("User 6 should return expected CLaim amount before Cliff", async()=>{
      const expectedClaims_user5 = await tokenInstance.calculateClaimableTokens(accounts[6],9);
      console.log(` After 180 days ${expectedClaims_user5.toString()}`)
 })

    it("Time should increase by 210 Days", async() =>{
    await time.increase(time.duration.days(30));
  })


 //  it("User 5 should return expected CLaim amount before Cliff", async()=>{
 //      const expectedClaims_user5 = await tokenInstance.calculateClaimableTokens(accounts[5],8);
 //      console.log(` After 210 days ${expectedClaims_user5.toString()}`)
 // })


  it("User 6 should return expected CLaim amount before Cliff", async()=>{
      const expectedClaims_user5 = await tokenInstance.calculateClaimableTokens(accounts[6],9);
      console.log(` After 180 days ${expectedClaims_user5.toString()}`)
 })

});
