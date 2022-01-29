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

    console.log(await metacar.balanceOf(process.env.PUBLIC_ADDRESS));
}

deploy().then(mint);
