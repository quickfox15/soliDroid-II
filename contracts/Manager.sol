// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

import "./BotInstance.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract Manager is Ownable {

    address immutable UNISWAP_V2_ROUTER;
    address immutable UNISWAP_V2_FACTORY;

    mapping(address => BotInstance) private usersBot;
    BotInstance[] private bots;
 
    constructor(
        address _uniswap_v2_router,
        address _uniswap_v2_factory
    ) {
        UNISWAP_V2_ROUTER = _uniswap_v2_router;
        UNISWAP_V2_FACTORY = _uniswap_v2_factory;
    }

    event BotCreated(
        address indexed _user,
        address indexed _bot,
        address _quoteAsset,
        uint256 _defaultAmount,
        uint256 _stopLossPercent,
        bool _loop    
    );

    function createBot(
        address _quoteAsset,
        address _strategy,
        uint256 _defaultAmount,
        uint256 _stopLossPercent,
        bool _loop

    ) public {
        require(usersBot[msg.sender] == BotInstance(address(0)), "already exist");

        BotInstance bot = new BotInstance(
                UNISWAP_V2_ROUTER,
                UNISWAP_V2_FACTORY,
                msg.sender,
                _quoteAsset,
                _strategy,
                _defaultAmount,
                _stopLossPercent,
                _loop);

        bots.push(bot);
        usersBot[msg.sender] = bot;

        emit BotCreated(
            msg.sender,
            address(usersBot[msg.sender]),
            _quoteAsset,
            _defaultAmount,
            _stopLossPercent,
            _loop);
    }

//TODO test this function
    function removeBot() external {
        delete usersBot[msg.sender];
        //TODO remove from array
    }

    function getBot() external view returns (BotInstance) {
        return usersBot[msg.sender];
    }
}
