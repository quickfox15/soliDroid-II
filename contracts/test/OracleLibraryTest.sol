// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.7.6;
pragma abicoder v2;

import "@uniswap/v3-periphery/contracts/libraries/OracleLibrary.sol";
import "@uniswap/v3-core/contracts/libraries/TickMath.sol";
import "hardhat/console.sol";

contract OracleLibraryTest {

    function consult(address pool, uint32 secondsAgo)
        public
        view
        returns (int24 arithmeticMeanTick, uint128 harmonicMeanLiquidity)
    {
        return OracleLibrary.consult(pool, secondsAgo);
    }

    function getQuoteAtTick(
        int24 tick,
        uint128 baseAmount,
        address baseToken,
        address quoteToken
    ) public view returns (uint256 quoteAmount) {
        // quoteAmount = OracleLibrary.getQuoteAtTick(tick, baseAmount, baseToken, quoteToken);

        uint160 sqrtRatioX96 = TickMath.getSqrtRatioAtTick(tick);
        console.log(sqrtRatioX96);
        console.log(type(uint128).max);
        // Calculate quoteAmount with better precision if it doesn't overflow when multiplied by itself
        if (sqrtRatioX96 <= type(uint128).max) {
            uint256 ratioX192 = uint256(sqrtRatioX96) * sqrtRatioX96;
            quoteAmount = baseToken < quoteToken
                ? FullMath.mulDiv(ratioX192, baseAmount, 1 << 192)
                : FullMath.mulDiv(1 << 192, baseAmount, ratioX192);
        } else {
            uint256 ratioX128 = FullMath.mulDiv(sqrtRatioX96, sqrtRatioX96, 1 << 64);
            quoteAmount = baseToken < quoteToken
                ? FullMath.mulDiv(ratioX128, baseAmount, 1 << 128)
                : FullMath.mulDiv(1 << 128, baseAmount, ratioX128);
        }
    }

    // For gas snapshot test
    function getGasCostOfConsult(address pool, uint32 period) public view returns (uint256) {
        uint256 gasBefore = gasleft();
        OracleLibrary.consult(pool, period);
        return gasBefore - gasleft();
    }

    function getGasCostOfGetQuoteAtTick(
        int24 tick,
        uint128 baseAmount,
        address baseToken,
        address quoteToken
    ) public view returns (uint256) {
        uint256 gasBefore = gasleft();
        OracleLibrary.getQuoteAtTick(tick, baseAmount, baseToken, quoteToken);
        return gasBefore - gasleft();
    }

    function getOldestObservationSecondsAgo(address pool)
        public
        view
        returns (uint32 secondsAgo, uint32 currentTimestamp)
    {
        secondsAgo = OracleLibrary.getOldestObservationSecondsAgo(pool);
        currentTimestamp = uint32(block.timestamp);
    }

    function getBlockStartingTickAndLiquidity(address pool) public view returns (int24 blockStartingTick, uint128 liquidity) {
        return OracleLibrary.getBlockStartingTickAndLiquidity(pool);
    }

    function getWeightedArithmeticMeanTick(OracleLibrary.WeightedTickData[] memory observations)
        public
        pure
        returns (int24 arithmeticMeanWeightedTick)
    {
        return OracleLibrary.getWeightedArithmeticMeanTick(observations);
    }
}
