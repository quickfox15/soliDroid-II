
// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.7.6;
pragma abicoder v2;

import "@uniswap/v3-core/contracts/libraries/Oracle.sol";

contract PoolHelper {
    Oracle.Observation[65535] public observations;
}
