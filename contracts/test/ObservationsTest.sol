// SPDX-License-Identifier: MIT
pragma solidity =0.7.6;

import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import "@uniswap/v3-core/contracts/libraries/TickMath.sol";
import "@uniswap/v3-core/contracts/libraries/FixedPoint96.sol";
import "@uniswap/v3-core/contracts/libraries/FullMath.sol";

import "hardhat/console.sol";

contract ObservationsTest {

    function getTickAtMin(address pool, uint32 minuteAgo,uint32 uintSecondsAgo)
        public
        view
        returns (int24 arithmeticMeanTick)
    {
        require(minuteAgo > 0, "invlalid");
        
        uint32 secondsAgo = (minuteAgo * 60) + uintSecondsAgo;

        uint32[] memory secondsArr = new uint32[](2);
        secondsArr[0] = secondsAgo;
        secondsArr[1] = secondsAgo-60;

        (int56[] memory tickCumulatives, ) =  IUniswapV3Pool(pool).observe(secondsArr);

        int56 tickCumulativesDelta = tickCumulatives[1] - tickCumulatives[0];
        return int24(tickCumulativesDelta / 60);
    }
}