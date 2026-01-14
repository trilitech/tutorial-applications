// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// for creating a contract that can be owned by an address
// this is useful for managing access permissions to methods in the contract
import "@openzeppelin/contracts/access/Ownable.sol";

// for preventing reentrancy attacks on functions that modify state
// this is important for functions that involve transferring tokens or ether
// to ensure that the function cannot be called again while it is still executing
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/** @title A simple prediction market that uses the Pari-mutuel model allowing winners to share the prize pool.
 */

contract PredictxtzContract is Ownable, ReentrancyGuard {

}
