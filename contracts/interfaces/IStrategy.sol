// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../libraries/BotInstanceLib.sol";

interface IStrategy{
    function shouldBuy(Position memory position, uint _reserve0, uint _reserve1) external view returns(uint amount);
    function shouldSell(Position memory position, uint _reserve0, uint _reserve1, uint _stopLossPercent) external view returns(uint amount);
}