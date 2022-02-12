import "@nomiclabs/hardhat-ethers";
import { expect } from "chai";
import { ethers, waffle } from "hardhat";

const SHAREHOLDERS = [process.env.KIM, process.env.IVAN, process.env.MH1, process.env.MH2, process.env.YORDAN, process.env.KRIS];
const SHARES = [0.2, 0.2, 0.25, 0.25, 0.07, 0.03];

describe("Metacruise NFT", function() {

    describe("Deployment", function() {
        it("should deploy the contract", async function() {
            const Metacruise = await ethers.getContractFactory("Metacruise");
            const metacruise = await Metacruise.deploy();
            expect(metacruise).to.not.equal(null);
        });
        it("should fail if metadata url is not empty", async function() {
            const Metacruise = await ethers.getContractFactory("Metacruise");
            const metacruise = await Metacruise.deploy();
            const baseTokenURI = await metacruise.baseTokenURI();
            expect(baseTokenURI).to.equal('');
        });

        it("should fail if a shareholder wallet is wrong", async function() {
            const Metacruise = await ethers.getContractFactory("MetacruiseTestable");
            const metacruise = await Metacruise.deploy();

            const shareholders = [];

            for (var i = 0; i < 6; i++) {
                shareholders.push();
                expect(SHAREHOLDERS[i]).to.equal(await metacruise._shareholders(i));
            }
        });
        it("should fail if whitelist is inactive", async function() {
            const Metacruise = await ethers.getContractFactory("MetacruiseTestable");
            const metacruise = await Metacruise.deploy();
            expect(await metacruise.getIsWhitelistActive()).to.equal(true);
        });
        it("should fail if sale is active", async function() {
            const Metacruise = await ethers.getContractFactory("MetacruiseTestable");
            const metacruise = await Metacruise.deploy();
            expect(await metacruise.getIsSaleActive()).to.equal(false);
        });
        it("should fail if admins are not set", async function() {
            const Metacruise = await ethers.getContractFactory("MetacruiseTestable");
            const metacruise = await Metacruise.deploy();
            for (var i = 0; i < 2; i++) {
                const isAdmin = await metacruise.isAdmin(SHAREHOLDERS[i]);
                expect(isAdmin).to.be.equal(true, `${SHAREHOLDERS[i]} wasn't set as an admin.`);
            }
        });
        it("should fail if an admin is not whitelisted", async function() {
            const Metacruise = await ethers.getContractFactory("MetacruiseTestable");
            const metacruise = await Metacruise.deploy();
            for (var i = 0; i < 2; i++) {
                const isWhitelisted = await metacruise.isWhitelisted(SHAREHOLDERS[i]);
                expect(isWhitelisted).to.be.equal(true, `${SHAREHOLDERS[i]} was not whitelisted.`);
            }
        });
        it("should fail if tokenIndex is not 0", async function() {
            const Metacruise = await ethers.getContractFactory("MetacruiseTestable");
            const metacruise = await Metacruise.deploy();
            expect(await metacruise.tokenIndex()).to.be.equal(0);
        });
    });

    describe("Functionality", function() {
        it("should fail when sale isn't active", async function() {
            const Metacruise = await ethers.getContractFactory("Metacruise");
            const metacruise = await Metacruise.deploy();
            let e: Error;
            try {
                await metacruise.acquire(SHAREHOLDERS[0], 1, {
                    gasLimit: 500_000,
                    value: ethers.utils.parseEther('0.05'), // 0.05eth,
                })
            } catch (err) {
                e = err;
            }
            expect(e.message.includes("sale is not active")).to.equal(true);
        });
        it("should fail when the recipient is not whitelisted", async function() {
            const Metacruise = await ethers.getContractFactory("MetacruiseTestable");
            const metacruise = await Metacruise.deploy();
            await metacruise.startSale();
            let e: Error;
            try {
                await metacruise.acquire(SHAREHOLDERS[2], 1, {
                    gasLimit: 500_000,
                    value: ethers.utils.parseEther('0.05'), // 0.05eth,
                })
            } catch (err) {
                e = err;
            }
            expect(e.message.includes("you are not on the whitelist")).to.equal(true);
        });
        it("should fail for insufficient eth when whitelist is on", async function() {
            const Metacruise = await ethers.getContractFactory("MetacruiseTestable");
            const metacruise = await Metacruise.deploy();
            await metacruise.startSale();
            let e: Error;
            try {
                await metacruise.acquire(SHAREHOLDERS[0], 1, {
                    gasLimit: 500_000,
                    value: ethers.utils.parseEther('0.034'),
                })
            } catch (err) {
                e = err;
            }
            expect(e.message.includes("exact value in ETH needed")).to.equal(true);
        });
        it("should fail for insufficient eth when whitelist is off", async function() {
            const Metacruise = await ethers.getContractFactory("MetacruiseTestable");
            const metacruise = await Metacruise.deploy();
            await metacruise.startSale();
            await metacruise.stopWhitelist();
            let e: Error;
            try {
                await metacruise.acquire(SHAREHOLDERS[0], 1, {
                    gasLimit: 500_000,
                    value: ethers.utils.parseEther('0.035'),
                })
            } catch (err) {
                e = err;
            }
            expect(e.message.includes("exact value in ETH needed")).to.equal(true);
        });
        it("should pass if whitelist minting works", async function() {
            const Metacruise = await ethers.getContractFactory("MetacruiseTestable");
            const metacruise = await Metacruise.deploy();
            await metacruise.startSale();
            await metacruise.acquire(SHAREHOLDERS[0], 1, {
                gasLimit: 500_000,
                value: ethers.utils.parseEther('0.035')
            });
            const bal = await metacruise.balanceOf(SHAREHOLDERS[0]);
            expect(bal).to.equal(1);
        });
        it("should pass if non-whitelist minting works", async function() {
            const Metacruise = await ethers.getContractFactory("MetacruiseTestable");
            const metacruise = await Metacruise.deploy();
            await metacruise.startSale();
            await metacruise.stopWhitelist();
            await metacruise.acquire(SHAREHOLDERS[3], 1, {
                gasLimit: 500_000,
                value: ethers.utils.parseEther('0.06')
            });
            const bal = await metacruise.balanceOf(SHAREHOLDERS[3]);
            expect(bal).to.equal(1);
        });
        it("should pass if non-whitelist minting works", async function() {
            const Metacruise = await ethers.getContractFactory("MetacruiseTestable");
            const metacruise = await Metacruise.deploy();
            await metacruise.startSale();
            await metacruise.stopWhitelist();
            await metacruise.acquire(SHAREHOLDERS[3], 1, {
                gasLimit: 500_000,
                value: ethers.utils.parseEther('0.06')
            });
            const bal = await metacruise.balanceOf(SHAREHOLDERS[3]);
            expect(bal).to.equal(1);
        });
        it("should pass if recipient has first 3 tokens in his wallet", async function() {
            const Metacruise = await ethers.getContractFactory("MetacruiseTestable");
            const metacruise = await Metacruise.deploy();
            await metacruise.startSale();
            await metacruise.stopWhitelist();
            await metacruise.acquire(SHAREHOLDERS[3], 3, {
                gasLimit: 500_000 * 3,
                value: ethers.utils.parseEther('0.18')
            });
            const tokens = await metacruise.getCarsOfOwner(SHAREHOLDERS[3]);
            for (let i = 0; i < 3; i++) {
                expect(tokens[i]).to.equal(i + 1);
            }
        });
        it("should pass if getCarPrice() works properly", async function() {
            const Metacruise = await ethers.getContractFactory("MetacruiseTestable");
            const metacruise = await Metacruise.deploy();
            expect(await metacruise.getCarPrice()).to.equal("35000000000000000");
            await metacruise.stopWhitelist();
            expect(await metacruise.getCarPrice()).to.equal("60000000000000000");
        });
        it("should pass if whitlisting an address works properly", async function() {
            const Metacruise = await ethers.getContractFactory("MetacruiseTestable");
            const metacruise = await Metacruise.deploy();
            expect(await metacruise.isWhitelisted(SHAREHOLDERS[2])).to.equal(false);
            await metacruise.whitelistAddress(SHAREHOLDERS[2]);
            expect(await metacruise.isWhitelisted(SHAREHOLDERS[2])).to.equal(true);
            await metacruise.unWhitelistAddress(SHAREHOLDERS[2]);
            expect(await metacruise.isWhitelisted(SHAREHOLDERS[2])).to.equal(false);
        });
        it("should pass if withdraw splits payments correctly", async function() {
            const Metacruise = await ethers.getContractFactory("MetacruiseTestable");
            const metacruise = await Metacruise.deploy();
            expect(await metacruise.baseTokenURI()).to.equal("");
            await metacruise.setBaseTokenURI("metahub.studio");
            expect(await metacruise.baseTokenURI()).to.equal("metahub.studio");
        });
        it("should pass if contract balance was split amongst shareholders correctly", async function() {
            const Metacruise = await ethers.getContractFactory("MetacruiseTestable");
            const metacruise = await Metacruise.deploy();

            // Start sale and stop whitelist
            await metacruise.startSale();
            await metacruise.stopWhitelist();

            // Mint 150 tokens
            for (let i = 0; i < 100; i++) {
                await metacruise.acquire(SHAREHOLDERS[3], 5, {
                    gasLimit: 500_000 * 5,
                    value: ethers.utils.parseEther('0.30')
                });
            }

            // Get contract balance
            const provider = waffle.provider;
            var contractBalance = await provider.getBalance(metacruise.address);

            // Call withdraw earnings
            await metacruise.withdrawEarnings(contractBalance);

            // Test for all the addresses
            for (let i = 0; i < SHAREHOLDERS.length; i++) {
                const errMargin = 0.1;
                const balance = parseFloat(ethers.utils.formatEther(await provider.getBalance(SHAREHOLDERS[i])));
                expect(Math.abs(balance - parseFloat(ethers.utils.formatEther(contractBalance)) * SHARES[i])).to.be.lessThan(errMargin);
            }
        });
    });
});
