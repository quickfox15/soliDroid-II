import { ethers } from "hardhat";
import { BigNumber, Signer } from "ethers";
import { BotInstance } from "../typechain";
import { deployBotInstance } from "../scripts/deploy_bot-instance";
import * as chai from 'chai';
import { MockERC20__factory } from "../typechain/factories/MockERC20__factory";
import chalk from "chalk";
import { context } from "../scripts/utils/context";
import { swapToWETH, transfer } from "../scripts/utils/tokens-utils"
const _addresses = require('../scripts/conf/solidroid-address.json');

describe("test buy signal", function () {

  let network: string;
  let signer: Signer;
  let signerAddr: string;

  let token0Addr: string;
  let token1Addr: string;

  let botInstance: BotInstance;
  let defaultAmount: BigNumber = BigNumber.from(ethers.utils.parseEther("100"));
  let stopLossPercent: BigNumber = BigNumber.from("200");

  beforeEach(async function () {

    signer = (await context.signers())[0];
    console.log(`network: ${chalk.blue(network = await context.netwrok())}`);
    console.log(`signer address: ${chalk.blue(signerAddr = await context.signerAddress())}`);
    token0Addr = _addresses[network].tokens[0].address;
    token1Addr = _addresses[network].tokens[4].address;

    const SignalStrategy = await ethers.getContractFactory("SignalStrategy");
    const _signalStrategy = await SignalStrategy.deploy();

    botInstance = await deployBotInstance(
      _signalStrategy.address,
      _addresses[network].uniswap_v2_router,
      _addresses[network].uniswap_v2_factory,
      signerAddr,
      token0Addr,
      defaultAmount,
      stopLossPercent,
      true);

    //print token0 balance
  });

  it("Should reverted 'BotInstance: quote asset not supported'", async function () {
    this.timeout(0);
    await chai.expect(botInstance.buySignal(token1Addr, token0Addr))
      .revertedWith("invalid pair")
  });

  it("Should revert BotInstance. insufficient balance", async function () {
    this.timeout(0);
    await chai.expect(botInstance.buySignal(token0Addr, token1Addr))
      .revertedWith("insufficient balance")
  });

  it("Should swap", async function () {
    this.timeout(0);

    let { mockERC20_0, mockERC20_1 } = await transferWETH(token0Addr, signer, token1Addr, defaultAmount, botInstance);

    let tx = botInstance.buySignal(token0Addr, token1Addr);
    (await tx).wait().then(details => {
      console.log("gasUsed: " + details.gasUsed.toString());
      console.log("cumulativeGasUsed: " + details.cumulativeGasUsed.toString());
      console.log("effectiveGasPrice: " + details.effectiveGasPrice.toString());
    });

    console.log("---------------------------------------");

    let afterSwapBotBalance = await mockERC20_0.balanceOf(botInstance.address);
    console.log("balance of 0 after swap :" + afterSwapBotBalance.toString());
    let afterSwapBotBalance1 = await mockERC20_1.balanceOf(botInstance.address);
    console.log("balance of 1 after swap :" + afterSwapBotBalance1.toString());

    chai.expect(afterSwapBotBalance).to.eql(BigNumber.from(0));
    chai.expect(afterSwapBotBalance1).to.be.gt(BigNumber.from(0));

    // //== validate position 
    let position = await botInstance.getPosition();
    console.log("\nPosition:\n" + position);

    chai.expect(position.baseAsset).to.eql(token1Addr);
    chai.expect(position.amount).to.gt(BigNumber.from("0"));
    chai.expect(position.sells).to.eql(0);
    chai.expect(position.buys).to.eql(1);
    chai.expect(position.open).to.be.true;
    chai.expect(position.blockTimestamp).to.gt(BigNumber.from("0"));
  });
});

async function transferWETH(token0Addr: string, signer: Signer, token1Addr: string, defaultAmount: BigNumber, botInstance: BotInstance) {
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
  return { mockERC20_0, mockERC20_1 };
}

