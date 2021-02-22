const pcntTest = artifacts.require("pcntTest");

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("pcntTest", function (/* accounts */) {
  it("should assert true", async function () {
    await pcntTest.deployed();
    return assert.isTrue(true);
  });
});
