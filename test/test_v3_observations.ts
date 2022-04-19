import { ethers } from "hardhat";
import { BigNumber, Signer } from "ethers";
import { MockERC20__factory } from "../typechain/factories/MockERC20__factory";
import chalk from "chalk";
import { context } from "../scripts/utils/context";
import { printBalance, swapToWETH, transfer } from "../scripts/utils/tokens-utils"
import { PoolHelper__factory } from "../typechain";
const _addresses = require('../scripts/conf/solidroid-address.json');

describe("test observationspool helper", function () {

    let network: string;

    beforeEach(async function () {
        network = await context.netwrok()
        console.log(`network: ${chalk.blue(network)}`);

        //ethers.provider.getSigner()
    });

    it("test observations", async function () {
        this.timeout(0);
        var poolHelper = await PoolHelper__factory.connect("0x45dda9cb7c25131df268515131f647d726f50608",ethers.provider.getSigner());
        console.log(await poolHelper.observations(1));
    });
});


