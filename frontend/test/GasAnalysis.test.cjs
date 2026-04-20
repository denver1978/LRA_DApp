const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Gas Consumption and Execution Cost Analysis", function () {
  let landRegistry;
  let owner, authority, buyer, seller;

  before(async function () {
    [owner, authority, buyer, seller] = await ethers.getSigners();
    const LandRegistry = await ethers.getContractFactory("LandRegistry");
    landRegistry = await LandRegistry.deploy();
    await landRegistry.addAuthority(authority.address);
  });

  it("Should calculate and print the Gas Analysis Table", async function () {
    const gasReport = [];
   
    // Assumed average gas price on Ethereum mainnet (e.g., 20 Gwei)
    // 20 Gwei = 0.00000002 ETH
    const gasPriceETH = 0.00000002;

    // 1. Measure: Register New Land Title
    const tx1 = await landRegistry.connect(seller).registerLand("Baguio City", "QmXyZ...");
    const receipt1 = await tx1.wait();
    const gas1 = Number(receipt1.gasUsed);
   
    gasReport.push({
      "System Function": "Register New Land Title",
      "Gas Used": gas1.toLocaleString(),
      "Estimated Cost (ETH)": (gas1 * gasPriceETH).toFixed(5)
    });

    // 2. Measure: Validate/Approve Document
    const tx2 = await landRegistry.connect(authority).approveDocument(1);
    const receipt2 = await tx2.wait();
    const gas2 = Number(receipt2.gasUsed);

    gasReport.push({
      "System Function": "Validate/Approve Document",
      "Gas Used": gas2.toLocaleString(),
      "Estimated Cost (ETH)": (gas2 * gasPriceETH).toFixed(5)
    });

    // 3. Measure: Escrow Fund Deposit
    const depositAmount = "1000000000000000000"; // 1 ETH
    const tx3 = await landRegistry.connect(buyer).depositEscrow(1, { value: depositAmount });
    const receipt3 = await tx3.wait();
    const gas3 = Number(receipt3.gasUsed);

    gasReport.push({
      "System Function": "Escrow Fund Deposit",
      "Gas Used": gas3.toLocaleString(),
      "Estimated Cost (ETH)": (gas3 * gasPriceETH).toFixed(5)
    });

    // 4. Measure: Transfer Ownership
    const tx4 = await landRegistry.connect(seller).transferOwnership(1, buyer.address);
    const receipt4 = await tx4.wait();
    const gas4 = Number(receipt4.gasUsed);

    gasReport.push({
      "System Function": "Transfer Ownership",
      "Gas Used": gas4.toLocaleString(),
      "Estimated Cost (ETH)": (gas4 * gasPriceETH).toFixed(5)
    });

    // Print a beautiful table to the console for the screenshot!
    console.log("\n=========================================================================");
    console.log("               TABLE 3.Y: SMART CONTRACT GAS ANALYSIS                    ");
    console.log("=========================================================================");
    console.table(gasReport);
    console.log("=========================================================================\n");

    // A simple assertion to ensure the test technically "passes"
    expect(gasReport.length).to.equal(4);
  });
});
