const hre = require("hardhat");

async function main() {
    console.log("🚀 Deploying Automation Registry...");

    const AutomationRegistry = await hre.ethers.getContractFactory("AutomationRegistry");
    const registry = await AutomationRegistry.deploy();
    await registry.waitForDeployment();

    const registryAddress = await registry.getAddress();
    console.log(`✅ AutomationRegistry deployed to: ${registryAddress}`);

    console.log("🚀 Deploying Smart Executor...");
    const SmartExecutor = await hre.ethers.getContractFactory("SmartExecutor");
    const executor = await SmartExecutor.deploy(registryAddress);
    await executor.waitForDeployment();

    const executorAddress = await executor.getAddress();
    console.log(`✅ SmartExecutor deployed to: ${executorAddress}`);

    let deployer;
    try {
        [deployer] = await hre.ethers.getSigners();
        console.log(`🔑 Authorized Executor: ${deployer.address}`);
    } catch (e) {
        console.log("⚠️ Could not list signers");
    }

    const fs = require("fs");
    const addresses = {
        AutomationRegistry: registryAddress,
        SmartExecutor: executorAddress,
        Deployer: deployer ? deployer.address : "Unknown"
    };

    console.log("💾 Saving addresses to deployed_addresses.json");
    fs.writeFileSync("deployed_addresses.json", JSON.stringify(addresses, null, 2));
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
