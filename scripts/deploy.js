const { task } = require("hardhat/config");
const { getAccount } = require("./helpers");

task("check-balance", "Prints out the balance of your account").setAction(async function (taskArguments, hre) {
    const account = getAccount();
    console.log(`Account balance for ${account.address}: ${await account.getBalance()}`);
});

task("deploy", "Deploys the Car.sol contract").setAction(async function (taskArguments, hre) {
    const Metacar = await hre.ethers.getContractFactory("Metacar", getAccount());
    const metacar = await Metacar.deploy();
    console.log(`Contract deployed to address: ${metacar.address}`);
});
