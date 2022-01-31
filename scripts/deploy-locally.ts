import "@nomiclabs/hardhat-ethers";
import {ethers} from "hardhat";

async function deploy() {

    const Metacar = await ethers.getContractFactory("Metacar");
    const metacar = await Metacar.deploy();
    await metacar.deployed();

    console.log(metacar.address);

    return metacar;
};

// @ts-ignore
async function mint(metacar){
    console.log("DONE");
}

deploy().then(mint);
