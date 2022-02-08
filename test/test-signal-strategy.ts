import { ethers } from "hardhat";
import * as chai from 'chai';
import { BigNumber } from "@ethersproject/bignumber"
import { StrategyTest } from "../typechain/StrategyTest";

describe("strategy test", function () {

  let strategyTest: StrategyTest;

  before(async function () {

    const SignalStrategy = await ethers.getContractFactory("SignalStrategy");
    const signalStrategy = await SignalStrategy.deploy();
    console.log("deployed signal strategy " + signalStrategy.address);

    const StrategyTest = await ethers.getContractFactory("StrategyTest");
    this.strategyTest = await StrategyTest.deploy(signalStrategy.address);
    console.log("deployed strategyTest " + this.strategyTest.address);
  });

  it("test strategy buy", async function () {

    let position = {
      baseAsset: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
      openReserveA: BigNumber.from(0),
      openReserveB: BigNumber.from(0),
      blockTimestamp: BigNumber.from(0),
      amount: BigNumber.from(5),
      sells: BigNumber.from(0),
      buys: BigNumber.from(0),
      open: false
    }

    chai.expect(
      await this.strategyTest.shouldBuy(
        position,
        BigNumber.from(0),
        BigNumber.from(0)
      )
    ).to.be.eql(BigNumber.from(0));

    position.blockTimestamp = BigNumber.from(1);
    chai.expect(
      await this.strategyTest.shouldBuy(
        position,
        BigNumber.from(0),
        BigNumber.from(0)
      )
    ).to.be.eql(BigNumber.from(0));
  });

  it("test strategy should sell - return 0", async function () {

    let position = {
      baseAsset: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
      openReserveA: BigNumber.from("9290456627235618069633978"),
      openReserveB: BigNumber.from("4501910616525110390140"),
      blockTimestamp: BigNumber.from(0),
      amount: BigNumber.from(1),
      sells: BigNumber.from(0),
      buys: BigNumber.from(0),
      open: false
    }

    chai.expect(
      await this.strategyTest.shouldSell(
        position,
        BigNumber.from("9290456627235618069633978"),
        BigNumber.from("4501910616525110390140"),
        BigNumber.from(50)
      )
    ).to.be.eql(BigNumber.from(0));
  });

  it("test strategy should sell - stoploss", async function () {
    let position = {
      baseAsset: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
      openReserveA: BigNumber.from("10000000000000000000000"),
      openReserveB: BigNumber.from("10000000000000000000000"),
      blockTimestamp: BigNumber.from("1639509191"),
      amount: BigNumber.from("48011649782951378"),
      sells: BigNumber.from(0),
      buys: BigNumber.from(1),
      open: true
    }
    //lost less than stoploss
    chai.expect(
      await this.strategyTest.shouldSell(
        position,
        BigNumber.from("9920000000000000000000"),
        BigNumber.from("10080000000000000000000"),
        BigNumber.from(50)
      )
    ).to.be.eql(BigNumber.from(0));
    //lost more than stoploss
    chai.expect(
      await this.strategyTest.shouldSell(
        position,
        BigNumber.from("9700000000000000000000"),
        BigNumber.from("10300000000000000000000"),
        BigNumber.from(50)
      )
    ).to.be.eql(position.amount);
  });

  it("test strategy should sell - targets", async function () {
    let position = {
      baseAsset: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
      openReserveA: BigNumber.from("10000000000000000000000"),
      openReserveB: BigNumber.from("10000000000000000000000"),
      blockTimestamp: BigNumber.from("1639509191"),
      amount: BigNumber.from("48011649782951378"),
      sells: BigNumber.from(0),
      buys: BigNumber.from(1),
      open: true
    }

    chai.expect(
      await this.strategyTest.shouldSell(
        position,
        BigNumber.from("10080000000000000000000"),
        BigNumber.from("9920000000000000000000"),
        BigNumber.from(50)
      )
    ).to.be.eql(BigNumber.from("12002912445737844"));

    position.sells = BigNumber.from(1);

    chai.expect(
      await this.strategyTest.shouldSell(
        position,
        BigNumber.from("10080000000000000000000"),
        BigNumber.from("9920000000000000000000"),
        BigNumber.from(50)
      )
    ).to.be.eql(BigNumber.from(0));

    chai.expect(
      await this.strategyTest.shouldSell(
        position,
        BigNumber.from("10300000000000000000000"),
        BigNumber.from("9880000000000000000000"),
        BigNumber.from(50)
      )
    ).to.be.eql(BigNumber.from("16003883260983792"));

    position.sells = BigNumber.from(2);

    // let amount = await this.strategyTest.shouldSell(
    //   position,
    //   BigNumber.from("10500000000000000000000"),
    //   BigNumber.from("9860000000000000000000"),
    //   BigNumber.from(50)
    // )
    // console.log(amount.toString());

    chai.expect(
      await this.strategyTest.shouldSell(
        position,
        BigNumber.from("10500000000000000000000"),
        BigNumber.from("9860000000000000000000"),
        BigNumber.from(50)
      )
    ).to.be.eql(BigNumber.from("48011649782951378"));
  });
});
