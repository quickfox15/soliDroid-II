// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


struct Tick {
    uint32   timestamp;
    // uint112  closeReserveA;        
    // uint112  closeReserveB; 
    uint112  openPrice;
    uint112  closePrice;
    uint112  highPrice;
    uint112  lowPrice;
    uint112  volume;
}

enum Duration{_1m,_5m,_15m,_30m,_1h,_4h,_12h,_1d,_3d,_1w,_1M}

contract TickSeries{

    Duration public duration;
    Tick[] private series ;
    uint8 fistIndex; //256 max elements per array

    function add(Tick calldata tick) external {
        fistIndex++;
        series[fistIndex]=tick;
    }

    function getSeries() external view returns(Tick[] memory){
        return series;
    }

    function getTick(uint index) external view returns (Tick memory){
        require(index<series.length,"invalid index");
        return series[fistIndex+index];
    }

    function getFirst() external view returns (Tick memory){
        return  series[fistIndex];
    }

    function getLast() external view returns (Tick memory){
        return  series[fistIndex+1];
    }

    function getSize() external view returns (uint){
        return series.length;
    }
}