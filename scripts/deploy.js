const { task } = require("hardhat/config");
const { getAccount } = require("./helpers");

task("check-balance", "Prints out the balance of your account").setAction(async function(taskArguments, hre) {
    const account = getAccount();
    console.log(`Account balance for ${account.address}: ${await account.getBalance()}`);
});

task("deploy", "Deploys the Metacruise.sol contract").setAction(async function(taskArguments, hre) {
    const Metacruise = await hre.ethers.getContractFactory("Metacruise", getAccount());
    const metacruise = await Metacruise.deploy();
    console.log(`Contract deployed to address: ${metacruise.address}`);
});
