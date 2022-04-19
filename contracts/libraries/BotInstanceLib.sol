// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import '@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol';
import '@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol';

// import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
// import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
// import "@uniswap/v3-periphery/contracts/interfaces/IQuoter.sol";

import "./SlSafeMath.sol";

import "hardhat/console.sol";

struct BotConfig {
    address quoteAsset;
    uint256 defaultAmount;
    uint256 stopLossPercent; //percent in basis point. %5 == 500.
    bool loop; //if loop is true this instance will remain active after position is closed and wait for another signal.
    bool defaultAmountOnly;
}

struct Position {
    //change address to code with mapping
    address baseAsset;
// uses single storage slot
    uint112  openReserveA;
    uint112  openReserveB;
    uint32   blockTimestamp;
    //can add fields up to 256bit
    uint112 amount;
    uint16 sells;
    uint16 buys;
    bool open;
}

library BotInstanceLib {
    using SlSafeMath for uint256;
    
    function tokenBalance(address _token) public view returns (uint256) {
        return IERC20(_token).balanceOf(address(this));
    }

    function withdrawToken(address _token, address _beneficiary) public {
        uint256 balance = tokenBalance(_token);
        IERC20(_token).approve(_beneficiary, balance);
        IERC20(_token).transfer(_beneficiary, balance);
    }

    function getReserves(address factory, address tokenA, address tokenB) internal view returns (uint reserveA, uint reserveB) {
        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        (uint reserve0, uint reserve1,) = IUniswapV2Pair(IUniswapV2Factory(factory).getPair(token0, token1)).getReserves();
                    // IUniswapV2Pair pair = IUniswapV2Pair(UniswapV2Library.pairFor(factory, tokenA, tokenB)
        (reserveA, reserveB) = tokenA == token0 ? (reserve0, reserve1) : (reserve1, reserve0);
    }

    function swapExactTokensForTokens(
        address UNISWAP_V2_ROUTER,
        address _token0, 
        address _token1,
        uint256 _amountIn
    ) external returns (uint[] memory amounts){
        IERC20 token0 = IERC20(_token0);
        require(
            token0.approve(UNISWAP_V2_ROUTER, _amountIn),
            "approve failed."
        );

        address[] memory path = new address[](2);
        path[0] = _token0;
        path[1] = _token1;
        //TODO can replace with Library amounts = UniswapV2Library.getAmountsOut(factory, amountIn, path);
        uint256 amountRecive = IUniswapV2Router02(UNISWAP_V2_ROUTER)
                    .getAmountsOut(_amountIn,path)[1];

        // uint256 calcOutMin = (amountRecive / 1000 ).mul(995);

        return IUniswapV2Router02(UNISWAP_V2_ROUTER).swapExactTokensForTokens(
            _amountIn,
            amountRecive,
            path,
            address(this),
            block.timestamp
        );
    }
}
