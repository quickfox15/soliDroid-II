import { ethers } from "hardhat";
import { BigNumber, Signer } from "ethers";
import { BotInstance } from "../typechain";
import { _deployBotInstance } from "../scripts/deploy_bot-instance";
import * as chai from 'chai';
import { MockERC20__factory } from "../typechain/factories/MockERC20__factory";
import chalk from "chalk";
import { context } from "../scripts/utils/context";
import { swapToWETH, transfer } from "../scripts/utils/tokens-utils"
const _addresses = require('../scripts/conf/solidroid-address.json');

describe("test bot loop", function () {

  let network: string;
  let signer: Signer;
  let signerAddr: string;

  let token0Addr: string;
  let token1Addr: string;

  let botInstance: BotInstance;
  let defaultAmount: BigNumber = BigNumber.from(ethers.utils.parseEther("100"));
  let stopLossPercent: BigNumber = BigNumber.from("20");

  beforeEach(async function () {

    signer = (await context.signers())[0];
    console.log(`network: ${chalk.blue(network = await context.netwrok())}`);
    console.log(`signer address: ${chalk.blue(signerAddr = await context.signerAddress())}`);
    token0Addr = _addresses[network].tokens[0].address;
    token1Addr = _addresses[network].tokens[4].address;

    const SellStrategy = await ethers.getContractFactory("SellStrategy");
    const sellStrategy = await SellStrategy.deploy();
    console.log("deployed sell strategy " + sellStrategy.address);

    botInstance = await _deployBotInstance(
      sellStrategy.address,
      _addresses[network].uniswap_v2_router,
      _addresses[network].uniswap_v2_factory,
      signerAddr,
      token0Addr,
      defaultAmount,
      stopLossPercent,
      true);
  });

  it("Should swap", async function () {
    this.timeout(0);
    await transferWETH(token0Addr, signer, token1Addr, defaultAmount, botInstance);
    await printBotBalance(signer, botInstance, token0Addr, token1Addr)

    console.log("-- buy signal  ------------------------");
    await buySignal(botInstance, token0Addr, token1Addr);
    await printBotBalance(signer, botInstance, token0Addr, token1Addr)
    console.log("---------------------------------------");

    let wakeMe = await botInstance.wakeMe();
    console.log("wake me: " + wakeMe);
    chai.expect(wakeMe).to.be.true;

    console.log(chalk.bgBlue(`========== calling bot loop =================`));
    let tx = await botInstance.botLoop({ gasLimit: 555581 });
    await tx.wait().then(tx => console.log("gas used: " + tx.gasUsed.toString()));
    await printBotBalance(signer, botInstance, token0Addr, token1Addr)
  });
});

async function buySignal(botInstance: BotInstance, token0Addr: string, token1Addr: string) {
  console.log(chalk.bgBlue("buySignal"));
  let tx = botInstance.buySignal(token0Addr, token1Addr);
  (await tx).wait().then(details => {
    console.log("gasUsed: " + details.gasUsed.toString());
  });
}

async function transferWETH(token0Addr: string, signer: Signer, token1Addr: string, defaultAmount: BigNumber, botInstance: BotInstance) {
  console.log(chalk.bgBlue("transferWETH"));
  let mockERC20_0 = await MockERC20__factory.connect(token0Addr, signer);
  let mockERC20_1 = await MockERC20__factory.connect(token1Addr, signer);

  console.log("token 0 :" + await mockERC20_0.symbol());
  console.log("token 1 :" + await mockERC20_1.symbol());

  await swapToWETH(signer, token0Addr, defaultAmount);
  await transfer(signer, token0Addr, botInstance.address, defaultAmount);

  let initialBotBalance0 = await mockERC20_0.balanceOf(botInstance.address);
  console.log("balance of 0 before swap :" + initialBotBalance0.toString());
  let initialBotBalance1 = await mockERC20_1.balanceOf(botInstance.address);
  console.log("balance of 1 before swap :" + initialBotBalance1.toString());

  chai.expect(initialBotBalance0).to.eql(defaultAmount);
  chai.expect(initialBotBalance1).to.eql(BigNumber.from(0));
}

async function printBotBalance(signer: Signer, botInstance: BotInstance, token0Addr: string, token1Addr: string) {
  console.log(chalk.bgBlue("printBotBalance"));
  let mockERC20_0 = await MockERC20__factory.connect(token0Addr, signer);
  let mockERC20_1 = await MockERC20__factory.connect(token1Addr, signer);

  let initialBotBalance0 = await mockERC20_0.balanceOf(botInstance.address);
  console.log("bot balance of 0 :" + initialBotBalance0.toString());
  let initialBotBalance1 = await mockERC20_1.balanceOf(botInstance.address);
  console.log("bot balance of 1 :" + initialBotBalance1.toString());
}
