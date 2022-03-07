import { BigNumber, utils } from "ethers";
import { context } from "../scripts/utils/context";
import chalk from "chalk";
import * as chai from 'chai';
import { ethers } from "hardhat";
import { BotInstance__factory, SignalStrategy } from "../typechain";
import { deployManager } from "../scripts/deploy_manager";

const _addresses = require('../scripts/conf/solidroid-address.json');

describe("test deploy bot with manager", function () {

    let network: string;
    let signerAddr: string;
    let quoteAsset: string;
    let defaultAmount: BigNumber;
    let stopLossPercent: BigNumber;
    let signalStrategy: SignalStrategy;

    before(async function () {

        network = await context.netwrok()
        console.log(`network: ${chalk.blue(network)}`);

        signerAddr = await context.signerAddress()
        console.log(`signer address: ${chalk.blue(signerAddr)}`);

        console.log(_addresses[network]);

        quoteAsset = _addresses[network].tokens[0].address;
        defaultAmount = utils.parseEther(_addresses[network].bot_config.amount);
        stopLossPercent = BigNumber.from(_addresses[network].bot_config.percent);

        const SignalStrategy = await ethers.getContractFactory("SignalStrategy");
        signalStrategy = await SignalStrategy.deploy();
        console.log("deployed signal strategy " + signalStrategy.address);
    });

    it("Should initialize bot ctor", async function () {
        this.timeout(0)

        let manager = await deployManager(
            _addresses[network].uniswap_v2_router,
            _addresses[network].uniswap_v2_factory);

        console.log(`manager address: ${chalk.blue(manager.address)}`);

        let tx = await manager.createBot(
            quoteAsset,
            signalStrategy.address,
            defaultAmount,
            stopLossPercent,
            true);

        await tx.wait().then(tx => console.log("gas used:          " + tx.gasUsed.toString()));

        let botAddress = await manager.getBot();
        console.log(`bot address: ${chalk.blue(botAddress)}`);

        let signer = (await context.signers())[0];
        let botInstance = await BotInstance__factory.connect(botAddress, signer);
        let config = await botInstance.getConfig();
        console.log(config);
        chai.expect(config.defaultAmount).to.eql(defaultAmount);
        chai.expect(config.defaultAmountOnly).to.be.false;
        chai.expect(config.loop).to.be.true;
        chai.expect(config.quoteAsset).to.eql(quoteAsset);
        chai.expect(config.stopLossPercent).to.eql(stopLossPercent);
    });

    it("Should get error - amount 0", async function () {

        let manager = await deployManager(
            _addresses[network].uniswap_v2_router,
            _addresses[network].uniswap_v2_factory);

        await chai.expect(
            manager.createBot(
                quoteAsset,
                signalStrategy.address,
                BigNumber.from(0),
                stopLossPercent,
                true)

        ).to.be.revertedWith('invalid amount');
    });

    it("Should get error - BotInstance: stoploss must be between 0 and 10000", async function () {

        let manager = await deployManager(
            _addresses[network].uniswap_v2_router,
            _addresses[network].uniswap_v2_factory);

        await chai.expect(
            manager.createBot(
                quoteAsset,
                signalStrategy.address,
                defaultAmount,
                BigNumber.from(0),
                true)
        ).to.be.revertedWith('invalid stoploss');

        await chai.expect(
            manager.createBot(
                quoteAsset,
                signalStrategy.address,
                defaultAmount,
                BigNumber.from(10000),
                true)
        ).to.be.revertedWith('invalid stoploss');

    });
});