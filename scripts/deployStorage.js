const hre = require("hardhat");

async function main() {
    const EscrowStorage = await hre.ethers.getContractFactory("EscrowStorage");
    const escrowStorage = await EscrowStorage.deploy();

    await escrowStorage.deployed();
    console.log("EscrowStorage: ", escrowStorage);
    console.log(`EscrowStorage deployed to ${escrowStorage.address}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
})