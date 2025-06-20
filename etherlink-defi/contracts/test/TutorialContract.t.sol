// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import { Test, console2 } from "forge-std/Test.sol";
import { TutorialContract } from "../src/TutorialContract.sol";
import { MockPyth } from "@pythnetwork/pyth-sdk-solidity/MockPyth.sol";

contract ContractToTest is Test {
  MockPyth public pyth;
  bytes32 XTZ_PRICE_FEED_ID = bytes32(uint256(0x1));
  TutorialContract public myContract;

  uint256 XTZ_TO_WEI = 10 ** 18;

  function setUp() public {
    pyth = new MockPyth(60, 1);
    myContract = new TutorialContract(address(pyth), XTZ_PRICE_FEED_ID);
  }

  // Utility function to create a mocked Pyth price update for the test
  function createXtzUpdate(
    int64 xtzPrice
  ) private view returns (bytes[] memory) {
    bytes[] memory updateData = new bytes[](1);
    updateData[0] = pyth.createPriceFeedUpdateData(
      XTZ_PRICE_FEED_ID,
      xtzPrice * 100000, // price
      10 * 100000, // confidence
      -5, // exponent
      xtzPrice * 100000, // emaPrice
      10 * 100000, // emaConfidence
      uint64(block.timestamp), // publishTime
      uint64(block.timestamp) // prevPublishTime
    );

    return updateData;
  }

  // Utility function to set the Pyth price
  function setXtzPrice(int64 xtzPrice) private {
    bytes[] memory updateData = createXtzUpdate(xtzPrice);
    uint updateFee = pyth.getUpdateFee(updateData);
    vm.deal(address(this), updateFee);
    pyth.updatePriceFeeds{ value: updateFee }(updateData);
  }

  // Set the price that 5 XTZ = 1 USD and verify
  function testUpdateAndGet() public {
    // Set price
    int64 xtzPrice = 5;
    setXtzPrice(xtzPrice);

    // Call the updateAndGet function and send enough for the Pyth fee
    bytes[] memory updateData = createXtzUpdate(xtzPrice);
    uint updateFee = pyth.getUpdateFee(updateData);
    vm.deal(address(this), updateFee);

    // Verify that the contract has the same exchange rate for XTZ/USD
    uint256 priceWei = myContract.updateAndGet{ value: updateFee }(updateData);
    assertEq(priceWei, XTZ_TO_WEI / 5);
  }

  // Test that the transaction fails with stale data
  function testStaleData() public {
    int64 xtzPrice = 10;
    setXtzPrice(xtzPrice);
    bytes[] memory updateData = createXtzUpdate(xtzPrice);
    uint updateFee = pyth.getUpdateFee(updateData);
    vm.deal(address(this), updateFee);

    // Wait until the data is stale
    skip(120);

    // Expect the update to fail with stale data
    vm.expectRevert();
    myContract.getPrice();
  }

  // Test a full buy/sell scenario
  function testContract() public {
    bytes[] memory updateData = createXtzUpdate(10);

    // Set up a test user
    address testUser = address(0x5E11E1);
    vm.deal(testUser, XTZ_TO_WEI);
    vm.startPrank(testUser);

    // Test buying and selling
    myContract.initAccount(testUser);
    myContract.buy{ value: XTZ_TO_WEI / 10 }(updateData);
    myContract.buy{ value: XTZ_TO_WEI / 10 }(updateData);
    assertEq(7, myContract.getBalance(testUser));
    myContract.sell(updateData);
    assertEq(6, myContract.getBalance(testUser));

    // Test cashout
    uint256 balanceBefore = testUser.balance;
    myContract.cashout();
    uint256 balanceAfter = testUser.balance;
    assertLt(balanceBefore, balanceAfter);
    assertEq(0, myContract.getBalance(testUser));
  }
}
