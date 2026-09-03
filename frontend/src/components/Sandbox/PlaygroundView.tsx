import React, { useState } from 'react';
import { executeMultiChainCompiler } from '../../services/sandboxCompiler';
import type { CompilationResult } from '../../types';
import { streamMentorChat } from '../../api/client';
import { trackStudentDeployment } from '../../services/telemetry';
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

export const PlaygroundView: React.FC = () => {
  const [selectedLangId, setSelectedLangId] = useState<string>('solidity');
  const activePreset = LANGUAGE_PRESETS.find((p) => p.id === selectedLangId) || LANGUAGE_PRESETS[0];

  const [code, setCode] = useState<string>(activePreset.templates[0].code);
  const [compiling, setCompiling] = useState<boolean>(false);
  const [compilationResult, setCompilationResult] = useState<CompilationResult | null>(null);
  const [activeConsoleTab, setActiveConsoleTab] = useState<'console' | 'artifacts' | 'abi'>('console');
  
  // AI Mentor Chat in IDE
  const [askingAi, setAskingAi] = useState<boolean>(false);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');

  const handleSelectLanguage = (langId: string) => {
    setSelectedLangId(langId);
    const preset = LANGUAGE_PRESETS.find((p) => p.id === langId) || LANGUAGE_PRESETS[0];
    setCode(preset.templates[0].code);
    setCompilationResult(null);
    setAiAnalysis('');
  };

  const handleSelectTemplate = (templateCode: string) => {
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
          'student-builder',
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

  const handleAskAi = async () => {
    if (askingAi || !code.trim()) return;
    setAskingAi(true);
    setAiAnalysis('');
    try {
      let fullText = '';
      for await (const _ of streamMentorChat(
        `Please review this ${activePreset.lang} smart contract. Check for security vulnerabilities, compiler compatibility, and give concise optimization suggestions.`,
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
    link.download = activePreset.fileName;
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
            <span>💻 MULTI-CHAIN CODE SANDBOX</span>
            <span>•</span>
            <span>UNIVERSAL WEB3 COMPILER</span>
          </div>
          <h1 className="sandbox-header-title">Interactive Smart Contract Playground</h1>
          <p className="sandbox-header-subtitle">
            Write, compile, test, and analyze smart contracts across <strong>Solidity, Rust (Anchor &amp; Stylus), Move, Cairo 2.0, and ink! Wasm</strong> with real Web3 toolchains and AI Mentor assistance.
          </p>
        </div>

        <div className="sandbox-header-actions">
          <button className="btn btn--secondary" onClick={handleDownloadCode} title="Download source file">
            💾 Export {activePreset.fileName}
          </button>
          <button className="btn btn--secondary" onClick={handleCopyCode} title="Copy code to clipboard">
            📋 Copy Code
          </button>
        </div>
      </div>

      {/* Language Tabs Bar */}
      <div className="sandbox-lang-bar glass">
        {LANGUAGE_PRESETS.map((preset) => (
          <button
            key={preset.id}
            className={`sandbox-lang-btn ${selectedLangId === preset.id ? 'active' : ''}`}
            onClick={() => handleSelectLanguage(preset.id)}
          >
            <span className="lang-icon">{preset.icon}</span>
            <span className="lang-name">{preset.lang}</span>
            <span className="lang-chain">{preset.chain.split('/')[0].trim()}</span>
          </button>
        ))}
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
                {LANGUAGE_PRESETS.map((p) => (
                  <option key={p.id} value={p.id} style={{ background: '#090a14', color: '#fff' }}>
                    {p.icon} {p.lang} ({p.chain.split('/')[0].trim()})
                  </option>
                ))}
              </select>
              <span className="editor-filename">{activePreset.fileName}</span>
              <span className="editor-target-env">{activePreset.targetEnv}</span>
            </div>

            {/* Boilerplate & Template selector */}
            <div className="editor-templates-selector">
              <span style={{ fontSize: '0.72rem', color: 'var(--clr-text-muted)', marginRight: '4px' }}>Templates:</span>
              {activePreset.templates.map((t, idx) => (
                <button
                  key={idx}
                  className="template-pill-btn"
                  onClick={() => handleSelectTemplate(t.code)}
                  title={t.description}
                >
                  ⚡ {t.name}
                </button>
              ))}
              <button
                className="template-pill-btn"
                onClick={() => handleSelectTemplate(`// Write your custom ${activePreset.lang} code here\n\n`)}
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
            placeholder={`// Write ${activePreset.lang} code here...`}
          />

          {/* Editor Footer Action Bar */}
          <div className="editor-footer-bar">
            <div className="compiler-spec-badge">
              <span>{activePreset.icon}</span>
              <span>{activePreset.compiler}</span>
            </div>

            <div className="editor-footer-buttons">
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
                {compiling ? '⏳ Compiling...' : `🚀 Compile & Verify (${activePreset.lang})`}
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
              📜 ABI / IDL Schema
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
                  `⏳ Loading ${activePreset.lang} compiler...\n   Running compiler diagnostics...`
                ) : compilationResult ? (
                  compilationResult.stdout || (compilationResult.syntaxErrors && compilationResult.syntaxErrors.length > 0 ? `❌ Compilation failed:\n\n${compilationResult.syntaxErrors.join('\n\n')}` : 'Compilation finished.')
                ) : (
                  <span style={{ color: 'var(--clr-text-muted)' }}>
                    Sandbox terminal is idle. Click "Compile &amp; Verify" to run the compiler and view real-time diagnostics.
                  </span>
                )}
              </pre>

              {aiAnalysis && (
                <div className="ai-analysis-card">
                  <div className="ai-analysis-head">💡 Hermes / OpenClaw AI Mentor Insights:</div>
                  <div className="ai-analysis-content">{aiAnalysis}</div>
                </div>
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
                      <span className="artifact-label">📦 EVM Bytecode:</span>
                      <pre className="artifact-code">{compilationResult.artifacts.bytecode}</pre>
                    </div>
                  )}
                </div>
              ) : (
                <div className="empty-state-text">
                  Compile your contract to generate verified on-chain bytecode, Sierra hashes, and Wasm binaries.
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
                  Compile your smart contract to inspect the generated ABI or Anchor IDL interface.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaygroundView;
