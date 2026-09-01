// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ArbitrumAcademyRegistry
 * @dev On-chain milestone verification registry for Arbitrum Foundation grant tracking.
 * Provides verifiable audit trail for developer onboarding, Solidity deployments,
 * Stylus WASM deployments, and workforce career placement.
 */
contract ArbitrumAcademyRegistry {
    address public academyAdmin;

    struct DeveloperProfile {
        string githubId;
        string trackingCohort;
        bool hasDeployedSolidity;
        bool hasDeployedStylus;
        bool isJobPlaced;
    }

    mapping(address => DeveloperProfile) public developers;

    event DeveloperOnboarded(address indexed wallet, string githubId, string cohort);
    event MilestoneVerified(address indexed wallet, string milestoneType, bool status);

    modifier onlyAdmin() {
        require(msg.sender == academyAdmin, "Unauthorized: Only Academy Admin");
        _;
    }

    constructor() {
        academyAdmin = msg.sender;
    }

    /**
     * @notice Registers and initializes on-chain milestone tracking for a newly onboarded developer.
     * @param _wallet Developer's active Web3 wallet address.
     * @param _gId Developer GitHub handle.
     * @param _c Unique cohort tracking code (e.g., "ARB_COHORT_004").
     */
    function onboardDeveloper(
        address _wallet, 
        string memory _gId, 
        string memory _c
    ) external onlyAdmin {
        developers[_wallet] = DeveloperProfile(_gId, _c, false, false, false);
        emit DeveloperOnboarded(_wallet, _gId, _c);
    }

    /**
     * @notice Verifies specific milestone completion on-chain for grant tranche release.
     * @param _wallet Developer's active Web3 wallet address.
     * @param _mType Milestone category ("solidity", "stylus", "careers").
     * @param _status Boolean completion flag.
     */
    function verifyMilestone(
        address _wallet, 
        string memory _mType, 
        bool _status
    ) external onlyAdmin {
        DeveloperProfile storage dev = developers[_wallet];
        if (keccak256(bytes(_mType)) == keccak256(bytes("solidity"))) {
            dev.hasDeployedSolidity = _status;
        } else if (keccak256(bytes(_mType)) == keccak256(bytes("stylus"))) {
            dev.hasDeployedStylus = _status;
        } else if (keccak256(bytes(_mType)) == keccak256(bytes("careers"))) {
            dev.isJobPlaced = _status;
        }
        emit MilestoneVerified(_wallet, _mType, _status);
    }
}
