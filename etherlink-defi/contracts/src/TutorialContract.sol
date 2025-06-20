// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "@pythnetwork/pyth-sdk-solidity/IPyth.sol";

contract TutorialContract {
  IPyth pyth;
  bytes32 xtzUsdPriceId;
  mapping(address => uint256) balances;

  constructor(address _pyth, bytes32 _xtzUsdPriceId) {
    pyth = IPyth(_pyth);
    xtzUsdPriceId = _xtzUsdPriceId;
  }

  // Update the price
  function updatePrice(bytes[] calldata pythPriceUpdate) public {
    uint updateFee = pyth.getUpdateFee(pythPriceUpdate);
    pyth.updatePriceFeeds{ value: updateFee }(pythPriceUpdate);
  }

  // Get 1 USD in wei
  function getPrice() public view returns (uint256) {
    PythStructs.Price memory price = pyth.getPriceNoOlderThan(
      xtzUsdPriceId,
      60
    );
    uint xtzPrice18Decimals = (uint(uint64(price.price)) * (10 ** 18)) /
      (10 ** uint8(uint32(-1 * price.expo)));
    uint oneDollarInWei = ((10 ** 18) * (10 ** 18)) / xtzPrice18Decimals;
    return oneDollarInWei;
  }

  // Update and get the price in a single step
  function updateAndGet(bytes[] calldata pythPriceUpdate) external payable returns (uint256) {
    updatePrice((pythPriceUpdate));
    return getPrice();
  }

  // Buy function: increments sender's balance by 1
  function buy(bytes[] calldata pythPriceUpdate) external payable {

    // Update price
    updatePrice(pythPriceUpdate);
    uint256 oneDollarInWei = getPrice();

    // Require 1 USD worth of XTZ
    if (msg.value >= oneDollarInWei) {
      balances[msg.sender] += 1;
    } else {
      revert InsufficientFee();
    }
  }

  // Sell function: decrements sender's balance by 1
  function sell(bytes[] calldata pythPriceUpdate) external {
    require(getBalance(msg.sender) > 0, "Insufficient balance to sell");
    updatePrice(pythPriceUpdate);
    uint256 oneDollarInWei = getPrice();

    // Send the user 1 USD worth of XTZ
    require(address(this).balance > oneDollarInWei, "Not enough XTZ to send");
    (bool sent, ) = msg.sender.call{value: oneDollarInWei}("");
    require(sent, "Failed to send XTZ");
    balances[msg.sender] -= 1;
  }

  // For tutorial purposes, cash out the XTZ in the contract
  function cashout() public {
    require(address(this).balance > 0, "No XTZ to send");
    (bool sent, ) = msg.sender.call{value: address(this).balance}("");
    require(sent, "Failed to send XTZ");
    balances[msg.sender] = 0;
  }

  // Initialize accounts with 5 tokens for the sake of the tutorial
  function initAccount(address user) external {
    require(balances[msg.sender] < 5, "You already have at least 5 tokens");
    balances[user] = 5;
  }

  function getBalance(address user) public view returns (uint256) {
    return balances[user];
  }

  // Error raised if the payment is not sufficient
  error InsufficientFee();
}
