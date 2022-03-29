import { ethers } from "hardhat";
import { BigNumber, Signer } from "ethers";
import { SwapExamples } from "../typechain";
import * as chai from 'chai';
import { MockERC20__factory } from "../typechain/factories/MockERC20__factory";
import chalk from "chalk";
import { context } from "../scripts/utils/context";
import { printBalance, swapToWETH, transfer } from "../scripts/utils/tokens-utils"
const _addresses = require('../scripts/conf/solidroid-address.json');

describe("test v3 swap", function () {

    let network: string;
    let signer: Signer;
    let signerAddr: string;

    let token0Addr: string;
    let token1Addr: string;


    beforeEach(async function () {

        signer = (await context.signers())[0];
        console.log(`network: ${chalk.blue(network = await context.netwrok())}`);
        console.log(`signer address: ${chalk.blue(signerAddr = await context.signerAddress())}`);
        token0Addr = _addresses[network].tokens[0].address;
        token1Addr = _addresses[network].tokens[4].address;
    });

    it("Should swap", async function () {
        this.timeout(0);

        let amountIn: BigNumber = BigNumber.from(ethers.utils.parseEther("100"));

        const SwapExamples = await ethers.getContractFactory("SwapExamples");
        const swapExample = await SwapExamples.deploy("0xE592427A0AEce92De3Edee1F18E0157C05861564", "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6");

        // let { mockERC20_0, mockERC20_1 } = await transferWETH(token0Addr, signer, token1Addr, amountIn, swapExample.address);

        let mockERC20_0 = await MockERC20__factory.connect(token0Addr, signer);
        let mockERC20_1 = await MockERC20__factory.connect(token1Addr, signer);

        console.log("token 0 :" + await mockERC20_0.symbol());
        console.log("token 1 :" + await mockERC20_1.symbol());
        await swapToWETH(signer, token0Addr, amountIn);
        await mockERC20_0.approve(swapExample.address, amountIn);

        let tx = swapExample.swapExactInputSingle(amountIn, token0Addr, token1Addr);
        (await tx).wait().then(details => {
            console.log("gasUsed: " + details.gasUsed.toString());
            console.log("cumulativeGasUsed: " + details.cumulativeGasUsed.toString());
            console.log("effectiveGasPrice: " + details.effectiveGasPrice.toString());
        });

        console.log("---------------------------------------");

        await printBalance(mockERC20_0, await signer.getAddress(), `signer`)
        await printBalance(mockERC20_1, await signer.getAddress(), `signer`)

        // let afterSwapBotBalance = await mockERC20_0.balanceOf(botInstance.address);
        // console.log("balance of 0 after swap :" + afterSwapBotBalance.toString());
        // let afterSwapBotBalance1 = await mockERC20_1.balanceOf(botInstance.address);
        // console.log("balance of 1 after swap :" + afterSwapBotBalance1.toString());

        // chai.expect(afterSwapBotBalance).to.eql(BigNumber.from(0));
        // chai.expect(afterSwapBotBalance1).to.be.gt(BigNumber.from(0));
    });

    // async function transferWETH(token0Addr: string, signer: Signer, token1Addr: string, defaultAmount: BigNumber, address: string) {
    //     let mockERC20_0 = await MockERC20__factory.connect(token0Addr, signer);
    //     let mockERC20_1 = await MockERC20__factory.connect(token1Addr, signer);

    //     console.log("token 0 :" + await mockERC20_0.symbol());
    //     console.log("token 1 :" + await mockERC20_1.symbol());

    //     await swapToWETH(signer, token0Addr, defaultAmount);
    // await transfer(signer, token0Addr, address, defaultAmount);

    // let initialBotBalance0 = await mockERC20_0.balanceOf(address);
    // console.log("balance of 0 before swap :" + initialBotBalance0.toString());
    // let initialBotBalance1 = await mockERC20_1.balanceOf(address);
    // console.log("balance of 1 before swap :" + initialBotBalance1.toString());

    // chai.expect(initialBotBalance0).to.eql(defaultAmount);
    // chai.expect(initialBotBalance1).to.eql(BigNumber.from(0));
    //     return { mockERC20_0, mockERC20_1 };
    // }
});


