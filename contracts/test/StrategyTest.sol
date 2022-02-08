// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interfaces/IStrategy.sol";
import "hardhat/console.sol";

contract StrategyTest {

    IStrategy private strategy;

    constructor(address _strategy){
        strategy = IStrategy(_strategy);
    }

    function shouldBuy(Position calldata _position, uint _reserve0, uint _reserve1) external view returns(uint amount){
        return strategy.shouldBuy(_position, _reserve0, _reserve1);
    }

    function shouldSell(Position calldata _position, uint _reserve0, uint _reserve1, uint _stopLossPercent) external view returns(uint amount){
        return strategy.shouldSell(_position, _reserve0, _reserve1, _stopLossPercent);
    }
}