const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    const IBTToken = await ethers.getContractFactory("IBTToken");
    const ibtToken = await IBTToken.deploy();
    await ibtToken.waitForDeployment();

    console.log("IBTToken deployed to:", await ibtToken.getAddress());
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
