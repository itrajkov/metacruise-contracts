const { task } = require("hardhat/config");
const { getContract } = require("./helpers");

task("set-base-token-uri", "Sets the base token URI for the deployed smart contract")
    .addParam("baseUrl", "The base of the tokenURI endpoint to set")
    .setAction(async function(taskArguments, hre) {
        const contract = await getContract("Metacruise", hre);
        const transactionResponse = await contract.setBaseTokenURI(taskArguments.baseUrl, {
            gasLimit: 500_000,
        });
        console.log(`Transaction Hash: ${transactionResponse.hash}`);
    });
