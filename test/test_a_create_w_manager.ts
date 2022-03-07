import { context } from "../scripts/utils/context";
import chalk from "chalk";
import { deployManager } from "../scripts/deploy_manager";

const _addresses = require('../scripts/conf/solidroid-address.json');

describe("test deploy manager", function () {

    let network: string;
    let signerAddr: string;

    before(async function () {

        network = await context.netwrok()
        console.log(`network: ${chalk.blue(network)}`);

        signerAddr = await context.signerAddress()
        console.log(`signer address: ${chalk.blue(signerAddr)}`);
        console.log("use network " + network);
    });

    it("Should initialize manager ctor", async function () {
        this.timeout(0);
        let manager = await deployManager(
            _addresses[network].uniswap_v2_router,
            _addresses[network].uniswap_v2_factory);

        console.log(`manager address: ${chalk.blue(manager.address)}`);
    });
});