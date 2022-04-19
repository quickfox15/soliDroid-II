// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma abicoder v2;

import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@uniswap/v3-periphery/contracts/interfaces/IQuoter.sol";

import "hardhat/console.sol";

contract SwapExamples {

    ISwapRouter public immutable swapRouter;
    IQuoter public immutable quoter;

    // For this example, we will set the pool fee to 0.3%.
    uint24 public constant poolFee = 3000;

    constructor(address _swapRouterAddress,address _quoterAddress) {
        swapRouter = ISwapRouter(_swapRouterAddress);
        quoter=IQuoter(_quoterAddress);
    }

//abi.encodePacked(params.tokenOut, params.fee, params.tokenIn)

    function swapExactInputSingle(
        uint256 amountIn,
        address _tokenAddr0,
        address _tokenAddr1) external returns (uint256 amountOut) {
        // msg.sender must approve this contract

        // Transfer the specified amount of DAI to this contract.
        TransferHelper.safeTransferFrom(_tokenAddr0, msg.sender, address(this), amountIn);

        // Approve the router to spend DAI.
        TransferHelper.safeApprove(_tokenAddr0, address(swapRouter), amountIn);

        //better to use oracle with 2 (or more) blocks avarage
        uint256 amountOutMinimum = 
            quoter.quoteExactInputSingle(
                _tokenAddr0, 
                _tokenAddr1, 
                poolFee, 
                amountIn, 
                0);

        console.log(amountOutMinimum);
        // use an oracle or other data source to choose a safer value for amountOutMinimum.
        // We also set the sqrtPriceLimitx96 to be 0 to ensure we swap our exact input amount.
        ISwapRouter.ExactInputSingleParams memory params =
            ISwapRouter.ExactInputSingleParams({
                tokenIn: _tokenAddr0,
                tokenOut: _tokenAddr1,
                fee: poolFee,
                recipient: msg.sender,
                deadline: block.timestamp,
                amountIn: amountIn,
                amountOutMinimum: amountOutMinimum,
                sqrtPriceLimitX96: 0
            });

        // The call to `exactInputSingle` executes the swap.
        amountOut = swapRouter.exactInputSingle(params);
    }
}