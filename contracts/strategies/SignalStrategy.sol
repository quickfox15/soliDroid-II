// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../libraries/BotInstanceLib.sol";
import "../libraries/SlSafeMath.sol";
import "../interfaces/IStrategy.sol";

import "hardhat/console.sol";

contract SignalStrategy is IStrategy {

    using SlSafeMath for uint;

    //should access position of caller using delegatecall
    function shouldBuy(Position memory position, uint _reserve0, uint _reserve1) external pure override returns(uint){
        return  0 ;//position.blockTimestamp == 0 ? position.amount : 0 ;
    }

    function shouldSell(Position memory position, uint _reserve0, uint _reserve1, uint _stopLossPercent) external pure override returns(uint){ 

        //can remove validation
        require(_reserve1 > 0 && position.openReserveB > 0 , "invalid reserve 0");
        uint amount = position.amount;
        require(amount > 0  , "amount is 0");

        //given some amount of an asset and pair reserves, returns an equivalent amount of the other asset
        uint amountAOrg = amount.mul(position.openReserveA)/position.openReserveB;
        uint amountAOut = amount.mul(_reserve0) / _reserve1;
        uint stopLossAmount = amountAOrg.mul(1000 - _stopLossPercent) / 1000;

        if( amountAOut < stopLossAmount ){
             return (amount);
        }else{
            //check target
            uint sells = position.sells;
            uint targetAmountA = nextTargetOut( sells, amountAOrg , _stopLossPercent);
            return amountAOut > targetAmountA ? nextTargetAmount(sells, amount ): 0;
        }
    }

    function nextTargetOut(uint sellsNum, uint amount, uint stopLossPercent) private pure returns (uint) {
        uint tragerPercent = stopLossPercent/3;
        if (sellsNum == 0) {
            return amount.mul(tragerPercent.add(1000)) / 1000;
        } else if (sellsNum == 1) {
            return amount.mul(tragerPercent.mul(2).add(1000)) / 1000;
        } else {
            return amount.mul(tragerPercent.mul(4).add(1000)) / 1000;
        }
    }

    function nextTargetAmount(uint targetsIndex, uint amount) private pure returns (uint256)
    {
        if (targetsIndex == 0) {
            return amount / 4;
        } else if (targetsIndex == 1) {
            return amount / 3;
        } else {
            return amount;
        }
    }
}