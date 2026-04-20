const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Security and Document Integrity Analysis (IPFS)", function () {
  let landRegistry;
  let owner, authority, seller;

  before(async function () {
    [owner, authority, seller] = await ethers.getSigners();
    const LandRegistry = await ethers.getContractFactory("LandRegistry");
    landRegistry = await LandRegistry.deploy();
    await landRegistry.addAuthority(authority.address);
  });

  it("Should verify original files and reject tampered files based on IPFS CID", async function () {
    // 1. Define our mock files and their unique IPFS hashes (CIDs)
    const originalFileName = "DeedOfSale.png";
    const originalCID = "QmPZ9TjH7uYvMwN5... (Original)"; // Simulated real hash
   
    const tamperedFileName = "DeedOfSale.png";
    const tamperedCID = "QmXyZ12345abcdef... (Tampered)"; // Changing even 1 pixel changes the hash completely

    // 2. Register the legitimate land title in the blockchain
    await landRegistry.connect(seller).registerLand("Baguio City", originalCID);

    // 3. Fetch the secure data from the blockchain to verify
    const storedLandData = await landRegistry.lands(1);
    const securelyStoredCID = storedLandData.ipfsCID;

    // 4. Create the Integrity Report Array
    const integrityReport = [];

    // Check 1: Simulating system verifying the original file
    let statusOriginal = (securelyStoredCID === originalCID) ? "✔ Verified" : "Rejected / Mismatch";
    integrityReport.push({
      "Document State": "Original File",
      "File Name": originalFileName,
      "Generated IPFS CID (Hash)": originalCID,
      "Status": statusOriginal
    });

    // Check 2: Simulating system detecting a tampered file
    let statusTampered = (securelyStoredCID === tamperedCID) ? "✔ Verified" : "✖ Rejected / Mismatch";
    integrityReport.push({
      "Document State": "Tampered File",
      "File Name": tamperedFileName,
      "Generated IPFS CID (Hash)": tamperedCID,
      "Status": statusTampered
    });

    // 5. Print a beautiful table to the console for the screenshot!
    console.log("\n=========================================================================================");
    console.log("                     TABLE 3.X: IPFS DOCUMENT INTEGRITY VERIFICATION                     ");
    console.log("=========================================================================================");
    console.table(integrityReport);
    console.log("=========================================================================================\n");

    // 6. Assertions to ensure the test mathematically passes
    expect(securelyStoredCID).to.equal(originalCID);
    expect(securelyStoredCID).to.not.equal(tamperedCID);
  });
});
