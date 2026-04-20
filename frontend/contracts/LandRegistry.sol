// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

contract LandRegistry {
    address public owner;
    mapping(address => bool) public authorities;

    uint256 public landCount = 0;

    struct Land {
        uint256 id;
        string location;
        string ipfsCID;
        address payable seller;
        address buyer;
        bool isApproved;
        uint256 escrowAmount;
        bool isTransferred;
    }

    mapping(uint256 => Land) public lands;

    event LandRegistered();
    event DocumentApproved(uint256 id, address authority);
    event EscrowDeposited();
    event OwnershipTransferred(uint256 id, address oldOwner, address newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not contract owner");
        _;
    }

    modifier onlyAuthority() {
        require(authorities[msg.sender], "Unauthorized: Only Registry Officials can approve");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function addAuthority(address _authority) public onlyOwner {
        authorities[_authority] = true;
    }

    function registerLand(string memory _location, string memory _ipfsCID) public {
        landCount++;
        lands[landCount] = Land(
            landCount,
            _location,
            _ipfsCID,
            payable(msg.sender),
            address(0),
            false,
            0,
            false
        );
        emit LandRegistered();
    }

    function approveDocument(uint256 _id) public onlyAuthority {
        require(_id > 0 && _id <= landCount, "Invalid land ID");
        require(!lands[_id].isApproved, "Already approved");

        lands[_id].isApproved = true;
        emit DocumentApproved(_id, msg.sender);
    }

    function depositEscrow(uint256 _id) public payable {
        require(_id > 0 && _id <= landCount, "Invalid land ID");
        require(lands[_id].isApproved, "Document not approved yet");
        require(msg.value > 0, "Must deposit greater than 0");

        lands[_id].buyer = msg.sender;
        lands[_id].escrowAmount += msg.value;

        emit EscrowDeposited();
    }

    function transferOwnership(uint256 _id, address _newOwner) public {
        require(_id > 0 && _id <= landCount, "Invalid land ID");
        Land storage land = lands[_id];
        require(msg.sender == land.seller, "Only seller can transfer ownership");
        require(land.isApproved, "Document not approved");
        require(land.escrowAmount > 0, "No escrow deposited");
        require(!land.isTransferred, "Already transferred");

        uint256 amountToTransfer = land.escrowAmount;
        land.escrowAmount = 0;
        land.isTransferred = true;
        land.seller.transfer(amountToTransfer);

        emit OwnershipTransferred(_id, land.seller, _newOwner);
    }
}