// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Invoker{

    struct BotData {
        uint gasPrice;
        uint gas;
        uint balance;
        uint32 lastCallTime; 
        uint32 interval;
    }

    mapping(address => BotData) private botsBalance;

    function botLoop(address botAddress) external {

        BotData memory botData = botsBalance[botAddress];

        uint gasLeftStart = gasleft();
        // console.log(gasLeftStart);
        (bool success, bytes memory returnBytes)  = botAddress.call(abi.encodeWithSignature("botLoop()")); 
        require(success == true, "Call to botLoop() failed");
        // console.log(success);
        // console.log(abi.decode(returnBytes, (string)));

        uint gasLeftEnd = gasleft();

        // console.log(gasLeftEnd);
        // console.log( gasLeftStart - gasLeftEnd );
        // console.log(tx.gasprice);

        uint totalCost = tx.gasprice * (gasLeftStart-gasLeftEnd);

        // console.log(totalCost);
        
        (bool sent, bytes memory data) = msg.sender.call{value: totalCost}("");
        require(sent, "Failed to send Ether");
    }

    function deposit() external payable {
        console.log("bot deposit deposit");
        console.log(msg.value);
        botsBalance[msg.sender] = msg.value + botsBalance[msg.sender] ;
    }
} 