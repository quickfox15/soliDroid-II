
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";


contract CandleSeries{

    struct Candle {
        int24 o;
        int24 h;
        int24 l;
        int24 c;
        // uint v; //volum
        uint16 i; //interval number of minuts
        uint32 timestamp;
    }

    uint16 seriesIndex;
    uint16 seriesCardinality;
    Candle[500] public series;


}