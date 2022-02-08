import { BigNumber, utils } from "ethers";
import { context } from "../scripts/utils/context";
import chalk from "chalk";
import * as chai from 'chai';
import { deployBotInstance } from "../scripts/deploy_bot-instance";
import { ethers } from "hardhat";
import { SignalStrategy } from "../typechain";

const _addresses = require('../scripts/conf/solidroid-address.json');

describe("test deploy bot", function () {

    let network: string;
    let signerAddr: string;

    let quoteAsset: string;
    let defaultAmount: BigNumber;
    let stopLossPercent: BigNumber;
    let loop: boolean = true;
    let signalStrategy: SignalStrategy;

    before(async function () {

        // context.setNetwork("localhost"/*envNetwork*/);
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
        this.timeout(0);

        let botInstance = await deployBotInstance(
            signalStrategy.address,
            _addresses[network].uniswap_v2_router,
            _addresses[network].uniswap_v2_factory,
            signerAddr,
            quoteAsset,
            defaultAmount,
            stopLossPercent,
            true);

        console.log(`bot address: ${chalk.blue(botInstance.address)}`);
        let config = await botInstance.getConfig();
        console.log(config)
        chai.expect(config.defaultAmount).to.eql(defaultAmount);
        chai.expect(config.defaultAmountOnly).to.be.false;
        chai.expect(config.loop).to.be.true;
        chai.expect(config.quoteAsset).to.eql(quoteAsset);
        chai.expect(config.stopLossPercent).to.eql(stopLossPercent);
    });

    it("Should get error - amount 0", async function () {
        await chai.expect(deployBotInstance(
            signalStrategy.address,
            _addresses[network].uniswap_v2_router,
            _addresses[network].uniswap_v2_factory,
            signerAddr,
            quoteAsset,
            BigNumber.from(0),
            stopLossPercent,
            loop))
            .to.be.revertedWith('invalid amount');
    });

    it("Should get error - BotInstance: stoploss must be between 0 and 10000", async function () {
        await chai.expect(deployBotInstance(
            signalStrategy.address,
            _addresses[network].uniswap_v2_router,
            _addresses[network].uniswap_v2_factory,
            signerAddr,
            quoteAsset,
            defaultAmount,
            BigNumber.from(0),
            loop))
            .to.be.revertedWith('invalid stoploss');

        await chai.expect(deployBotInstance(
            signalStrategy.address,
            _addresses[network].uniswap_v2_router,
            _addresses[network].uniswap_v2_factory,
            signerAddr,
            quoteAsset,
            defaultAmount,
            BigNumber.from(10000),
            loop))
            .to.be.revertedWith('invalid stoploss');

    });
});