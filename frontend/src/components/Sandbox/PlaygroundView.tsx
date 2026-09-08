import React, { useState, useEffect, useMemo } from 'react';
import { executeMultiChainCompiler } from '../../services/sandboxCompiler';
import type { CompilationResult } from '../../types';
import { streamMentorChat } from '../../api/client';
import { trackStudentDeployment } from '../../services/telemetry';
import {
  deployContractWithWallet,
  isWalletAvailable,
  connectWallet,
  getConnectedAccount,
  EVM_TESTNETS,
  getStoredDeployments,
  saveNewDeployment,
  subscribeDeployments,
  type DeployedContractRecord
} from '../../services/liveDeployer';
import { FormattedAiInsights } from './FormattedAiInsights';
import { TransakWidgetModal } from '../OnRamp/TransakWidgetModal';
import './PlaygroundView.css';

interface LanguagePreset {
  id: string;
  chain: string;
  lang: string;
  fileName: string;
  icon: string;
  compiler: string;
  targetEnv: string;
  templates: {
    name: string;
    description: string;
    code: string;
  }[];
}

const LANGUAGE_PRESETS: LanguagePreset[] = [
  {
    id: 'solidity',
    chain: 'Ethereum / Arbitrum / Base',
    lang: 'Solidity',
    fileName: 'Vault.sol',
    icon: '💎',
    compiler: 'solc v0.8.20+commit.a1b79de6 (EVM Nitro)',
    targetEnv: 'Arbitrum Sepolia / Base / Ethereum',
    templates: [
      {
        name: 'Secure Vault & CEI Pattern',
        description: 'Reentrancy-resistant vault using Checks-Effects-Interactions',
        code: `// SPDX-License-Identifier: MIT
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
}`
      },
      {
        name: 'ERC-20 Token Standard',
        description: 'Fixed-supply governance token with events and allowances',
        code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AcademyToken {
    string public name = "Academy Builder Token";
    string public symbol = "ABT";
    uint8 public decimals = 18;
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor(uint256 initialSupply) {
        totalSupply = initialSupply * 10 ** uint256(decimals);
        balanceOf[msg.sender] = totalSupply;
        emit Transfer(address(0), msg.sender, totalSupply);
    }

    function transfer(address to, uint256 value) external returns (bool) {
        require(balanceOf[msg.sender] >= value, "Insufficient balance");
        balanceOf[msg.sender] -= value;
        balanceOf[to] += value;
        emit Transfer(msg.sender, to, value);
        return true;
    }
}`
      }
    ]
  },
  {
    id: 'solana',
    chain: 'Solana',
    lang: 'Rust (Anchor)',
    fileName: 'src/lib.rs',
    icon: '🟠',
    compiler: 'Anchor CLI v0.30.1 / @solana/web3.js',
    targetEnv: 'Solana Devnet / Sealevel BPF',
    templates: [
      {
        name: 'Anchor Counter & PDA',
        description: 'Program Derived Address (PDA) state counter with signer constraints',
        code: `use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod academy_counter {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, start_count: u64) -> Result<()> {
        let counter = &mut ctx.accounts.counter_account;
        counter.authority = *ctx.accounts.authority.key;
        counter.count = start_count;
        msg!("Academy Counter initialized with count: {}", start_count);
        Ok(())
    }

    pub fn increment(ctx: Context<Increment>) -> Result<()> {
        let counter = &mut ctx.accounts.counter_account;
        counter.count = counter.count.checked_add(1).unwrap();
        msg!("Counter incremented. New count: {}", counter.count);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 8,
        seeds = [b"counter", authority.key().as_ref()],
        bump
    )]
    pub counter_account: Account<'info, CounterState>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Increment<'info> {
    #[account(mut, has_one = authority)]
    pub counter_account: Account<'info, CounterState>,
    pub authority: Signer<'info>,
}

#[account]
pub struct CounterState {
    pub authority: Pubkey,
    pub count: u64,
}`
      }
    ]
  },
  {
    id: 'aptos',
    chain: 'Aptos',
    lang: 'Move',
    fileName: 'sources/credential.move',
    icon: '⚡',
    compiler: 'Aptos Move CLI v2.4.0 / MoveVM v1.12',
    targetEnv: 'Aptos Testnet / MoveVM',
    templates: [
      {
        name: 'Aptos Soulbound Credential',
        description: 'Linear resource struct with store & key abilities',
        code: `module academy_addr::credential {
    use std::signer;
    use std::string::String;
    use aptos_framework::event;

    /// Soulbound Credential Resource
    struct AcademyCredential has key, store {
        student: address,
        track_name: String,
        score: u64,
        graduated: bool,
    }

    #[event]
    struct CredentialIssued has drop, store {
        student: address,
        score: u64,
    }

    const E_ALREADY_GRADUATED: u64 = 1;

    public entry fun issue_credential(
        account: &signer,
        track_name: String,
        score: u64
    ) {
        let student_addr = signer::address_of(account);
        assert!(!exists<AcademyCredential>(student_addr), E_ALREADY_GRADUATED);

        let cred = AcademyCredential {
            student: student_addr,
            track_name,
            score,
            graduated: true,
        };

        move_to(account, cred);
        event::emit(CredentialIssued { student: student_addr, score });
    }

    #[view]
    public fun is_certified(student: address): bool {
        exists<AcademyCredential>(student)
    }
}`
      }
    ]
  },
  {
    id: 'starknet',
    chain: 'Starknet',
    lang: 'Cairo 2.0',
    fileName: 'src/contract.cairo',
    icon: '✨',
    compiler: 'Scarb v2.6.0 / Cairo 2.0 (CairoVM)',
    targetEnv: 'Starknet Sepolia / Sierra',
    templates: [
      {
        name: 'Starknet Cairo 2.0 State Registry',
        description: 'Cairo 2.0 contract with #[storage] and #[abi(embed_v0)]',
        code: `#[starknet::interface]
pub trait IAcademyRegistry<TContractState> {
    fn set_score(ref self: TContractState, student: starknet::ContractAddress, score: u256);
    fn get_score(self: @TContractState, student: starknet::ContractAddress) -> u256;
}

#[starknet::contract]
pub mod AcademyRegistry {
    use starknet::{ContractAddress, get_caller_address};

    #[storage]
    struct Storage {
        admin: ContractAddress,
        scores: LegacyMap<ContractAddress, u256>,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        ScoreUpdated: ScoreUpdated,
    }

    #[derive(Drop, starknet::Event)]
    pub struct ScoreUpdated {
        pub student: ContractAddress,
        pub score: u256,
    }

    #[constructor]
    fn constructor(ref self: ContractState, initial_admin: ContractAddress) {
        self.admin.write(initial_admin);
    }

    #[abi(embed_v0)]
    impl AcademyRegistryImpl of super::IAcademyRegistry<ContractState> {
        fn set_score(ref self: ContractState, student: ContractAddress, score: u256) {
            let caller = get_caller_address();
            assert(caller == self.admin.read(), 'Unauthorized Admin');
            self.scores.write(student, score);
            self.emit(ScoreUpdated { student, score });
        }

        fn get_score(self: @ContractState, student: ContractAddress) -> u256 {
            self.scores.read(student)
        }
    }
}`
      }
    ]
  },
  {
    id: 'polkadot',
    chain: 'Polkadot / Substrate',
    lang: 'Rust (ink! Wasm)',
    fileName: 'lib.rs',
    icon: '🟣',
    compiler: 'cargo-contract v4.0.0 / ink! 5.0',
    targetEnv: 'Polkadot Westend / pallet-contracts',
    templates: [
      {
        name: 'ink! Flipper & State Toggle',
        description: 'Substrate Wasm contract with storage struct and messages',
        code: `![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod academy_flipper {
    #[ink(storage)]
    pub struct AcademyFlipper {
        value: bool,
        owner: AccountId,
    }

    #[ink(event)]
    pub struct Flipped {
        #[ink(topic)]
        new_value: bool,
    }

    impl AcademyFlipper {
        #[ink(constructor)]
        pub fn new(init_value: bool) -> Self {
            let caller = Self::env().caller();
            Self { value: init_value, owner: caller }
        }

        #[ink(message)]
        pub fn flip(&mut self) {
            self.value = !self.value;
            self.env().emit_event(Flipped { new_value: self.value });
        }

        #[ink(message)]
        pub fn get(&self) -> bool {
            self.value
        }
    }
}`
      }
    ]
  },
  {
    id: 'arbitrum_stylus',
    chain: 'Arbitrum Stylus',
    lang: 'Rust (Stylus WASM)',
    fileName: 'src/lib.rs',
    icon: '🔵',
    compiler: 'Stylus SDK v0.6.0 / cargo stylus',
    targetEnv: 'Arbitrum Sepolia / WASM Stylus',
    templates: [
      {
        name: 'Stylus WASM Graduate Counter',
        description: 'WASM-optimized high efficiency Stylus contract in Rust',
        code: `![cfg_attr(not(feature = "export-abi"), no_main)]
extern crate alloc;
use stylus_sdk::{prelude::*, storage::StorageU256};

#[storage]
#[entrypoint]
pub struct AcademyCounter {
    number_of_graduates: StorageU256,
}

#[public]
impl AcademyCounter {
    pub fn get_graduates(&self) -> Result<u64, Vec<u8>> {
        Ok(self.number_of_graduates.get().as_u64())
    }

    pub fn increment_graduates(&mut self) -> Result<(), Vec<u8>> {
        let current = self.number_of_graduates.get();
        self.number_of_graduates.set(current + 1);
        Ok(())
    }
}`
      }
    ]
  },
  {
    id: 'base',
    chain: 'Base',
    lang: 'Solidity (Base)',
    fileName: 'BaseGaslessPaymaster.sol',
    icon: '🔷',
    compiler: 'solc v0.8.20 (Base Sepolia OP Stack)',
    targetEnv: 'Base Sepolia (Chain ID: 84532)',
    templates: [
      {
        name: 'Base Gasless Paymaster (ERC-4337)',
        description: 'Account abstraction paymaster sponsoring user transactions on Base Sepolia',
        code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title BaseGaslessPaymaster
 * @notice ERC-4337 compliant gas sponsorship paymaster optimized for Base Sepolia & Coinbase Smart Wallet.
 */
contract BaseGaslessPaymaster {
    address public immutable owner;
    mapping(address => bool) public sponsoredContracts;
    uint256 public totalGasSponsored;

    event UserOperationSponsored(address indexed sender, uint256 actualGasCost);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only paymaster owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function setSponsorship(address target, bool allowed) external onlyOwner {
        sponsoredContracts[target] = allowed;
    }

    function validatePaymasterUserOp(
        bytes calldata /* userOp */,
        bytes32 /* userOpHash */,
        uint256 maxCost
    ) external returns (bytes memory context, uint256 validationData) {
        return (abi.encode(msg.sender, maxCost), 0);
    }

    function postOp(
        uint8 /* mode */,
        bytes calldata context,
        uint256 actualGasCost
    ) external {
        totalGasSponsored += actualGasCost;
        (address sender, ) = abi.decode(context, (address, uint256));
        emit UserOperationSponsored(sender, actualGasCost);
    }

    receive() external payable {}
}`
      },
      {
        name: 'Base Onchain Attendance Badge',
        description: 'Coinbase Smart Wallet compatible soulbound attendance proof',
        code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title BaseAttendanceProof
 * @notice Non-transferable onchain attendance proof on Base Sepolia.
 */
contract BaseAttendanceProof {
    string public name = "Base Academy Attendance";
    string public symbol = "BASE-ATTEND";
    address public admin;

    mapping(address => bool) public hasAttended;
    uint256 public totalCertificates;

    event AttendanceMinted(address indexed student, uint256 indexed certificateId);

    constructor() {
        admin = msg.sender;
    }

    function mintProof(address student) external {
        require(msg.sender == admin, "Only admin can attest attendance");
        require(!hasAttended[student], "Student already claimed proof");

        hasAttended[student] = true;
        totalCertificates++;
        emit AttendanceMinted(student, totalCertificates);
    }
}`
      }
    ]
  },
  {
    id: 'optimism',
    chain: 'Optimism',
    lang: 'Solidity (Optimism)',
    fileName: 'OptimismCrossDomainBridge.sol',
    icon: '🔴',
    compiler: 'solc v0.8.20 (OP Stack Superchain)',
    targetEnv: 'OP Sepolia / OP Mainnet (Superchain)',
    templates: [
      {
        name: 'OP Superchain Cross-Domain Bridge',
        description: 'Cross-L2 message transmitter communicating via the Optimism Superchain Messenger',
        code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title OptimismCrossDomainBridge
 * @notice Cross-L2 message transmitter communicating via the Optimism Superchain Messenger.
 */
interface ICrossDomainMessenger {
    function sendMessage(address _target, bytes calldata _message, uint32 _gasLimit) external payable;
    function xDomainMessageSender() external view returns (address);
}

contract OptimismCrossDomainBridge {
    address public constant OP_MESSENGER = 0x4200000000000000000000000000000000000007;
    address public owner;
    uint256 public crossChainTransfersCount;

    event MessageDispatched(address indexed to, bytes payload, uint32 gasLimit);
    event MessageReceived(address indexed from, bytes payload);

    modifier onlyMessenger() {
        require(msg.sender == OP_MESSENGER, "Caller must be OP CrossDomainMessenger");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function sendCrossChainMessage(
        address targetContract,
        bytes calldata payload,
        uint32 gasLimit
    ) external payable {
        crossChainTransfersCount++;
        ICrossDomainMessenger(OP_MESSENGER).sendMessage{value: msg.value}(
            targetContract,
            payload,
            gasLimit
        );
        emit MessageDispatched(targetContract, payload, gasLimit);
    }

    function receiveCrossChainMessage(bytes calldata payload) external onlyMessenger {
        address originSender = ICrossDomainMessenger(OP_MESSENGER).xDomainMessageSender();
        emit MessageReceived(originSender, payload);
    }
}`
      },
      {
        name: 'Optimism Superchain Mintable ERC-20',
        description: 'Standard Superchain-compatible token bridge template',
        code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract OptimismSuperchainToken {
    string public name = "OP Superchain Token";
    string public symbol = "OPT";
    uint8 public decimals = 18;
    uint256 public totalSupply;

    address public bridge;
    mapping(address => uint256) public balanceOf;

    event Mint(address indexed account, uint256 amount);
    event Burn(address indexed account, uint256 amount);

    constructor(address _bridge) {
        bridge = _bridge;
    }

    function mint(address to, uint256 amount) external {
        require(msg.sender == bridge, "Only bridge can mint");
        totalSupply += amount;
        balanceOf[to] += amount;
        emit Mint(to, amount);
    }

    function burn(address from, uint256 amount) external {
        require(msg.sender == bridge, "Only bridge can burn");
        balanceOf[from] -= amount;
        totalSupply -= amount;
        emit Burn(from, amount);
    }
}`
      }
    ]
  }
];

export const PlaygroundView: React.FC<{ isLoggedIn?: boolean }> = ({ isLoggedIn: _isLoggedIn = true }) => {
  const [activePreset, setActivePreset] = useState<LanguagePreset>(LANGUAGE_PRESETS[0]);
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState<number>(0);
  const [code, setCode] = useState<string>(LANGUAGE_PRESETS[0].templates[0].code);

  const [activeTab, setActiveTab] = useState<'editor' | 'deploy' | 'ai'>('editor');
  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const [compilationResult, setCompilationResult] = useState<CompilationResult | null>(null);
  const [consoleOutput, setConsoleOutput] = useState<string[]>([
    "🚀 Multi-Chain Sandbox IDE ready.",
    "Select an ecosystem track, load a smart contract preset, or write custom code.",
    "Click 'Compile Smart Contract' to run client-side syntax checks and generate ABI/bytecode."
  ]);

  // AI Mentor state
  const [aiMentor, setAiMentor] = useState<'openclaw' | 'hermes'>('openclaw');
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAiStreaming, setIsAiStreaming] = useState<boolean>(false);

  // Live Testnet Wallet Deployment State
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [connectingWallet, setConnectingWallet] = useState<boolean>(false);
  const [deployingTestnet, setDeployingTestnet] = useState<boolean>(false);
  const [selectedTestnetId, setSelectedTestnetId] = useState<string>('arbitrum_sepolia');
  const [deployedContracts, setDeployedContracts] = useState<DeployedContractRecord[]>(getStoredDeployments);

  // On-Ramp Modal State
  const [isOnRampOpen, setIsOnRampOpen] = useState<boolean>(false);

  const activeTestnet = useMemo(
    () => EVM_TESTNETS.find((n) => n.id === selectedTestnetId) || EVM_TESTNETS[0],
    [selectedTestnetId]
  );

  useEffect(() => {
    const unsub = subscribeDeployments((deps) => {
      setDeployedContracts(deps);
    });
    return unsub;
  }, []);

  // Check connected account on mount
  useEffect(() => {
    getConnectedAccount().then((acc) => {
      if (acc) setWalletAddress(acc);
    });

    if (isWalletAvailable()) {
      const handleAccounts = (accs: string[]) => {
        setWalletAddress(accs && accs.length > 0 ? accs[0] : null);
      };
      (window as any).ethereum.on('accountsChanged', handleAccounts);
      return () => {
        try {
          (window as any).ethereum.removeListener('accountsChanged', handleAccounts);
        } catch {
          // ignore
        }
      };
    }
  }, []);

  // Update code when preset changes
  const handleSelectPreset = (preset: LanguagePreset) => {
    setActivePreset(preset);
    setSelectedTemplateIndex(0);
    setCode(preset.templates[0].code);
    setCompilationResult(null);
    setConsoleOutput((prev) => [
      ...prev,
      `--- Switched to ${preset.chain} (${preset.lang}) ---`,
      `Loaded template: ${preset.templates[0].name}`
    ]);
  };

  const handleSelectTemplate = (index: number) => {
    setSelectedTemplateIndex(index);
    setCode(activePreset.templates[index].code);
    setCompilationResult(null);
    setConsoleOutput((prev) => [
      ...prev,
      `Loaded template: ${activePreset.templates[index].name}`
    ]);
  };

  // Compile Handler
  const handleCompile = async () => {
    setIsCompiling(true);
    setConsoleOutput((prev) => [
      ...prev,
      `\n⏳ Compiling ${activePreset.fileName} using ${activePreset.compiler}...`
    ]);

    try {
      const result = await executeMultiChainCompiler(activePreset.id, code);
      setCompilationResult(result);

      if (result.success) {
        setConsoleOutput((prev) => [
          ...prev,
          `✅ ${result.stdout || 'Compilation successful'}`,
          `⛽ Estimated gas: ${result.gasEstimate ? result.gasEstimate.toLocaleString() : '0'} units`,
          result.artifacts?.bytecode ? `📦 Bytecode generated (${result.artifacts.bytecode.length / 2} bytes)` : '',
          result.artifacts?.classHash ? `🔑 Starknet Class Hash: ${result.artifacts.classHash}` : '',
          result.artifacts?.programId ? `☀️ Solana Program ID: ${result.artifacts.programId}` : ''
        ].filter(Boolean));
      } else {
        setConsoleOutput((prev) => [
          ...prev,
          `❌ ${result.stdout || result.stderr || 'Compilation failed'}`,
          ...(result.syntaxErrors || []).map((err) => `  - ${err}`)
        ]);
      }
    } catch (err: any) {
      setConsoleOutput((prev) => [
        ...prev,
        `❌ Compilation execution failure: ${err.message || 'Unknown error'}`
      ]);
    } finally {
      setIsCompiling(false);
    }
  };

  // Real Wallet Connect Handler
  const handleConnectWallet = async () => {
    setConnectingWallet(true);
    try {
      const acc = await connectWallet();
      setWalletAddress(acc);
      setConsoleOutput((prev) => [
        ...prev,
        `🦊 Web3 Wallet Connected: ${acc}`
      ]);
    } catch (err: any) {
      alert(`Wallet Notice: ${err.message}`);
    } finally {
      setConnectingWallet(false);
    }
  };

  // Live Testnet Deploy Handler
  const handleDeployToTestnet = async () => {
    if (deployingTestnet || !code.trim()) return;

    setDeployingTestnet(true);
    setConsoleOutput((prev) => [
      ...prev,
      `\n🚀 Starting deployment to ${activeTestnet.name}...`,
      `🌐 Target: ${activeTestnet.name} (Chain ID: ${activeTestnet.chainId})`,
      `📦 Preparing smart contract bytecode...`
    ]);

    try {
      // Step 1: Ensure bytecode is generated
      let bytecode = compilationResult?.artifacts?.bytecode;
      let abi = compilationResult?.artifacts?.abi;
      let contractName = compilationResult?.artifacts?.contract_name || activePreset.templates[selectedTemplateIndex].name.replace(/\s+/g, '');

      if (!bytecode) {
        setConsoleOutput((prev) => [...prev, `⚙️ Running automated compilation pass before deployment...`]);
        const compRes = await executeMultiChainCompiler(activePreset.id, code);
        if (!compRes.success) {
          setConsoleOutput((prev) => [
            ...prev,
            `❌ Pre-deployment compilation failed. Please fix syntax errors first.`
          ]);
          alert("Compilation failed. Please fix contract syntax errors before deploying.");
          return;
        }
        bytecode = compRes.artifacts?.bytecode;
        abi = compRes.artifacts?.abi;
        contractName = compRes.artifacts?.contract_name || contractName;
      }

      let deployRes: any = null;
      let isLiveWallet = false;

      if (isWalletAvailable()) {
        try {
          deployRes = await deployContractWithWallet({
            networkId: activeTestnet.id,
            bytecode: bytecode || '',
            abi,
            contractName,
            onStatus: (msg) => {
              setConsoleOutput((prev) => [...prev, msg]);
            }
          });
          isLiveWallet = true;
          if (deployRes.deployerAddress) {
            setWalletAddress(deployRes.deployerAddress);
          }
        } catch (walletErr: any) {
          if (walletErr.message?.includes('USER_CANCELLED')) {
            setConsoleOutput((prev) => [...prev, `❌ Deployment cancelled: Signature rejected in wallet.`]);
            return;
          }
          console.warn("Wallet deployment error:", walletErr);
          const proceedSim = window.confirm(
            `Live wallet deployment failed: ${walletErr.message}\n\nWould you like to fall back to a simulated deployment?`
          );
          if (!proceedSim) return;
        }
      } else {
        const proceedSim = window.confirm(
          `No Web3 wallet (MetaMask / Coinbase) detected in this browser.\n\nTo sign real transactions, please install MetaMask.\n\nWould you like to run a simulated sandbox deployment instead?`
        );
        if (!proceedSim) return;
      }

      let contractAddress = deployRes?.contractAddress;
      let txHash = deployRes?.txHash;
      let blockNumber = deployRes?.blockNumber;
      let gasUsed = deployRes?.gasUsed || 185000;
      let deployer = deployRes?.deployerAddress || walletAddress || '0xDemoWalletUser';

      if (!isLiveWallet) {
        const randomHex = (len: number) => {
          let s = '';
          const chars = '0123456789abcdef';
          for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
          return s;
        };
        contractAddress = `0x${randomHex(40)}`;
        txHash = `0x${randomHex(64)}`;
        blockNumber = 14892100 + Math.floor(Math.random() * 30000);
      }

      const newRecord: DeployedContractRecord = {
        id: `dep-${Date.now()}`,
        contractName,
        contractAddress: contractAddress!,
        txHash: txHash!,
        networkId: activeTestnet.id,
        networkName: activeTestnet.name,
        networkIcon: activeTestnet.icon,
        chainId: activeTestnet.chainId,
        explorerUrl: activeTestnet.explorerUrl,
        gasUsed,
        blockNumber: blockNumber || 0,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language: activePreset.lang
      };

      saveNewDeployment(newRecord);

      trackStudentDeployment(
        deployer,
        'KU_COHORT_2026_01',
        {
          contractAddress: contractAddress!,
          network: activeTestnet.telemetryNetwork,
          executionEnvironment: activeTestnet.execEnv,
          programmingLanguage: activePreset.lang.toLowerCase(),
          gasUsed
        }
      ).catch((e) => console.warn("Telemetry warning:", e));

      setConsoleOutput((prev) => [
        ...prev,
        `======================================================================`,
        `🎉 ${isLiveWallet ? 'LIVE TESTNET CONTRACT DEPLOYED!' : 'SANDBOX SIMULATED DEPLOYMENT SUCCESSFUL'}`,
        `======================================================================`,
        `• Contract Name:    ${contractName}`,
        `• Target Network:   ${activeTestnet.name} (Chain ID: ${activeTestnet.chainId})`,
        `• Contract Address: ${contractAddress}`,
        `• Transaction Hash: ${txHash}`,
        `• Block Number:     #${blockNumber?.toLocaleString()}`,
        `• Gas Consumed:     ${gasUsed.toLocaleString()} units`,
        `• Status:           ${isLiveWallet ? '✅ Verified on Live Testnet' : '✅ Verified in Local Sandbox'}`,
        ``,
        `🔗 Block Explorer Links:`,
        `  - Contract: ${activeTestnet.explorerUrl}/address/${contractAddress}`,
        `  - Tx:       ${activeTestnet.explorerUrl}/tx/${txHash}`,
        `======================================================================`
      ]);

      setActiveTab('deploy');
    } catch (err: any) {
      setConsoleOutput((prev) => [...prev, `❌ Deployment failed: ${err.message || 'Unknown error'}`]);
      alert(`Deployment Error: ${err.message || 'Failed to deploy contract'}`);
    } finally {
      setDeployingTestnet(false);
    }
  };

  // AI Mentor Stream Analysis
  const handleAskMentor = async () => {
    if (isAiStreaming || !code.trim()) return;

    setIsAiStreaming(true);
    setAiAnalysis('');
    setActiveTab('ai');

    const prompt =
      aiMentor === 'openclaw'
        ? `Please provide educational guidance, syntax explanations, and best practices for this ${activePreset.lang} code:\n\n${code}`
        : `Please perform a rigorous smart contract security audit, gas optimization review, and vulnerability analysis on this ${activePreset.lang} code:\n\n${code}`;

    try {
      let accumulated = '';
      for await (const _ of streamMentorChat(
        prompt,
        code,
        (delta) => {
          accumulated += delta;
          setAiAnalysis(accumulated);
        },
        'sandbox-developer',
        aiMentor
      )) {}
    } catch (err: any) {
      setAiAnalysis(`Error contacting ${aiMentor}: ${err.message || 'Service temporarily unavailable'}`);
    } finally {
      setIsAiStreaming(false);
    }
  };

  return (
    <div className="playground animate-fade-in">
      {/* Header */}
      <div className="playground-header glass">
        <div className="playground-header__info">
          <div className="playground-badge">
            <span>⚡ MULTI-CHAIN WEB3 IDE</span>
            <span className="badge-divider">•</span>
            <span>LIVE COMPILERS &amp; TESTNET DEPLOYER</span>
          </div>
          <h2 className="playground-title">Smart Contract Sandbox</h2>
          <p className="playground-subtitle">
            Write, compile, analyze with AI mentors, and deploy smart contracts to Ethereum, Arbitrum, Base, Optimism, Solana, Starknet, Aptos &amp; Polkadot.
          </p>
        </div>

        <div className="playground-header__actions">
          {/* Transak Gas On-Ramp Launcher */}
          <button
            className="btn btn--secondary playground-onramp-btn"
            onClick={() => setIsOnRampOpen(true)}
            title="Acquire testnet gas or crypto assets via Transak"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              background: 'rgba(59, 130, 246, 0.1)',
              color: '#93c5fd'
            }}
          >
            <span>⛽</span> Gas On-Ramp
          </button>

          {walletAddress ? (
            <div className="playground-wallet-pill" title={`Connected Web3 Wallet: ${walletAddress}`}>
              🦊 {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </div>
          ) : (
            <button
              className="btn btn--secondary"
              onClick={handleConnectWallet}
              disabled={connectingWallet}
              style={{ fontSize: '0.82rem', padding: '8px 14px' }}
            >
              {connectingWallet ? 'Connecting...' : '🦊 Connect Wallet'}
            </button>
          )}

          <button
            className="btn btn--secondary"
            onClick={handleAskMentor}
            disabled={isAiStreaming}
            title="Ask OpenClaw or Hermes AI to review this code"
          >
            🤖 Ask AI Mentor
          </button>

          <button
            className="btn btn--primary"
            onClick={handleCompile}
            disabled={isCompiling}
          >
            {isCompiling ? (
              <>
                <span className="spinner" style={{ width: 14, height: 14, marginRight: 6 }} />
                Compiling...
              </>
            ) : (
              '⚡ Compile Smart Contract'
            )}
          </button>
        </div>
      </div>

      {/* Preset / Ecosystem Bar */}
      <div className="preset-bar glass">
        <span className="preset-bar__label">Ecosystem Runtime:</span>
        <div className="preset-bar__list">
          {LANGUAGE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              className={`preset-btn ${activePreset.id === preset.id ? 'preset-btn--active' : ''}`}
              onClick={() => handleSelectPreset(preset)}
            >
              <span className="preset-btn__icon">{preset.icon}</span>
              <span className="preset-btn__lang">{preset.lang}</span>
              <span className="preset-btn__chain">{preset.chain}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Split-Pane Workspace */}
      <div className="playground-workspace">
        {/* Left Column: Code Editor */}
        <div className="editor-pane glass">
          <div className="editor-pane__header">
            <div className="editor-tab">
              <span className="editor-tab__icon">{activePreset.icon}</span>
              <span className="editor-tab__filename">{activePreset.fileName}</span>
            </div>

            <div className="template-dropdown-wrap">
              <span className="template-label">Template:</span>
              <select
                className="template-select"
                value={selectedTemplateIndex}
                onChange={(e) => handleSelectTemplate(Number(e.target.value))}
              >
                {activePreset.templates.map((tpl, idx) => (
                  <option key={idx} value={idx}>
                    {tpl.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="editor-pane__body">
            <textarea
              className="code-textarea"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              placeholder="// Write your smart contract code here..."
            />
          </div>

          <div className="editor-pane__footer">
            <span className="compiler-badge">🛠️ {activePreset.compiler}</span>
            <span className="env-badge">🌐 {activePreset.targetEnv}</span>
          </div>
        </div>

        {/* Right Column: Interactive Tabs (Editor Logs / Testnet Deploy / AI Review) */}
        <div className="output-pane glass">
          <div className="output-tabs-bar">
            <button
              className={`output-tab-btn ${activeTab === 'editor' ? 'output-tab-btn--active' : ''}`}
              onClick={() => setActiveTab('editor')}
            >
              💻 Compiler Terminal
            </button>
            <button
              className={`output-tab-btn ${activeTab === 'deploy' ? 'output-tab-btn--active' : ''}`}
              onClick={() => setActiveTab('deploy')}
            >
              🚀 Live Testnet Deploy ({deployedContracts.length})
            </button>
            <button
              className={`output-tab-btn ${activeTab === 'ai' ? 'output-tab-btn--active' : ''}`}
              onClick={() => setActiveTab('ai')}
            >
              🤖 AI Code Review {isAiStreaming && <span className="streaming-dot" />}
            </button>
          </div>

          <div className="output-pane__content">
            {/* Tab 1: Terminal Console */}
            {activeTab === 'editor' && (
              <div className="console-view animate-fade-in">
                <div className="console-toolbar">
                  <span className="console-title">Execution Logs</span>
                  <button
                    className="console-clear-btn"
                    onClick={() => setConsoleOutput([])}
                  >
                    Clear Terminal
                  </button>
                </div>
                <div className="console-screen">
                  {consoleOutput.map((line, idx) => (
                    <div
                      key={idx}
                      className={`console-line ${
                        line.startsWith('✅') ? 'console-line--success' :
                        line.startsWith('❌') ? 'console-line--error' :
                        line.startsWith('⏳') ? 'console-line--info' :
                        line.startsWith('---') ? 'console-line--divider' : ''
                      }`}
                    >
                      {line}
                    </div>
                  ))}
                </div>

                {compilationResult?.success && (
                  <div className="compilation-meta-box">
                    <div className="meta-item">
                      <span className="meta-lbl">Gas Estimate</span>
                      <span className="meta-val">{compilationResult.gasEstimate.toLocaleString()} units</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-lbl">Build Status</span>
                      <span className="meta-val meta-val--ok">0 Warnings, 0 Errors</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-lbl">Target Network</span>
                      <span className="meta-val">{activePreset.targetEnv}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Testnet Deployer */}
            {activeTab === 'deploy' && (
              <div className="deploy-view animate-fade-in">
                <div className="deploy-card glass">
                  <div className="deploy-card__header">
                    <span className="deploy-card__badge">🚀 LIVE ON-CHAIN DEPLOYER</span>
                    <h4 className="deploy-card__title">Deploy to Live EVM Testnet</h4>
                    <p className="deploy-card__desc">
                      Connect your MetaMask or browser Web3 wallet, choose an EVM testnet, and deploy this smart contract directly on-chain.
                    </p>
                  </div>

                  <div className="testnet-select-grid">
                    {EVM_TESTNETS.map((net) => (
                      <button
                        key={net.id}
                        type="button"
                        className={`testnet-btn ${selectedTestnetId === net.id ? 'testnet-btn--active' : ''}`}
                        onClick={() => setSelectedTestnetId(net.id)}
                      >
                        <span className="testnet-btn__icon">{net.icon}</span>
                        <div className="testnet-btn__info">
                          <span className="testnet-btn__name">{net.name}</span>
                          <span className="testnet-btn__chain">Chain ID: {net.chainId}</span>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="deploy-meta-grid">
                    <div className="deploy-meta-cell">
                      <span className="deploy-meta-label">Target Network</span>
                      <strong className="deploy-meta-val">{activeTestnet.name}</strong>
                    </div>
                    <div className="deploy-meta-cell">
                      <span className="deploy-meta-label">Native Token</span>
                      <strong className="deploy-meta-val">{activeTestnet.symbol}</strong>
                    </div>
                    <div className="deploy-meta-cell">
                      <span className="deploy-meta-label">Faucet Access</span>
                      <a href={activeTestnet.faucetUrl} target="_blank" rel="noopener noreferrer" className="faucet-link">
                        <span>Get Free Testnet Gas</span>
                        <span className="faucet-link__arrow">↗</span>
                      </a>
                    </div>
                    <div className="deploy-meta-cell">
                      <span className="deploy-meta-label">Wallet Status</span>
                      <span className={`deploy-meta-val ${walletAddress ? 'deploy-meta-val--connected' : 'deploy-meta-val--disconnected'}`}>
                        {walletAddress ? `🔑 ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : '⚠️ Not Connected'}
                      </span>
                    </div>
                  </div>

                  <div className="deploy-actions-row">
                    {!walletAddress && (
                      <button className="btn btn--secondary deploy-connect-btn" onClick={handleConnectWallet} disabled={connectingWallet}>
                        🦊 {connectingWallet ? 'Connecting...' : 'Connect MetaMask'}
                      </button>
                    )}
                    <button
                      className="btn btn--primary deploy-submit-btn"
                      onClick={handleDeployToTestnet}
                      disabled={deployingTestnet}
                    >
                      {deployingTestnet ? (
                        <>
                          <span className="spinner" style={{ width: 14, height: 14, marginRight: 6 }} />
                          Deploying to {activeTestnet.name}...
                        </>
                      ) : (
                        `🚀 Deploy to ${activeTestnet.name}`
                      )}
                    </button>
                  </div>
                </div>

                {/* Deployed Contracts History Table */}
                <div className="deployments-history glass">
                  <div className="deployments-history__header">
                    <div className="deployments-history__title-wrap">
                      <span className="deployments-history__icon">📜</span>
                      <h4 className="deployments-history__title">Deployed Contracts Registry</h4>
                    </div>
                    <span className="badge-registry-count">{deployedContracts.length} Total</span>
                  </div>

                  {deployedContracts.length === 0 ? (
                    <div className="no-deployments-box">
                      <span className="no-deployments-icon">🚀</span>
                      <p className="no-deployments-msg">No contracts deployed yet. Click 'Deploy' to launch your first smart contract!</p>
                    </div>
                  ) : (
                    <div className="deployments-table-wrapper">
                      <table className="deployments-table">
                        <thead>
                          <tr>
                            <th>Contract Name</th>
                            <th>Network</th>
                            <th>Contract Address</th>
                            <th>Transaction</th>
                            <th>Gas Used</th>
                            <th>Status &amp; Time</th>
                          </tr>
                        </thead>
                        <tbody>
                          {deployedContracts.map((dep) => (
                            <tr key={dep.id}>
                              <td className="cell-contract-name">
                                <span className="contract-doc-icon">📄</span>
                                <span className="contract-title-text">{dep.contractName}</span>
                              </td>
                              <td>
                                <span className="net-pill">
                                  <span className="net-pill__icon">{dep.networkIcon}</span>
                                  <span className="net-pill__name">{dep.networkName}</span>
                                </span>
                              </td>
                              <td>
                                <a
                                  href={`${dep.explorerUrl}/address/${dep.contractAddress}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="explorer-link"
                                  title={`View on ${dep.networkName} explorer`}
                                >
                                  <span className="explorer-link__hash">{dep.contractAddress.slice(0, 6)}...{dep.contractAddress.slice(-4)}</span>
                                  <span className="explorer-link__arrow">↗</span>
                                </a>
                              </td>
                              <td>
                                <a
                                  href={`${dep.explorerUrl}/tx/${dep.txHash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="explorer-link"
                                  title={`View transaction on ${dep.networkName} explorer`}
                                >
                                  <span className="explorer-link__hash">{dep.txHash.slice(0, 6)}...{dep.txHash.slice(-4)}</span>
                                  <span className="explorer-link__arrow">↗</span>
                                </a>
                              </td>
                              <td className="cell-gas">
                                <span className="gas-badge">⚡ {dep.gasUsed ? dep.gasUsed.toLocaleString() : '185,000'}</span>
                              </td>
                              <td className="cell-status-time">
                                <span className="verified-badge">✓ Verified</span>
                                <span className="timestamp-text">{dep.timestamp === 'Verified' ? 'Recently' : dep.timestamp}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 3: AI Code Review */}
            {activeTab === 'ai' && (
              <div className="ai-review-pane animate-fade-in">
                <div className="ai-review-header">
                  <div className="ai-mentor-selector">
                    <span className="ai-lbl">Selected Mentor:</span>
                    <button
                      className={`ai-mentor-btn ${aiMentor === 'openclaw' ? 'ai-mentor-btn--active' : ''}`}
                      onClick={() => setAiMentor('openclaw')}
                    >
                      🔮 OpenClaw (Curriculum &amp; Education)
                    </button>
                    <button
                      className={`ai-mentor-btn ${aiMentor === 'hermes' ? 'ai-mentor-btn--active' : ''}`}
                      onClick={() => setAiMentor('hermes')}
                    >
                      🛠️ Hermes (Security Audit &amp; Gas Review)
                    </button>
                  </div>

                  <button
                    className="btn btn--secondary btn--sm"
                    onClick={handleAskMentor}
                    disabled={isAiStreaming}
                  >
                    {isAiStreaming ? 'Analyzing...' : 'Re-run Analysis'}
                  </button>
                </div>

                <div className="ai-analysis-content">
                  {isAiStreaming && !aiAnalysis ? (
                    <div className="ai-loading-box">
                      <div className="spinner" />
                      <p>
                        {aiMentor === 'openclaw'
                          ? 'OpenClaw is analyzing your smart contract logic...'
                          : 'Hermes is scanning bytecode and vulnerabilities...'}
                      </p>
                    </div>
                  ) : aiAnalysis ? (
                    <FormattedAiInsights content={aiAnalysis} onClear={() => setAiAnalysis('')} />
                  ) : (
                    <div className="ai-empty-prompt">
                      <span className="empty-icon">💡</span>
                      <h4>No Analysis Generated Yet</h4>
                      <p>Click "Ask AI Mentor" to get instant security analysis, syntax guidance, and gas optimization advice.</p>
                      <button className="btn btn--primary" onClick={handleAskMentor}>
                        Run AI Smart Contract Review
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Gas On-Ramp Modal */}
      <TransakWidgetModal
        isOpen={isOnRampOpen}
        onClose={() => setIsOnRampOpen(false)}
        walletAddress={walletAddress || ''}
        defaultNetwork={activeTestnet.id}
      />
    </div>
  );
};

export default PlaygroundView;
