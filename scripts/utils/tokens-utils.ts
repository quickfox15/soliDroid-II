import { Signer } from "@ethersproject/abstract-signer";
import { BigNumber } from "@ethersproject/bignumber";
import chalk from "chalk";
// import { ethers } from "ethers";
import { IWETHhelper__factory, MockERC20, MockERC20__factory } from "../../typechain";

export async function transfer(signer: Signer, tokenAssress: string, _to: string, amount: BigNumber) {
    //teransfer token to bot
    let _signerAddress = await signer.getAddress();
    let mockERC20 = await MockERC20__factory.connect(tokenAssress, signer);

    await printBalance(mockERC20, _signerAddress, "signer")
    await printBalance(mockERC20, _to, "reciver")

    await mockERC20.approve(_to, amount);
    await mockERC20.transfer(_to, amount);

    await printBalance(mockERC20, _signerAddress, "signer")
    await printBalance(mockERC20, _to, "reciver")
}

export async function swapToWETH(signer: Signer, wethAddress: string, amount: BigNumber) {

    let mockERC20 = await MockERC20__factory.connect(wethAddress, signer);
    console.log(`swapToWETH: before signer ETH balance ${await signer.getBalance()}`);
    await printBalance(mockERC20, await signer.getAddress(), `signer`)

    const iwethHelper = IWETHhelper__factory.connect(wethAddress, signer);
    await iwethHelper.deposit({ value: amount });

    console.log(`swapToWETH: after signer ETH balance ${await signer.getBalance()}`);
    await printBalance(mockERC20, await signer.getAddress(), `signer`)
}

export async function printBalance(mockERC20: MockERC20, _address: string, name: string) {
    let token0balance = await mockERC20.balanceOf(_address);
    console.log(`${name} ${await mockERC20.symbol()} balance: ${chalk.green(token0balance)}`);
}