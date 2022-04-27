import { ethers } from "hardhat";
import { BigNumber, Signer } from "ethers";
// import { MockERC20__factory } from "../typechain/factories/MockERC20__factory";
import chalk from "chalk";
import { context } from "../scripts/utils/context";
// import { printBalance, swapToWETH, transfer } from "../scripts/utils/tokens-utils"
import { OracleLibraryTest } from "../typechain";
const _addresses = require('../scripts/conf/solidroid-address.json');

describe("test oracle library test", function () {

    let network: string;
    let token0Addr: string;
    let token1Addr: string;
    let oracleTest: OracleLibraryTest;

    before(async function () {
        console.log(`network: ${chalk.blue(network = await context.netwrok())}`);
        token0Addr = _addresses[network].tokens[3].address;
        token1Addr = _addresses[network].tokens[4].address;
        const OracleLibraryTest = await ethers.getContractFactory("OracleLibraryTest");
        oracleTest = await OracleLibraryTest.deploy();
    });

    it("test getOldestObservationSecondsAgo", async function () {
        this.timeout(0);                                          //polygon usdc/weth pool
        var ret = await oracleTest.getOldestObservationSecondsAgo("0x45dda9cb7c25131df268515131f647d726f50608");
        console.log(ret);
    });

    it("test getBlockStartingTickAndLiquidity", async function () {
        this.timeout(0);
        var ret = await oracleTest.getBlockStartingTickAndLiquidity("0x45dda9cb7c25131df268515131f647d726f50608");
        console.log(ret);
    });

    it("test getQuoteAtTick", async function () {
        this.timeout(0);

        var tick = (await oracleTest.getBlockStartingTickAndLiquidity("0x45dda9cb7c25131df268515131f647d726f50608"))[0];
        console.log(tick);

        var ret = await oracleTest.getQuoteAtTick(
            tick,
            BigNumber.from("1000000000000000000"),
            token1Addr,//usdc
            token0Addr//eth
        );
        console.log(ret);
    });
});
//2660
