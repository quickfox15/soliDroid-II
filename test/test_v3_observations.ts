import { ethers } from "hardhat";
// import { BigNumber, Signer } from "ethers";
// import { MockERC20__factory } from "../typechain/factories/MockERC20__factory";
import chalk from "chalk";
import { context } from "../scripts/utils/context";
// import { printBalance, swapToWETH, transfer } from "../scripts/utils/tokens-utils"
import { PoolHelper__factory } from "../typechain";
// const _addresses = require('../scripts/conf/solidroid-address.json');

const poolAddress = "0x45dda9cb7c25131df268515131f647d726f50608";

describe("test observationspool helper", function () {

    let network: string;

    beforeEach(async function () {
        network = await context.netwrok()
        console.log(`network: ${chalk.blue(network)}`);
    });

    it("test all observations", async function () {
        this.timeout(0);
        var poolHelper = await PoolHelper__factory.connect(poolAddress,ethers.provider.getSigner());
        var slot0 = await poolHelper.slot0();
        console.log(slot0);
        
        for (let index = 0; index < 65535; index++) {
            // console.log(index);
            var observation = await poolHelper.observations(index);
            if(observation.initialized==false){
                break;
            }
            // console.log(observation.tickCumulative);
            let date: Date = new Date(1000*observation.blockTimestamp);  
            // console.log("Date = " + date); //Date = Tue Nov 05 1985 06:23:20 GMT+0530 (IST)  
            var price = 0;
            if(index > 0){
                var prevObservation = await poolHelper.observations(index-1);
                var delta = observation.tickCumulative.sub(prevObservation.tickCumulative) ;
                console.log(delta.toString());
            }
            console.log(`${index}) ${date.toLocaleString()} : ${observation.tickCumulative}`);
        }
    });
});
