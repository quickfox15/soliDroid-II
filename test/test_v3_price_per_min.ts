import { ethers } from "hardhat";
import { BigNumber, Signer } from "ethers";
import chalk from "chalk";
import { context } from "../scripts/utils/context";
import { ObservationsTest, OracleLibraryTest } from "../typechain";
const _addresses = require('../scripts/conf/solidroid-address.json');
import { PoolHelper__factory } from "../typechain";

const poolAddress = "0x45dda9cb7c25131df268515131f647d726f50608";

describe("test oracle library test", function () {

    let network: string;
    let token0Addr: string;
    let token1Addr: string;
    let oracleTest: OracleLibraryTest;
    var observationsTest: ObservationsTest;

    before(async function () {
        console.log(`network: ${chalk.blue(network = await context.netwrok())}`);
        token0Addr = _addresses[network].tokens[3].address;
        token1Addr = _addresses[network].tokens[4].address;
        const OracleLibraryTest = await ethers.getContractFactory("OracleLibraryTest");
        oracleTest = await OracleLibraryTest.deploy();

        const ObservationsTest = await ethers.getContractFactory("ObservationsTest");
        observationsTest = await ObservationsTest.deploy();

    });

    it("test observationsTest", async function () {
        this.timeout(0);                                          //polygon usdc/weth pool
        var ret = await oracleTest.getOldestObservationSecondsAgo(poolAddress);

        console.log(`seconds ago: ${ret.secondsAgo}`);
        var minutsAgo = Math.floor(ret.secondsAgo/60);
        console.log(`minuts ago: ${minutsAgo}`);

        console.log(new Date(ret.currentTimestamp*1000));
        var oldestTime = ret.currentTimestamp-ret.secondsAgo;

        console.log(new Date((oldestTime)*1000));
        // var _60K = 1000 * 60 ;
        // var rounded = new Date(Math.ceil(1000*oldestTime / _60K) * _60K);

        var rounded = Math.ceil(oldestTime / 60) * 60
        console.log("round: ");
        console.log(new Date((rounded)*1000));

        var roundedCurrent = Math.floor(ret.currentTimestamp / 60) * 60
        console.log("round currenct: ");
        console.log(new Date((roundedCurrent)*1000));

        for (let index = 1; index < minutsAgo; index++) {
            var tick = await observationsTest.getTickAtMin(poolAddress,index,0);
            // console.log(tick);

            var price = await oracleTest.getQuoteAtTick(
                tick,
                BigNumber.from("1000000000000000000"),
                token1Addr,//usdc
                token0Addr//eth
            );
            var observationTime = roundedCurrent-((index-1)*60);
            var _price = ethers.utils.formatUnits(price, 6).toString();

            console.log(`${index})\t tick: ${tick}, price: ${Number.parseFloat(_price).toFixed(2)}, time: ${new Date(observationTime*1000).toLocaleTimeString()}`);
        }
    });

    it("test find oldest observation", async function () {
        this.timeout(0);                                          //polygon usdc/weth pool
        var ret = await oracleTest.getOldestObservationSecondsAgo(poolAddress);
        console.log(new Date(ret.currentTimestamp*1000));
        var oldestTime = ret.currentTimestamp-ret.secondsAgo;
        console.log(new Date((oldestTime)*1000));
        var _60K = 1000 * 60 ;
        var rounded = new Date(Math.ceil(1000*oldestTime / _60K) * _60K);
        console.log("round: ");
        console.log(rounded);

        var poolHelper = await PoolHelper__factory.connect(poolAddress,ethers.provider.getSigner());

        var oldest = new Date().getTime();
        for (let index = 0; index < 65535; index++) {
            // console.log(index);
            var observation = await poolHelper.observations(index);
            if(observation.initialized==false){
                break;
            }
            console.log(new Date(1000*observation.blockTimestamp).toLocaleTimeString());
            
            oldest = oldest < observation.blockTimestamp ? oldest : observation.blockTimestamp;
        }
        console.log("oldest: ");
        console.log(new Date(1000*oldest));

        var _60K = 1000 * 60 ;
        var rounded = new Date(Math.ceil(1000*oldest / _60K) * _60K);
        console.log("round: ");
        console.log(rounded);
    });
});
