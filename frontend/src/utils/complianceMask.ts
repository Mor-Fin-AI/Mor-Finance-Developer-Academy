/**
 * Compliance Utilities (Bypassed - 100% Authentic Native Web3 Mode)
 * All original Web3, crypto, blockchain, and smart contract terminology is preserved.
 */

export const getComplianceText = (_isLoggedIn: boolean, original: string, _masked?: string): string => {
  return original;
};

export const sanitizeComplianceText = (text: string, _isLoggedIn?: boolean): string => {
  return text;
};

export const sanitizeHackathonForCompliance = (hack: any, _isLoggedIn = false): any => {
  return hack;
};

export const SYLLABUS_COMPLIANCE_MAP: Record<string, string> = {
  fundamentals: 'Fundamentals',
  ethereum: 'Ethereum',
  arbitrum: 'Arbitrum',
  optimism: 'Optimism',
  polygon: 'Polygon',
  base: 'Base',
  solana: 'Solana',
  avalanche: 'Avalanche',
  starknet: 'Starknet',
  aptos: 'Aptos',
  polkadot: 'Polkadot',
  fullstack: 'Full Stack Web3',
};

export const LOGGED_OUT_SANDBOX_BOILERPLATE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SecureVault
 * @notice Demonstrates Checks-Effects-Interactions pattern for reentrancy prevention.
 */
contract SecureVault {
    mapping(address => uint256) public balances;
    bool private locked;

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);

    modifier nonReentrant() {
        require(!locked, "ReentrancyGuard: reentrant call");
        locked = true;
        _;
        locked = false;
    }

    function deposit() external payable {
        require(msg.value > 0, "Deposit amount must be greater than zero");
        balances[msg.sender] += msg.value;
        emit Deposited(msg.sender, msg.value);
    }

    function withdraw(uint256 amount) external nonReentrant {
        // 1. CHECKS
        require(balances[msg.sender] >= amount, "Insufficient balance");

        // 2. EFFECTS
        balances[msg.sender] -= amount;

        // 3. INTERACTIONS
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");

        emit Withdrawn(msg.sender, amount);
    }

    function getBalance(address user) external view returns (uint256) {
        return balances[user];
    }
}
`;
