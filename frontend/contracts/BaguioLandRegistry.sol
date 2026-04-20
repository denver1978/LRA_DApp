// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

/**
 * Baguio City Land Registration and Transfer (Proof of Concept)
 *
 * Features:
 * - Land registry
 * - Buy-and-sell workflow
 * - Escrow protection
https://remix.ethereum.org/# * - Sequential approvals:
 *      Survey -> BIR -> City Treasury -> Assessor -> RD final approval
 * - IPFS metadata CID storage
 * - Role-based permissions
 * - Deceased owner / succession handling
 * - Reentrancy protection
 */

contract BaguioLandRegistry {
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    // Government roles
    address public surveyor;
    address public bir;
    address public cityTreasury;
    address public assessor;
    address public rd;

    modifier onlySurveyor() {
        require(msg.sender == surveyor, "not surveyor");
        _;
    }

    modifier onlyBIR() {
        require(msg.sender == bir, "not bir");
        _;
    }

    modifier onlyCityTreasury() {
        require(msg.sender == cityTreasury, "not city treasury");
        _;
    }

    modifier onlyAssessor() {
        require(msg.sender == assessor, "not assessor");
        _;
    }

    modifier onlyRD() {
        require(msg.sender == rd, "not rd");
        _;
    }

    event AuthoritiesSet(
        address surveyor,
        address bir,
        address cityTreasury,
        address assessor,
        address rd
    );

    function setAuthorities(
        address _surveyor,
        address _bir,
        address _cityTreasury,
        address _assessor,
        address _rd
    ) external onlyOwner {
        require(_surveyor != address(0), "surveyor=0");
        require(_bir != address(0), "bir=0");
        require(_cityTreasury != address(0), "cityTreasury=0");
        require(_assessor != address(0), "assessor=0");
        require(_rd != address(0), "rd=0");

        surveyor = _surveyor;
        bir = _bir;
        cityTreasury = _cityTreasury;
        assessor = _assessor;
        rd = _rd;

        emit AuthoritiesSet(_surveyor, _bir, _cityTreasury, _assessor, _rd);
    }

    // Reentrancy guard
    uint256 private lockedGuard = 1;

    modifier nonReentrant() {
        require(lockedGuard == 1, "reentrancy");
        lockedGuard = 2;
        _;
        lockedGuard = 1;
    }

    struct Land {
        uint256 landId;
        string tctNumber;
        string location;
        string propertyType;   // e.g. "Land Only", "House and Lot"
        string metadataCID;    // IPFS CID for metadata JSON
        address owner;
        bool locked;
        bool exists;
    }

    mapping(uint256 => Land) public lands;

    // Deceased / succession state
    mapping(uint256 => bool) public ownerDeceased;

    event LandRegistered(
        uint256 indexed landId,
        address indexed owner,
        string tctNumber,
        string location,
        string propertyType,
        string metadataCID
    );

    event LandUpdated(
        uint256 indexed landId,
        string newMetadataCID
    );

    event OwnerMarkedDeceased(
        uint256 indexed landId,
        address indexed previousOwner
    );

    event SuccessionResolved(
        uint256 indexed landId,
        address indexed oldOwner,
        address indexed newOwner,
        string newMetadataCID
    );

    function registerLand(
        uint256 landId,
        address ownerAddress,
        string calldata tctNumber,
        string calldata location,
        string calldata propertyType,
        string calldata metadataCID
    ) external onlyRD {
        require(ownerAddress != address(0), "owner=0");

        if (!lands[landId].exists) {
            lands[landId] = Land({
                landId: landId,
                tctNumber: tctNumber,
                location: location,
                propertyType: propertyType,
                metadataCID: metadataCID,
                owner: ownerAddress,
                locked: false,
                exists: true
            });

            emit LandRegistered(
                landId,
                ownerAddress,
                tctNumber,
                location,
                propertyType,
                metadataCID
            );
        } else {
            require(!lands[landId].locked, "land locked");
            lands[landId].metadataCID = metadataCID;
            emit LandUpdated(landId, metadataCID);
        }
    }

    function markOwnerDeceased(uint256 landId) external onlyRD {
        Land storage L = lands[landId];
        require(L.exists, "land not found");
        require(!ownerDeceased[landId], "already marked");

        ownerDeceased[landId] = true;
        L.locked = true;

        emit OwnerMarkedDeceased(landId, L.owner);
    }

    function resolveSuccession(
        uint256 landId,
        address newOwner,
        string calldata newMetadataCID
    ) external onlyRD {
        Land storage L = lands[landId];
        require(L.exists, "land not found");
        require(ownerDeceased[landId], "not deceased");
        require(newOwner != address(0), "newOwner=0");

        address oldOwner = L.owner;

        L.owner = newOwner;
        L.metadataCID = newMetadataCID;
        L.locked = false;
        ownerDeceased[landId] = false;

        emit SuccessionResolved(landId, oldOwner, newOwner, newMetadataCID);
    }

    struct Sale {
        uint256 landId;
        address seller;
        address buyer;
        uint256 priceWei;
        string deedCID;

        // Sequential approvals
        bool surveyOK;
        bool birOK;
        bool treasuryOK;
        bool assessorOK;

        bool buyerFunded;
        bool active;
    }

    mapping(uint256 => Sale) public sales;
    mapping(uint256 => uint256) public escrow;

    event SaleRequested(
        uint256 indexed landId,
        address indexed seller,
        address indexed buyer,
        uint256 priceWei,
        string deedCID
    );

    event BuyerFunded(
        uint256 indexed landId,
        address indexed buyer,
        uint256 amount
    );

    event SurveySet(uint256 indexed landId, bool ok);
    event BIRSet(uint256 indexed landId, bool ok);
    event TreasurySet(uint256 indexed landId, bool ok);
    event AssessorSet(uint256 indexed landId, bool ok);

    event SaleCancelled(
        uint256 indexed landId,
        string reason
    );

    event OwnershipTransferred(
        uint256 indexed landId,
        address indexed from,
        address indexed to,
        uint256 priceWei,
        string newMetadataCID
    );

    function requestSell(
        uint256 landId,
        address buyer,
        uint256 priceWei,
        string calldata deedCID
    ) external {
        Land storage L = lands[landId];

        require(L.exists, "land not found");
        require(msg.sender == L.owner, "not owner");
        require(!ownerDeceased[landId], "owner deceased; succession required");
        require(!L.locked, "land locked");

        require(buyer != address(0), "buyer=0");
        require(buyer != L.owner, "buyer=seller");
        require(priceWei > 0, "price=0");
        require(!sales[landId].active, "sale exists");

        L.locked = true;

        sales[landId] = Sale({
            landId: landId,
            seller: L.owner,
            buyer: buyer,
            priceWei: priceWei,
            deedCID: deedCID,
            surveyOK: false,
            birOK: false,
            treasuryOK: false,
            assessorOK: false,
            buyerFunded: false,
            active: true
        });

        emit SaleRequested(landId, L.owner, buyer, priceWei, deedCID);
    }

    function buyerDeposit(uint256 landId) external payable nonReentrant {
        Sale storage S = sales[landId];

        require(S.active, "inactive sale");
        require(msg.sender == S.buyer, "not buyer");
        require(!S.buyerFunded, "already funded");
        require(msg.value == S.priceWei, "incorrect amount");

        escrow[landId] = msg.value;
        S.buyerFunded = true;

        emit BuyerFunded(landId, msg.sender, msg.value);
    }

    /**
     * Approval Sequence:
     * 1. Survey
     * 2. BIR
     * 3. City Treasury
     * 4. Assessor
     * 5. RD final approval
     */

    function setSurvey(uint256 landId, bool ok) external onlySurveyor {
        Sale storage S = sales[landId];
        require(S.active, "inactive sale");
        S.surveyOK = ok;
        emit SurveySet(landId, ok);
    }

    function setBIR(uint256 landId, bool ok) external onlyBIR {
        Sale storage S = sales[landId];
        require(S.active, "inactive sale");
        require(S.surveyOK, "survey pending");
        S.birOK = ok;
        emit BIRSet(landId, ok);
    }

    function setCityTreasury(uint256 landId, bool ok) external onlyCityTreasury {
        Sale storage S = sales[landId];
        require(S.active, "inactive sale");
        require(S.surveyOK, "survey pending");
        require(S.birOK, "bir pending");
        S.treasuryOK = ok;
        emit TreasurySet(landId, ok);
    }

    function setAssessor(uint256 landId, bool ok) external onlyAssessor {
        Sale storage S = sales[landId];
        require(S.active, "inactive sale");
        require(S.surveyOK, "survey pending");
        require(S.birOK, "bir pending");
        require(S.treasuryOK, "treasury pending");
        S.assessorOK = ok;
        emit AssessorSet(landId, ok);
    }

    function rdApproveTransfer(
        uint256 landId,
        string calldata newMetadataCID
    ) external onlyRD nonReentrant {
        Sale storage S = sales[landId];
        Land storage L = lands[landId];

        require(S.active, "inactive sale");
        require(L.exists, "land not found");
        require(L.locked, "not locked");
        require(!ownerDeceased[landId], "owner deceased; succession required");
        require(S.seller == L.owner, "seller changed");

        // Enforced approval order before RD finalizes
        require(S.surveyOK, "survey pending");
        require(S.birOK, "bir pending");
        require(S.treasuryOK, "treasury pending");
        require(S.assessorOK, "assessor pending");

        require(S.buyerFunded, "no escrow");

        uint256 price = escrow[landId];
        require(price == S.priceWei, "escrow mismatch");

        // Effects first
        escrow[landId] = 0;

        address seller = L.owner;
        address buyer = S.buyer;

        L.owner = buyer;
        L.locked = false;
        L.metadataCID = newMetadataCID;
        S.active = false;

        // Interaction last
        (bool sent, ) = payable(seller).call{value: price}("");
        require(sent, "payment failed");

        emit OwnershipTransferred(
            landId,
            seller,
            buyer,
            price,
            newMetadataCID
        );
    }

    function cancelSale(
        uint256 landId,
        string calldata reason
    ) external nonReentrant {
        Sale storage S = sales[landId];
        Land storage L = lands[landId];

        require(L.exists, "land not found");
        require(S.active, "already inactive");
        require(msg.sender == L.owner || msg.sender == rd, "not allowed");

        S.active = false;
        L.locked = false;

        uint256 refund = escrow[landId];
        if (refund > 0) {
            escrow[landId] = 0;

            (bool sent, ) = payable(S.buyer).call{value: refund}("");
            require(sent, "refund failed");
        }

        emit SaleCancelled(landId, reason);
    }
}