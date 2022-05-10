import { ethers } from "hardhat";
import { BigNumber, utils } from "ethers";
import { V3OracleTWAP } from "../typechain";

describe("test v3 core oracle", function () {

    it("read slot 0 price", async function () {
        this.timeout(0);
        const V3OracleTWAP = await ethers.getContractFactory("V3OracleTWAP");
        const v3OracleTWAP = await V3OracleTWAP.deploy();

        var sqrtPriceX96:BigNumber = await v3OracleTWAP.getSqrtTWAP96( "0x45dda9cb7c25131df268515131f647d726f50608", 0);
        console.log("sqrtPriceX96: " + sqrtPriceX96);

        
        var price = await v3OracleTWAP.getPriceX96FromSqrtPricex96(sqrtPriceX96);
        console.log("price: " + price);
  
        // console.log(2 ** 96);
        // var price0 = 7920788756419 ** 2 ;/// 2 ** 96
        // console.log(price0)

        var a = sqrtPriceX96.mul(sqrtPriceX96);
        console.log(a.toString());
        
        var b = BigNumber.from("2").pow(BigNumber.from("96"));
        var c = a.div(b);
        console.log(c.toString());
    });
});
