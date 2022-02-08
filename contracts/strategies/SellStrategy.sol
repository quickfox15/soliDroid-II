// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interfaces/IStrategy.sol";

import "hardhat/console.sol";

contract SellStrategy is IStrategy {

    //should access position of caller using delegatecall
    function shouldBuy(Position memory position, uint _reserve0, uint _reserve1) external pure override returns(uint){
        return position.blockTimestamp == 0 ? position.amount : 0 ;
    }

    function shouldSell(Position memory position, uint _reserve0, uint _reserve1, uint _stopLossPercent) external pure override returns(uint){ 
        return position.amount;
    }
}