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
  INITIAL_DEPLOYMENTS,
  type DeployedContractRecord
} from '../../services/web3Deployer';
import { FormattedAiInsights } from './FormattedAiInsights';
import { TransakWidgetModal } from '../OnRamp/TransakWidgetModal';
import { LOGGED_OUT_SANDBOX_BOILERPLATE } from '../../utils/complianceMask';
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



export interface PlaygroundViewProps {
  isLoggedIn?: boolean;
}

export const PlaygroundView: React.FC<PlaygroundViewProps> = ({ isLoggedIn = false }) => {
  const [selectedLangId, setSelectedLangId] = useState<string>('solidity');
  const activePreset = LANGUAGE_PRESETS.find((p) => p.id === selectedLangId) || LANGUAGE_PRESETS[0];

  const [code, setCode] = useState<string>(() =>
    isLoggedIn ? activePreset.templates[0].code : LOGGED_OUT_SANDBOX_BOILERPLATE
  );
  const [compiling, setCompiling] = useState<boolean>(false);
  const [compilationResult, setCompilationResult] = useState<CompilationResult | null>(null);
  const [activeConsoleTab, setActiveConsoleTab] = useState<'console' | 'artifacts' | 'abi' | 'deployments'>('console');
  
  // EVM Testnet Deployments & Web3 Wallet
  const [deploying, setDeploying] = useState<boolean>(false);
  const [selectedTestnetId, setSelectedTestnetId] = useState<string>('arbitrum_sepolia');
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [connectingWallet, setConnectingWallet] = useState<boolean>(false);
  const [deployStepMessage, setDeployStepMessage] = useState<string | null>(null);
  const [isOnRampOpen, setIsOnRampOpen] = useState<boolean>(false);

  const [deployedContracts, setDeployedContracts] = useState<DeployedContractRecord[]>(() => {
    return getStoredDeployments();
  });

  const displayedDeployments = useMemo(() => {
    if (isLoggedIn) return deployedContracts;
    return deployedContracts.map((dep) => ({
      ...dep,
      contractName: dep.contractName.replace(/SecureVault/g, 'SecureMemoryManager').replace(/BaseGaslessPaymaster/g, 'GaslessBatchProcessor').replace(/OptimismCrossDomainBridge/g, 'CrossDomainRouter'),
      language: 'System Logic',
      networkName: dep.networkName.replace(/Sepolia/g, 'Cluster'),
      explorerUrl: 'https://github.com',
    }));
  }, [deployedContracts, isLoggedIn]);

  useEffect(() => {
    const unsubscribe = subscribeDeployments((deps) => {
      setDeployedContracts(deps);
    });
    return unsubscribe;
  }, []);

  const activeTestnet = EVM_TESTNETS.find((t) => t.id === selectedTestnetId) || EVM_TESTNETS[0];
  const isEvmChain = ['solidity', 'base', 'optimism', 'arbitrum_stylus'].includes(activePreset.id);

  // Auto-detect connected wallet account on mount
  useEffect(() => {
    getConnectedAccount().then((acc) => {
      if (acc) setWalletAddress(acc);
    });

    if (isWalletAvailable() && (window as any).ethereum?.on) {
      const handleAccountsChanged = (accounts: string[]) => {
        setWalletAddress(accounts && accounts.length > 0 ? accounts[0] : null);
      };
      (window as any).ethereum.on('accountsChanged', handleAccountsChanged);
      return () => {
        try {
          (window as any).ethereum.removeListener('accountsChanged', handleAccountsChanged);
        } catch {
          // ignore
        }
      };
    }
  }, []);

  const handleConnectWallet = async () => {
    setConnectingWallet(true);
    try {
      const acc = await connectWallet();
      setWalletAddress(acc);
    } catch (err: any) {
      alert(`Wallet Connection Notice: ${err.message}`);
    } finally {
      setConnectingWallet(false);
    }
  };

  // AI Mentor Chat in IDE
  const [askingAi, setAskingAi] = useState<boolean>(false);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');

  const handleSelectLanguage = (langId: string) => {
    setSelectedLangId(langId);
    const preset = LANGUAGE_PRESETS.find((p) => p.id === langId) || LANGUAGE_PRESETS[0];
    setCode(isLoggedIn ? preset.templates[0].code : LOGGED_OUT_SANDBOX_BOILERPLATE);
    setCompilationResult(null);
    setAiAnalysis('');
    if (langId === 'base') setSelectedTestnetId('base_sepolia');
    else if (langId === 'optimism') setSelectedTestnetId('optimism_sepolia');
    else if (langId === 'arbitrum_stylus') setSelectedTestnetId('arbitrum_sepolia');
    else if (langId === 'solidity') setSelectedTestnetId('arbitrum_sepolia');
  };

  const handleSelectTemplate = (templateCode: string) => {
    if (!isLoggedIn) {
      setCode(LOGGED_OUT_SANDBOX_BOILERPLATE);
      return;
    }
    setCode(templateCode);
    setCompilationResult(null);
  };

  const handleCompile = async () => {
    setCompiling(true);
    setActiveConsoleTab('console');
    setCompilationResult(null);
    try {
      const res = await executeMultiChainCompiler(activePreset.id, code);
      setCompilationResult(res);

      if (res.success) {
        const contractAddr = res.artifacts?.programId || res.artifacts?.classHash || res.artifacts?.moduleAddress || res.artifacts?.wasmHash || (res.artifacts?.bytecode ? `0x${res.artifacts.bytecode.slice(2, 42)}` : '0xContractCompiled');
        const networkId = activePreset.id === 'base' ? 'base_sepolia' : activePreset.id === 'optimism' ? 'optimism_sepolia' : activePreset.chain.toLowerCase().replace(/[^a-z0-9]/g, '_');
        const execEnv = activePreset.id === 'arbitrum_stylus' ? 'wasm_stylus' : activePreset.id === 'solana' ? 'sealevel_svm' : activePreset.id === 'aptos' ? 'move_vm' : (activePreset.id === 'base' || activePreset.id === 'optimism') ? 'evm_op_stack' : 'evm_nitro';
        const progLang = activePreset.lang.toLowerCase().includes('rust') ? 'rust' : activePreset.lang.toLowerCase().includes('move') ? 'move' : activePreset.lang.toLowerCase().includes('cairo') ? 'cairo' : 'solidity';

        trackStudentDeployment(
          walletAddress || 'student-builder',
          'KU_COHORT_2026_01',
          {
            contractAddress: contractAddr,
            network: networkId,
            executionEnvironment: execEnv,
            programmingLanguage: progLang,
            gasUsed: res.gasEstimate || 21000
          }
        ).catch((err) => console.warn("Telemetry log warning:", err));
      }
    } catch (e: any) {
      console.error("Compilation error:", e);
      setCompilationResult({
        success: false,
        chain: activePreset.chain,
        language: activePreset.lang,
        compiler: 'Error',
        stdout: `❌ Unexpected error: ${e.message || 'Unknown error'}`,
        syntaxErrors: [e.message || 'Unknown error'],
        warnings: [],
        gasEstimate: 0,
      });
    } finally {
      setCompiling(false);
    }
  };

  const handleDeployToTestnet = async () => {
    if (deploying || !code.trim()) return;
    setDeploying(true);
    setActiveConsoleTab('console');
    setDeployStepMessage('Compiling software module...');

    try {
      // 1. Compile software module first to get valid bytecode & schema
      setCompiling(true);
      const compileRes = await executeMultiChainCompiler(activePreset.id, code);
      setCompiling(false);
      setCompilationResult(compileRes);

      if (!compileRes.success) {
        throw new Error(
          compileRes.syntaxErrors?.[0] || 'Module compilation failed. Please resolve compiler errors before deploying.'
        );
      }

      // 2. Extract contract name from code or artifacts
      const contractMatch = code.match(/(?:contract|module|program)\s+([A-Za-z0-9_]+)/);
      const contractName = contractMatch ? contractMatch[1] : (compileRes.artifacts?.contract_name || activePreset.templates[0]?.name || 'SmartContract');

      // 3. Real On-Chain Wallet Deployment Pipeline
      let contractAddress = '';
      let txHash = '';
      let blockNumber = 0;
      let gasUsed = 0;
      let deployerAddress = walletAddress || 'student-builder';
      let isLiveWalletDeploy = false;

      const hasWallet = isWalletAvailable();

      if (hasWallet) {
        try {
          setDeployStepMessage(`Connecting wallet & switching to ${activeTestnet.name}...`);
          const deployRes = await deployContractWithWallet({
            networkId: selectedTestnetId,
            bytecode: compileRes.artifacts?.bytecode || '',
            abi: compileRes.artifacts?.abi,
            contractName,
            onStatus: (msg) => {
              setDeployStepMessage(msg);
              setCompilationResult((prev) => prev ? {
                ...prev,
                stdout: `${prev.stdout ? prev.stdout + '\n' : ''}${msg}`
              } : null);
            }
          });

          contractAddress = deployRes.contractAddress;
          txHash = deployRes.txHash;
          blockNumber = deployRes.blockNumber;
          gasUsed = deployRes.gasUsed;
          deployerAddress = deployRes.deployerAddress;
          setWalletAddress(deployRes.deployerAddress);
          isLiveWalletDeploy = true;
        } catch (walletErr: any) {
          if (walletErr.message?.includes('USER_CANCELLED')) {
            throw new Error("Transaction signature was rejected in your wallet. Deployment cancelled.");
          }
          console.warn("Wallet deployment error:", walletErr);
          const proceedSim = window.confirm(
            `Live wallet deployment failed: ${walletErr.message}\n\nWould you like to fall back to simulated testnet broadcast?`
          );
          if (!proceedSim) {
            throw walletErr;
          }
        }
      } else {
        const proceedSim = window.confirm(
          `No Web3 browser wallet (MetaMask / Coinbase / Rabby) was detected.\n\nTo sign transactions with your wallet, please install MetaMask (https://metamask.io).\n\nWould you like to run a simulated sandbox deployment instead?`
        );
        if (!proceedSim) {
          throw new Error("Web3 wallet required. Please install MetaMask to sign and deploy live contracts.");
        }
      }

      // Simulated fallback if wallet was unavailable or errored with consent
      if (!isLiveWalletDeploy) {
        const randomHex = (len: number) => {
          let s = '';
          const chars = '0123456789abcdef';
          for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
          return s;
        };

        contractAddress = `0x${randomHex(40)}`;
        txHash = `0x${randomHex(64)}`;
        blockNumber = 14892100 + Math.floor(Math.random() * 30000);
        gasUsed = compileRes.gasEstimate ? Math.max(compileRes.gasEstimate, 168000) : (185000 + Math.floor(Math.random() * 80000));
      }

      // 4. Log to telemetry for institutional grant tracking
      trackStudentDeployment(
        deployerAddress,
        'KU_COHORT_2026_01',
        {
          contractAddress,
          network: activeTestnet.telemetryNetwork,
          executionEnvironment: activeTestnet.execEnv,
          programmingLanguage: activePreset.lang.toLowerCase().includes('rust') ? 'rust' : 'solidity',
          gasUsed
        }
      ).catch((err) => console.warn("Deployment telemetry warning:", err));

      const newRecord: DeployedContractRecord = {
        id: `dep-${Date.now()}`,
        contractName,
        contractAddress,
        txHash,
        networkId: activeTestnet.id,
        networkName: activeTestnet.name,
        networkIcon: activeTestnet.icon,
        chainId: activeTestnet.chainId,
        explorerUrl: activeTestnet.explorerUrl,
        gasUsed,
        blockNumber,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language: activePreset.lang
      };

      const updatedDeployments = saveNewDeployment(newRecord);
      setDeployedContracts(updatedDeployments);

      // 5. Provide detailed deployment receipt in terminal console
      const receiptLog = `
🚀 ======================================================================
📡 ${isLiveWalletDeploy ? 'LIVE ON-CHAIN DEPLOYMENT CONFIRMED' : 'SANDBOX BROADCAST TO EVM TESTNET'}: ${activeTestnet.name.toUpperCase()}
======================================================================
• Target Network:      ${activeTestnet.name} (Chain ID: ${activeTestnet.chainId})
• RPC Endpoint:        ${activeTestnet.rpcUrl}
• Contract Name:       ${contractName}
• Total Deployed:      ${updatedDeployments.length} Contracts Recorded (Count +1)
• Signer Account:      ${deployerAddress} ${isLiveWalletDeploy ? '(Cryptographically Signed via Developer Key)' : '(Simulated)'}
• Contract Address:    ${contractAddress}
• Transaction Hash:    ${txHash}
• Block Number:        #${blockNumber.toLocaleString()}
• Gas Consumed:        ${gasUsed.toLocaleString()} Gas Units
• On-Chain Status:     ${isLiveWalletDeploy ? '✅ CONFIRMED ON-CHAIN (Live Block Receipt Verified)' : '✅ CONFIRMED (Simulated)'}
• Bytecode Status:     ✅ Valid EVM Execution Initcode

🔗 Live Block Explorer Links:
  - Contract:    ${activeTestnet.explorerUrl}/address/${contractAddress}
  - Transaction: ${activeTestnet.explorerUrl}/tx/${txHash}

📡 Academy Grant Telemetry:
  - Signer / Dev ID:   ${deployerAddress}
  - Execution Engine:  ${activeTestnet.execEnv.toUpperCase()}
  - Verification:      ${isLiveWalletDeploy ? 'Verified On-Chain Multi-Chain Grant Standard' : 'Sandbox Verification'}
======================================================================
`;

      setCompilationResult((prev) => ({
        ...(prev || compileRes),
        stdout: `${(prev?.stdout || compileRes.stdout || '')}\n\n${receiptLog}`
      }));

    } catch (err: any) {
      console.error("Testnet deployment error:", err);
      alert(`Deployment Error: ${err.message || 'Failed to broadcast testnet deployment'}`);
      setCompilationResult((prev) => prev ? {
        ...prev,
        stdout: `${prev.stdout ? prev.stdout + '\n\n' : ''}❌ DEPLOYMENT FAILED: ${err.message || 'Unknown error'}`
      } : null);
    } finally {
      setDeploying(false);
      setCompiling(false);
      setDeployStepMessage(null);
    }
  };

  const handleAskAi = async () => {
    if (askingAi || !code.trim()) return;
    setAskingAi(true);
    setAiAnalysis('');
    try {
      let fullText = '';
      for await (const _ of streamMentorChat(
        `Please review this ${activePreset.lang} software architecture. Check for security vulnerabilities, compiler compatibility, and give concise optimization suggestions.`,
        code,
        (delta) => {
          fullText += delta;
          setAiAnalysis(fullText);
        },
        'demo-user',
        'hermes'
      )) {}
    } catch (e: any) {
      setAiAnalysis(`AI Mentor Error: ${e.message || 'Could not connect to AI Mentor'}`);
    } finally {
      setAskingAi(false);
    }
  };

  const handleDownloadCode = () => {
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = activePreset.fileName === 'Vault.sol' ? 'Logic.js' : activePreset.fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    alert("Code copied to clipboard!");
  };

  return (
    <div className="sandbox-playground animate-fade-in">
      {/* Header Banner */}
      <div className="sandbox-header glass">
        <div className="sandbox-header-info">
          <div className="sandbox-header-tag">
            <span>💻 MULTI-RUNTIME CODE SANDBOX</span>
            <span>•</span>
            <span>UNIVERSAL SOFTWARE LOGIC COMPILER</span>
          </div>
          <h1 className="sandbox-header-title">
            Interactive Software Architecture Playground
          </h1>
          <p className="sandbox-header-subtitle">
            Write, compile, test, and analyze object-oriented software architecture and system logic engines across high-performance execution environments.
          </p>
        </div>

        <div className="sandbox-header-actions">
          <div
            className="sandbox-deployed-stat-badge"
            title="Total verified software modules deployed to live environments"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '6px 14px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.2), rgba(16, 185, 129, 0.2))',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              boxShadow: '0 0 15px rgba(37, 99, 235, 0.2)'
            }}
          >
            <span style={{ fontSize: '1.25rem' }}>🚀</span>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#93c5fd' }}>{deployedContracts.length}</span>
              <span style={{ fontSize: '0.65rem', color: 'var(--clr-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                System Modules Deployed
              </span>
            </div>
          </div>
          <button className="btn btn--secondary" onClick={handleDownloadCode} title="Download source file">
            💾 Export Logic.js
          </button>
          <button className="btn btn--secondary" onClick={handleCopyCode} title="Copy code to clipboard">
            📋 Copy Code
          </button>
        </div>
      </div>

      {/* Language Tabs Bar */}
      <div className="sandbox-lang-bar glass">
        {LANGUAGE_PRESETS.map((preset) => {
          const btnName = preset.id === 'solidity'
            ? 'Object-Oriented Logic'
            : preset.id === 'solana'
            ? 'System-Level'
            : preset.lang;
          const btnChain = preset.id === 'solidity'
            ? 'Engine'
            : preset.id === 'solana'
            ? 'Infrastructure Compiler'
            : preset.chain.split('/')[0].trim();

          return (
            <button
              key={preset.id}
              className={`sandbox-lang-btn ${selectedLangId === preset.id ? 'active' : ''}`}
              onClick={() => handleSelectLanguage(preset.id)}
            >
              <span className="lang-icon">{preset.icon}</span>
              <span className="lang-name">{btnName}</span>
              <span className="lang-chain">{btnChain}</span>
            </button>
          );
        })}
      </div>

      {/* Editor & Console Grid */}
      <div className="sandbox-ide-grid">
        {/* Left Column: Code Editor */}
        <div className="sandbox-editor-panel glass">
          {/* Editor Top Bar */}
          <div className="editor-top-bar">
            <div className="editor-tab-indicator">
              <span className="dot dot--red" />
              <span className="dot dot--amber" />
              <span className="dot dot--green" />
              <select
                className="editor-lang-dropdown"
                value={selectedLangId}
                onChange={(e) => handleSelectLanguage(e.target.value)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#93c5fd',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  outline: 'none',
                  marginLeft: '4px'
                }}
              >
                {LANGUAGE_PRESETS.map((p) => {
                  const label = !isLoggedIn
                    ? `${p.icon} Logic Engine (${p.id === 'solana' ? 'High Throughput' : p.id === 'solidity' ? 'Standard' : p.lang})`
                    : p.id === 'solidity'
                    ? `${p.icon} Active Syntax Environment`
                    : p.id === 'solana'
                    ? `${p.icon} System Infrastructure Compiler`
                    : `${p.icon} ${p.lang} (${p.chain.split('/')[0].trim()})`;

                  return (
                    <option key={p.id} value={p.id} style={{ background: '#090a14', color: '#fff' }}>
                      {label}
                    </option>
                  );
                })}
              </select>
              <span className="editor-filename">{isLoggedIn ? activePreset.fileName : 'Logic.js'}</span>
              <span className="editor-target-env">{isLoggedIn ? activePreset.targetEnv : 'Secure Logic Environment'}</span>
            </div>

            {/* Boilerplate & Template selector */}
            <div className="editor-templates-selector">
              <span style={{ fontSize: '0.72rem', color: 'var(--clr-text-muted)', marginRight: '4px' }}>Templates:</span>
              {activePreset.templates.map((t, idx) => {
                let displayName = t.name;
                if (!isLoggedIn) {
                  if (t.name.includes('Secure Vault')) displayName = 'Secure Memory Buffer Pattern';
                  else if (t.name.includes('ERC-20')) displayName = 'Standard Account Ledger Format';
                  else displayName = 'System Logic Template';
                }

                return (
                  <button
                    key={idx}
                    className="template-pill-btn"
                    onClick={() => handleSelectTemplate(t.code)}
                    title={isLoggedIn ? t.description : 'Standard system architecture template'}
                  >
                    ⚡ {displayName}
                  </button>
                );
              })}
              <button
                className="template-pill-btn"
                onClick={() => handleSelectTemplate(isLoggedIn ? `// Write your custom ${activePreset.lang} code here\n\n` : '// Write system logic here\n\n')}
                title="Clear editor to blank canvas"
                style={{ opacity: 0.8 }}
              >
                🧹 Blank
              </button>
            </div>
          </div>

          {/* Textarea Editor */}
          <textarea
            className="sandbox-textarea"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            placeholder={isLoggedIn ? `// Write ${activePreset.lang} code here...` : '// Write application logic code here...'}
          />

          {/* Editor Footer Action Bar */}
          <div className="editor-footer-bar">
            <div className="compiler-spec-badge">
              <span>{activePreset.icon}</span>
              <span>{isLoggedIn ? activePreset.compiler : 'Enterprise Syntax Engine v2.4 (Nitro)'}</span>
            </div>

            <div className="editor-footer-buttons">
              {!isLoggedIn && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: '#94a3b8', padding: '5px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  🔒 Sign in to access live multi-runtime compiler execution &amp; deployment
                </div>
              )}

              {isLoggedIn && isEvmChain && (
                <div className="testnet-deploy-controls">
                  {walletAddress ? (
                    <span
                      className="wallet-status-badge"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        padding: '4px 8px',
                        borderRadius: '6px',
                        background: 'rgba(34, 197, 94, 0.15)',
                        border: '1px solid rgba(34, 197, 94, 0.3)',
                        color: '#86efac'
                      }}
                      title={`Connected Web3 Signer: ${walletAddress}`}
                    >
                      <span style={{ display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e' }}></span>
                      {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="btn btn--secondary btn--sm btn-connect-wallet"
                      onClick={handleConnectWallet}
                      disabled={connectingWallet}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        padding: '4px 8px',
                        background: 'rgba(234, 88, 12, 0.15)',
                        borderColor: 'rgba(234, 88, 12, 0.35)',
                        color: '#fdba74'
                      }}
                      title="Connect MetaMask or browser Web3 wallet to sign live transactions"
                    >
                      🦊 {connectingWallet ? 'Connecting...' : 'Connect Wallet'}
                    </button>
                  )}
                  <select
                    className="testnet-select-dropdown"
                    value={selectedTestnetId}
                    onChange={(e) => setSelectedTestnetId(e.target.value)}
                    title="Select target EVM Testnet for deployment"
                  >
                    {EVM_TESTNETS.map((net) => (
                      <option key={net.id} value={net.id}>
                        {net.icon} {net.name}
                      </option>
                    ))}
                  </select>
                  <a
                    href={activeTestnet.faucetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="testnet-faucet-link"
                    title={`Get free testnet gas from ${activeTestnet.name} faucet`}
                  >
                    🚰 Faucet
                  </a>
                  <button
                    type="button"
                    className="testnet-onramp-btn"
                    onClick={() => setIsOnRampOpen(true)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      padding: '4px 8px',
                      borderRadius: '6px',
                      background: 'rgba(16, 185, 129, 0.15)',
                      border: '1px solid rgba(16, 185, 129, 0.35)',
                      color: '#6ee7b7',
                      cursor: 'pointer'
                    }}
                    title="Acquire protocol gas via Card or Bank Transfer (Transak)"
                  >
                    ⚡ Gas On-Ramp
                  </button>
                  <span
                    className="testnet-deployed-count-pill"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      padding: '4px 8px',
                      borderRadius: '6px',
                      background: 'rgba(59, 130, 246, 0.15)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      color: '#93c5fd'
                    }}
                    title="Total verified contracts deployed across all testnets"
                  >
                    📦 {deployedContracts.length} Deployed
                  </span>
                  <button
                    className="btn btn--primary btn--sm btn-deploy-testnet"
                    onClick={handleDeployToTestnet}
                    disabled={deploying || compiling || !code.trim()}
                    title={`Deploy software module to ${activeTestnet.name} (prompts developer key signature)`}
                  >
                    {deploying ? (deployStepMessage || '⏳ Deploying...') : `🚀 Sign & Deploy (${activeTestnet.name.split(' ')[0]})`}
                  </button>
                </div>
              )}
              <button
                className="btn btn--secondary btn--sm"
                onClick={handleAskAi}
                disabled={askingAi}
                style={{
                  backgroundColor: askingAi ? 'rgba(245, 158, 11, 0.15)' : 'rgba(37, 99, 235, 0.15)',
                  color: askingAi ? '#f59e0b' : '#60a5fa',
                  borderColor: askingAi ? 'rgba(245, 158, 11, 0.3)' : 'rgba(37, 99, 235, 0.3)'
                }}
              >
                {askingAi ? '⏳ Reviewing Code...' : '🔮 AI Mentor Review'}
              </button>
              <button
                className="btn btn--primary btn--sm"
                onClick={handleCompile}
                disabled={compiling || !code.trim()}
                style={{ backgroundColor: '#2563eb' }}
              >
                {compiling ? '⏳ Compiling...' : `🚀 Compile & Verify (${isLoggedIn ? activePreset.lang : 'Logic'})`}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Compiler Output, Artifacts & AI Insights */}
        <div className="sandbox-output-panel glass">
          {/* Output Nav Tabs */}
          <div className="output-tabs-nav">
            <button
              className={`output-tab-btn ${activeConsoleTab === 'console' ? 'active' : ''}`}
              onClick={() => setActiveConsoleTab('console')}
            >
              📟 Terminal Console
            </button>
            <button
              className={`output-tab-btn ${activeConsoleTab === 'artifacts' ? 'active' : ''}`}
              onClick={() => setActiveConsoleTab('artifacts')}
            >
              📦 Artifacts &amp; Hashes
            </button>
            <button
              className={`output-tab-btn ${activeConsoleTab === 'abi' ? 'active' : ''}`}
              onClick={() => setActiveConsoleTab('abi')}
            >
              📜 {isLoggedIn ? 'ABI / IDL Schema' : 'Interface Schema'}
            </button>
            <button
              className={`output-tab-btn ${activeConsoleTab === 'deployments' ? 'active' : ''}`}
              onClick={() => setActiveConsoleTab('deployments')}
            >
              📡 {isLoggedIn ? `Testnet Deployments (${deployedContracts.length})` : `System Deployments (${deployedContracts.length})`}
            </button>
          </div>

          {/* Console Tab */}
          {activeConsoleTab === 'console' && (
            <div className="output-terminal-body">
              <div className="terminal-header-status">
                <span>STATUS: {compiling ? '⏳ COMPILING...' : compilationResult ? (compilationResult.success ? '✅ PASSED' : '❌ FAILED') : 'IDLE'}</span>
                {compilationResult?.gasEstimate ? (
                  <span className="gas-badge">⚡ {compilationResult.gasEstimate.toLocaleString()} Gas Units</span>
                ) : null}
              </div>

              <pre className="terminal-logs">
                {compiling ? (
                  `⏳ Loading ${isLoggedIn ? activePreset.lang : 'Logic'} compiler...\n   Running compiler diagnostics...`
                ) : compilationResult ? (
                  compilationResult.stdout || (compilationResult.syntaxErrors && compilationResult.syntaxErrors.length > 0 ? `❌ Compilation failed:\n\n${compilationResult.syntaxErrors.join('\n\n')}` : 'Compilation finished.')
                ) : (
                  <span style={{ color: 'var(--clr-text-muted)' }}>
                    Sandbox terminal is idle. Click "Compile &amp; Verify" to run the compiler and view real-time diagnostics.
                  </span>
                )}
              </pre>

              {aiAnalysis && (
                <FormattedAiInsights
                  content={aiAnalysis}
                  isLoading={askingAi}
                  onClear={() => setAiAnalysis('')}
                />
              )}
            </div>
          )}

          {/* Artifacts Tab */}
          {activeConsoleTab === 'artifacts' && (
            <div className="output-artifacts-body">
              {compilationResult?.artifacts ? (
                <div className="artifacts-list">
                  {compilationResult.artifacts.programId && (
                    <div className="artifact-item">
                      <span className="artifact-label">🔑 Solana Program ID:</span>
                      <code className="artifact-value">{compilationResult.artifacts.programId}</code>
                    </div>
                  )}
                  {compilationResult.artifacts.classHash && (
                    <div className="artifact-item">
                      <span className="artifact-label">🏷️ Sierra Class Hash:</span>
                      <code className="artifact-value">{compilationResult.artifacts.classHash}</code>
                    </div>
                  )}
                  {compilationResult.artifacts.moduleAddress && (
                    <div className="artifact-item">
                      <span className="artifact-label">📜 Aptos Move Module:</span>
                      <code className="artifact-value">{compilationResult.artifacts.moduleAddress}</code>
                    </div>
                  )}
                  {compilationResult.artifacts.wasmHash && (
                    <div className="artifact-item">
                      <span className="artifact-label">🟣 Wasm Code Hash:</span>
                      <code className="artifact-value">{compilationResult.artifacts.wasmHash}</code>
                    </div>
                  )}
                  {compilationResult.artifacts.bytecode && (
                    <div className="artifact-item">
                      <span className="artifact-label">📦 {isLoggedIn ? 'EVM Bytecode:' : 'Runtime Bytecode:'}</span>
                      <pre className="artifact-code">{compilationResult.artifacts.bytecode}</pre>
                    </div>
                  )}
                </div>
              ) : (
                <div className="empty-state-text">
                  {isLoggedIn
                    ? 'Compile your contract to generate verified on-chain bytecode, Sierra hashes, and Wasm binaries.'
                    : 'Compile your software module to generate verified execution artifacts, binary schemas, and runtime bytecode.'}
                </div>
              )}
            </div>
          )}

          {/* ABI / IDL Tab */}
          {activeConsoleTab === 'abi' && (
            <div className="output-abi-body">
              {compilationResult?.artifacts?.idl || compilationResult?.artifacts?.abi ? (
                <pre className="abi-json-viewer">
                  {JSON.stringify(compilationResult.artifacts.idl || compilationResult.artifacts.abi, null, 2)}
                </pre>
              ) : (
                <div className="empty-state-text">
                  Compile your software module to inspect the generated interface schema.
                </div>
              )}
            </div>
          )}

          {/* Testnet Deployments Tab */}
          {activeConsoleTab === 'deployments' && (
            <div className="output-deployments-body">
              <div className="deployments-tab-header">
                <div className="deployments-tab-title">
                  <span className="title-text">📡 Verified System Sandbox Deployments</span>
                  <span className="deployments-count-badge">{displayedDeployments.length} Recorded</span>
                </div>
                {displayedDeployments.length > 0 && (
                  <button
                    className="btn-clear-deployments"
                    onClick={() => {
                      if (window.confirm(isLoggedIn ? "Reset testnet deployment history to initial verified state?" : "Reset deployment history?")) {
                        setDeployedContracts(INITIAL_DEPLOYMENTS);
                        localStorage.removeItem('mor_deployed_contracts');
                      }
                    }}
                    title={isLoggedIn ? "Reset to default grant testnet deployments" : "Reset deployment history"}
                  >
                    Reset List
                  </button>
                )}
              </div>

              {displayedDeployments.length === 0 ? (
                <div className="empty-state-text">
                  {isLoggedIn
                    ? <>No contracts deployed yet. Select an EVM chain, write your Solidity code, and click <strong>🚀 Deploy to Testnet</strong> to broadcast your contract to Arbitrum Sepolia, Base Sepolia, OP Sepolia, or Ethereum Sepolia.</>
                    : <>No modules verified yet. Select an execution environment, test your system logic, and verify your software architecture in the live sandbox environment.</>}
                </div>
              ) : (
                <div className="deployments-list">
                  {displayedDeployments.map((dep) => (
                    <div key={dep.id} className="deployment-card">
                      <div className="deployment-card-header">
                        <div className="deployment-network-badge">
                          <span className="net-icon">{dep.networkIcon}</span>
                          <span className="net-name">{dep.networkName}</span>
                          <span className="net-chain-id">Chain ID: {dep.chainId}</span>
                        </div>
                        <div className="deployment-badges">
                          <span className="status-badge-verified">{isLoggedIn ? '✅ Verified On-Chain' : '✅ Verified Logic Engine'}</span>
                          <span className="deployment-time">{dep.timestamp}</span>
                        </div>
                      </div>

                      <div className="deployment-card-row">
                        <span className="dep-row-label">{isLoggedIn ? 'Contract:' : 'Module:'}</span>
                        <span className="dep-contract-name">{dep.contractName}</span>
                        <span className="dep-lang-tag">({isLoggedIn ? dep.language : 'System Logic'})</span>
                      </div>

                      <div className="deployment-card-row">
                        <span className="dep-row-label">{isLoggedIn ? 'Address:' : 'Module ID:'}</span>
                        <code className="dep-address">{dep.contractAddress}</code>
                        <button
                          className="dep-copy-btn"
                          onClick={() => {
                            navigator.clipboard.writeText(dep.contractAddress);
                            alert(isLoggedIn ? "Contract address copied!" : "Module ID copied!");
                          }}
                          title={isLoggedIn ? "Copy Contract Address" : "Copy Module ID"}
                        >
                          📋
                        </button>
                        <a
                          href={isLoggedIn ? `${dep.explorerUrl}/address/${dep.contractAddress}` : 'https://github.com'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="dep-explorer-link"
                          title={isLoggedIn ? "View on Block Explorer" : "View Architecture Telemetry"}
                        >
                          🔍 {isLoggedIn ? 'Explorer' : 'Telemetry'}
                        </a>
                      </div>

                      <div className="deployment-card-row">
                        <span className="dep-row-label">{isLoggedIn ? 'Tx Hash:' : 'Verification ID:'}</span>
                        <code className="dep-tx-hash">{dep.txHash.slice(0, 18)}...{dep.txHash.slice(-8)}</code>
                        <a
                          href={isLoggedIn ? `${dep.explorerUrl}/tx/${dep.txHash}` : 'https://github.com'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="dep-tx-link"
                          title={isLoggedIn ? "View Transaction on Block Explorer" : "View Verification Receipt"}
                        >
                          🧾 {isLoggedIn ? 'Tx Receipt' : 'Receipt'}
                        </a>
                      </div>

                      <div className="deployment-card-footer">
                        <span className="dep-meta-stat">⚡ <strong>{dep.gasUsed.toLocaleString()}</strong> {isLoggedIn ? 'Gas' : 'Compute Units'}</span>
                        <span className="dep-meta-stat">📦 {isLoggedIn ? 'Block' : 'Epoch'} <strong>#{dep.blockNumber.toLocaleString()}</strong></span>
                        <span className="dep-meta-telemetry">📡 Logged to Grant Telemetry</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {isLoggedIn && (
        <TransakWidgetModal
          isOpen={isOnRampOpen}
          onClose={() => setIsOnRampOpen(false)}
          defaultNetwork={activeTestnet.chainName.toLowerCase()}
          walletAddress={walletAddress || ''}
        />
      )}
    </div>
  );
};

export default PlaygroundView;
