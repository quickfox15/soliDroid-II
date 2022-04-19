// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma abicoder v2;

import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
// import "@uniswap/v3-core/contracts/libraries/TickMath.sol";
import "@uniswap/v3-core/contracts/libraries/FixedPoint96.sol";
import "../libraries/FullMath.sol";
import "hardhat/console.sol";

contract V3OracleTWAP{
    function getSqrtTWAP96(address poolAddress, uint32 twapInterval) public view returns (uint160 sqrtPriceX96){
        if(twapInterval==0){
            (sqrtPriceX96,,,,,,) = IUniswapV3Pool(poolAddress).slot0();
            console.log(sqrtPriceX96);

        }
    }

    function getPriceX96FromSqrtPricex96(uint160 sqrtPriceX96) public view returns(uint256){
        console.log(FullMath.mulDiv(sqrtPriceX96 ,sqrtPriceX96, FixedPoint96.Q96));
        return FullMath.mulDiv(sqrtPriceX96 ,sqrtPriceX96, FixedPoint96.Q96); 
    }
    
}
