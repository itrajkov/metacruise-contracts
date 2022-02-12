import "@nomiclabs/hardhat-ethers";
import { ethers } from "hardhat";

async function deploy() {

    const Metacruise = await ethers.getContractFactory("Metacruise");
    const metacruise = await Metacruise.deploy();
    await metacruise.deployed();

    console.log(metacruise.address);

    return metacruise;
};

deploy();
