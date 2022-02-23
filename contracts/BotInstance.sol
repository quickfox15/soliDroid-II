// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./libraries/BotInstanceLib.sol";
import "./interfaces/IStrategy.sol";

import "hardhat/console.sol";

contract BotInstance is ReentrancyGuard {

    Position private position;
    BotConfig private config;

    address private manager;
    address private beneficiary;
    IStrategy private strategy;

    address immutable UNISWAP_V2_ROUTER;
    address immutable UNISWAP_V2_FACTORY;

    // uint gas;

    modifier onlyBeneficiary() {
        require(
            beneficiary == msg.sender,
            "BotInstance: caller is not the beneficiary");
        _;
    }

    modifier onlyManager() {
        require(manager == msg.sender,"only manager");
        _;
    }
    
    modifier onlyManagerOrBeneficiary() {
        require( manager == msg.sender || beneficiary == msg.sender,
            "only manager or beneficiary");
        _;
    }

    enum Side { Buy,Sell,Withdraw}

    event TradeComplete_(
        Side side,
        address token0,
        address token1,
        uint256 amount0,
        uint256 amount1,
        uint indexed pTime,
        uint tTime
    );

    constructor(
        address _uniswap_v2_router,
        address _uniswap_v2_factory,
        address _beneficiary,
        address _quoteAsset,
        address _strategy,
        uint256 _defaultAmount,
        uint256 _stopLossPercent,
        bool _loop
    ) {
        require(
            _beneficiary != address(0),
            "invalid beneficiary"
        );
        UNISWAP_V2_ROUTER = _uniswap_v2_router;
        UNISWAP_V2_FACTORY = _uniswap_v2_factory;
        manager = msg.sender;
        beneficiary = _beneficiary;
        update(_strategy, _quoteAsset, _defaultAmount, _stopLossPercent, _loop);
    }

    function update(
        address _strategy,
        address _quoteAsset,
        uint256 _defaultAmount,
        uint256 _stopLossPercent,
        bool _loop

    ) public nonReentrant onlyManagerOrBeneficiary {
        require(_defaultAmount > 0, "invalid amount");
        require(
            _stopLossPercent > 0 && _stopLossPercent < 10000,
            "invalid stoploss"
        );
        require(
            //FIXME check its supported token
            _quoteAsset != address(0),
            "invalid quote asset"
        );
       require(_strategy != address(0),"invalid strategy");
        strategy = IStrategy(_strategy);
        config.quoteAsset = _quoteAsset;
        config.defaultAmount = _defaultAmount;
        config.stopLossPercent = _stopLossPercent;
        config.loop = _loop;
    }

    function withdraw(address _token) external onlyBeneficiary {
        if (position.open && _token==position.baseAsset) {
            emit TradeComplete_(
                Side.Sell,
                config.quoteAsset,
                position.baseAsset,
                0,
                0,
                position.blockTimestamp,
                block.timestamp
            );
            closePosition();
        }
        BotInstanceLib.withdrawToken(_token, beneficiary);
    }

    //======================== external view =========================//
    function getPosition() external view returns (Position memory) {
        return position;
    }

    function getPositionAndAmountOut()
        external
        view
        returns (Position memory _position, uint _reserveA, uint _reserveB)
    {
        _position = position;
        if (position.open) {
            (_reserveA, _reserveB) = BotInstanceLib
                .getReserves(UNISWAP_V2_FACTORY, config.quoteAsset ,position.baseAsset);
        } else {
            _reserveA = _reserveB = 0;
        }
    }

    function getConfig() external view returns (BotConfig memory) {
        return config;
    }

    function acceptSignal(address _quoteAsset) external view returns (bool) {
        return position.baseAsset == address(0) && config.quoteAsset == _quoteAsset;
    }

    function wakeMe() external view returns (bool _wakene) {

        if(position.open){
            (uint reserveA, uint reserveB) = BotInstanceLib
                .getReserves(UNISWAP_V2_FACTORY, config.quoteAsset ,position.baseAsset);

            return (strategy.shouldSell(position, reserveA, reserveB, config.stopLossPercent) > 0 )
                    ||
                   (strategy.shouldBuy(position,reserveA,  reserveB) > 0 );
            
        }else{
            //check if needs to buy
            return strategy.shouldBuy(position, 0,  0) > 0;
        }
    }

    //================== EXTERNALS ================================//

     function buySignal(address _token0, address _token1)
        external
        nonReentrant
        onlyManagerOrBeneficiary
    {

        require( position.baseAsset == address(0),"position already open");
        address quoteAsset =  config.quoteAsset;
        require(
            quoteAsset == _token0 &&
            quoteAsset != _token1 &&
            _token1 != address(0)
            ,"invalid pair"
        );

        uint256 balance0 = BotInstanceLib.tokenBalance(_token0);
        require(balance0 > 0, "insufficient balance");
        
        if (config.defaultAmountOnly) {
            require(
                balance0 >= config.defaultAmount,
                "insufficient balance"
            );
        }

        uint256 amount0 = balance0 < config.defaultAmount
            ? balance0
            : config.defaultAmount; 
//9475 //TODO we can save gas by skipping these validations. user will fail later anyway
        buySwap(amount0,_token0, _token1); 
    }

    // function botLoop() external nonReentrant onlyManagerOrBeneficiary {
    function botLoop() external nonReentrant  {

        //FIXME if a bot try to trade and get an error it will try again next botLoop
        //FIXME we need to add mechanisme to retry just x times and stop
        //not validation - save gas to good caller
        require(position.open, "no open position");

        (uint reserveA, uint reserveB) = BotInstanceLib.getReserves(UNISWAP_V2_FACTORY, config.quoteAsset ,position.baseAsset);

        uint amountToSell = strategy.shouldSell(
                position, reserveA, reserveB, config.stopLossPercent);
        
        if(amountToSell > 0){
            sellSwap(amountToSell); 
        }else{
            uint amountToBuy = strategy.shouldBuy(
                position, reserveA, reserveB);
            if(amountToBuy > 0){
                buySwap( amountToBuy, config.quoteAsset, position.baseAsset); 
            }
        }
    }

    function shouldSellAmount() external view returns(uint) {

        (uint reserveA, uint reserveB) = BotInstanceLib.getReserves(UNISWAP_V2_FACTORY, config.quoteAsset ,position.baseAsset);

        return strategy.shouldSell(
                position, reserveA, reserveB, config.stopLossPercent);
    }

    function sellPosition() external nonReentrant onlyManagerOrBeneficiary {
        sellSwap(position.amount);
    }

    //=================== PRIVATES ======================//
    function buySwap(
        uint256 amount,
        address _token0, 
        address _token1
    ) private {

        //swap gas is about 150000 of total 220000
        uint[] memory amounts = BotInstanceLib.swapExactTokensForTokens(
            UNISWAP_V2_ROUTER,
            _token0,
            _token1,
            amount);

        (uint reserveA, uint reserveB) = BotInstanceLib.getReserves(UNISWAP_V2_FACTORY, _token0 , _token1);

        if (!position.open) {
            position.baseAsset =_token1;
            position.blockTimestamp = uint32(block.timestamp % 2**32);
            position.openReserveA = uint112(reserveA);
            position.openReserveB = uint112(reserveB);
            position.open = true;
        }
        position.amount += uint112(amounts[1]);                                                 //gas 78947        (201778)
        position.buys++;

        emit TradeComplete_(
            Side.Buy,
            _token0,
            _token1,
            amounts[0],
            amounts[1],
            position.blockTimestamp,
            block.timestamp
        );
    }

    function sellSwap(uint256 amount) private {

        // console.log(amount);
        // console.log(position.amount);

        require(position.open,"sell position: position not open");
        require(amount <= position.amount , "sell: insufficient balance");

        address token0 = config.quoteAsset;
        address token1 = position.baseAsset;

        uint[] memory amounts = BotInstanceLib.swapExactTokensForTokens(
            UNISWAP_V2_ROUTER,
            token1,
            token0,
            amount);

        emit TradeComplete_(
            Side.Sell,
            token0,
            token1,
            amounts[1],amounts[0],
            position.blockTimestamp,
            block.timestamp
        );

        if(position.amount > amount){
            //position still open
            position.amount -= uint112(amount);
            position.sells++;
        }else{
            closePosition();
        }
    }

    function closePosition() private {
        if (config.loop) {
            delete position;
            //todo unregister from the loop alert
            //todo register for signal
        } else {
            //TODO do something else here
            delete position;
            //TODO return all assets
            //terminate
        }
    }
}
