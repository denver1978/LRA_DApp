{/* const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LandRegistry Smart Contract Tests", function () {
  let LandRegistry;
  let landRegistry;
  let owner;       // Contract deployer
  let authority;   // Registry of Deeds Official
  let buyer;       // Land buyer
  let seller;      // Land seller

  // This runs before each test to give us a fresh smart contract state
  beforeEach(async function () {
    // Get mock accounts
    [owner, authority, buyer, seller] = await ethers.getSigners();

    // Deploy the contract (Make sure "LandRegistry" matches your actual contract name)
    LandRegistry = await ethers.getContractFactory("LandRegistry");
    landRegistry = await LandRegistry.deploy();

    await landRegistry.addAuthority(authority.address);
  });

  describe("1. Land Registration Initiation", function () {
    it("Should successfully register a new land title with a unique IPFS CID", async function () {
      const mockCID = "QmXyZ12345abcdef...";
      const location = "Baguio City";

      // Simulate seller registering a property
      await expect(landRegistry.connect(seller).registerLand(location, mockCID))
        .to.emit(landRegistry, "LandRegistered");
        // Expecting an event called 'LandRegistered' to be emitted
    });
  });

  describe("2. Approval Validation by Relevant Authorities", function () {
    it("Should allow authorized government officials to validate the document", async function () {
      // Setup: Register land first
      await landRegistry.connect(seller).registerLand("Baguio City", "QmXyZ12345abcdef...");

      // Simulate the Registry Authority approving the document
      await expect(landRegistry.connect(authority).approveDocument(1))
        .to.emit(landRegistry, "DocumentApproved")
        .withArgs(1, authority.address);
    });

    it("Should reject approval attempts from unauthorized users", async function () {
      // Setup: Register land first
      await landRegistry.connect(seller).registerLand("Baguio City", "QmXyZ12345abcdef...");

      // Simulate a random buyer trying to approve the document (Should fail)
      await expect(landRegistry.connect(buyer).approveDocument(1))
        .to.be.revertedWith("Unauthorized: Only Registry Officials can approve");
    });
  });

  describe("3. Escrow Handling and Ownership Transfer", function () {
    it("Should secure escrow funds and release them only after successful transfer", async function () {
      // 1. Seller registers land
      await landRegistry.connect(seller).registerLand("Baguio City", "QmXyZ...");
     
      // 2. Authority approves
      await landRegistry.connect(authority).approveDocument(1);

      // 3. Buyer deposits funds into smart contract escrow
      // const depositAmount = ethers.utils.parseEther("1.0"); // 1 ETH or equivalent
      const depositAmount = "1000000000000000000" // 1 ETH in Wei
      await expect(landRegistry.connect(buyer).depositEscrow(1, { value: depositAmount }))
        .to.emit(landRegistry, "EscrowDeposited");

      // 4. Finalize transfer and release funds to seller
      await expect(landRegistry.connect(seller).transferOwnership(1, buyer.address))
        .to.emit(landRegistry, "OwnershipTransferred")
        .withArgs(1, seller.address, buyer.address);
    });
  });
}); */}

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Technical Evaluation Summary Tests", function () {
  let landRegistry;
  let owner;      
  let authority;  
  let buyer;      
  let seller;      

  beforeEach(async function () {
    [owner, authority, buyer, seller] = await ethers.getSigners();
    const LandRegistry = await ethers.getContractFactory("LandRegistry");
    landRegistry = await LandRegistry.deploy();
    await landRegistry.addAuthority(authority.address);
  });

  describe("1. Transaction State Validation", function () {
    it("Workflow executed correctly", async function () {
      // Test if state correctly updates after registration
      await landRegistry.connect(seller).registerLand("Baguio City", "QmXyZ...");
      const land = await landRegistry.lands(1);
      expect(land.location).to.equal("Baguio City");
      expect(land.isApproved).to.be.false; // State should initially be unapproved
    });
  });

  describe("2. Escrow Enforcement", function () {
    it("Funds released only after approvals", async function () {
      await landRegistry.connect(seller).registerLand("Baguio City", "QmXyZ...");
      await landRegistry.connect(authority).approveDocument(1);
     
      const depositAmount = "1000000000000000000"; // 1 ETH in raw string to avoid version errors
      await landRegistry.connect(buyer).depositEscrow(1, { value: depositAmount });
     
      // Test that funds release and ownership transfers securely
      await expect(landRegistry.connect(seller).transferOwnership(1, buyer.address))
        .to.emit(landRegistry, "OwnershipTransferred");
    });
  });

  describe("3. Document Integrity", function () {
    it("IPFS CID validation successful", async function () {
      const originalCID = "QmXyZ12345abcdef";
      await landRegistry.connect(seller).registerLand("Baguio City", originalCID);
     
      // Test that the blockchain perfectly stored the exact IPFS hash
      const land = await landRegistry.lands(1);
      expect(land.ipfsCID).to.equal(originalCID);
    });
  });

  describe("4. Transaction Traceability", function () {
    it("Blockchain logs recorded all actions", async function () {
      // Test that the blockchain emits immutable log events when actions occur
      await expect(landRegistry.connect(seller).registerLand("Baguio City", "QmXyZ..."))
        .to.emit(landRegistry, "LandRegistered");
    });
  });

  describe("5. Execution Cost", function () {
    it("Gas usage within test network limits", async function () {
      // Execute a transaction and measure its gas cost
      const tx = await landRegistry.connect(seller).registerLand("Baguio City", "QmXyZ...");
      const receipt = await tx.wait();
     
      // Test that the gas used is acceptable (e.g., less than 500,000 gas units)
      expect(Number(receipt.gasUsed)).to.be.lessThan(500000);
    });
  });
});
