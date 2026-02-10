const hre = require("hardhat");
const addresses = require("../deployed_addresses.json");

async function main() {
    const [user] = await hre.ethers.getSigners();
    console.log(`👤 User: ${user.address}`);

    const registryAddress = addresses.AutomationRegistry;
    console.log(`📝 Registry: ${registryAddress}`);

    const Registry = await hre.ethers.getContractFactory("AutomationRegistry");
    const registry = Registry.attach(registryAddress);

    // Dummy Rule Data
    const triggerContract = "0x0000000000000000000000000000000000000000"; // Dummy watcher
    const conditionData = "0x1234";
    const actionContract = user.address;
    const actionData = "0x5678";

    console.log("🚀 Registering Rule...");
    const tx = await registry.registerRule(
        triggerContract,
        conditionData,
        actionContract,
        actionData
    );

    console.log(`⏳ Pending: ${tx.hash}`);
    await tx.wait();
    console.log("✅ Rule Registered!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
