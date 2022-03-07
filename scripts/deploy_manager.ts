import { BigNumber } from "@ethersproject/bignumber";
import { ethers } from "hardhat";
import { Manager } from "../typechain";

export async function deployManager(
    uniswapV2Router: string,
    uniswapV2Factory: string
) {

    return _deployManager(
        uniswapV2Router,
        uniswapV2Factory
    );
}


export async function _deployManager(
    uniswapV2Router: string,
    uniswapV2Factory: string
): Promise<Manager> {

    const BotInstanceLib = await ethers.getContractFactory("BotInstanceLib");
    const botInstanceLib = await BotInstanceLib.deploy();
    await botInstanceLib.deployed();

    const managerFactory = await ethers.getContractFactory("Manager"
        , {
            libraries: {
                BotInstanceLib: botInstanceLib.address
            },
        }
    );

    console.log("deploy contract: Manager\n");
    console.log(uniswapV2Router);
    console.log(uniswapV2Factory);

    return managerFactory.deploy(
        uniswapV2Router,
        uniswapV2Factory);
};
