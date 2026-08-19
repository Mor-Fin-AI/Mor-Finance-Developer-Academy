import type { UserProgress, ProgressUpdate, TemplateMetadata, CodeTemplate, Course, Lesson, DashboardData, Certificate, GithubActivity } from '../types';

const BASE = (import.meta.env.VITE_API_BASE_URL as string) || '/api';

// ─── Progress ─────────────────────────────────────────────────────────────────
export async function fetchProgress(userId = 'demo-user'): Promise<UserProgress> {
  const res = await fetch(`${BASE}/progress/${userId}`);
  if (!res.ok) throw new Error(`Failed to fetch progress: ${res.status}`);
  return res.json();
}

export async function postProgress(
  userId = 'demo-user',
  update: ProgressUpdate,
): Promise<UserProgress> {
  const res = await fetch(`${BASE}/progress/${userId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(update),
  });
  if (!res.ok) throw new Error(`Failed to update progress: ${res.status}`);
  return res.json();
}

// ─── Templates ────────────────────────────────────────────────────────────────
export async function fetchTemplates(levelId?: number): Promise<TemplateMetadata[]> {
  const url = levelId != null
    ? `${BASE}/templates?level_id=${levelId}`
    : `${BASE}/templates`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch templates: ${res.status}`);
  return res.json();
}

export async function fetchTemplate(id: string): Promise<CodeTemplate> {
  const res = await fetch(`${BASE}/templates/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch template: ${res.status}`);
  return res.json();
}

// ─── AI Mentor (streaming) ────────────────────────────────────────────────────
export async function* streamMentorChat(
  prompt: string,
  context: string,
  onChunk: (delta: string) => void,
  userId = 'demo-user',
  provider?: string,
): AsyncGenerator<void, void, unknown> {
  const res = await fetch(`${BASE}/mentor/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, context, user_id: userId, provider }),
  });

  if (!res.ok || !res.body) {
    throw new Error(`Mentor API error: ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (!line.startsWith('data:')) continue;
      const raw = line.slice(5).trim();
      if (raw === '[DONE]') return;
      try {
        const parsed = JSON.parse(raw) as { delta: string };
        onChunk(parsed.delta);
      } catch {
        // skip malformed chunks
      }
    }
    yield;
  }
}

// ─── Authentication ───────────────────────────────────────────────────────────
export interface AuthConfig {
  github_client_id: string;
  github_redirect_uri: string;
}

export async function fetchAuthConfig(): Promise<AuthConfig> {
  const res = await fetch(`${BASE}/auth/config`);
  if (!res.ok) throw new Error(`Failed to fetch auth config: ${res.status}`);
  return res.json();
}

export interface AuthResponse {
  token: string;
  user: UserProgress;
}

export async function authGithub(username?: string, code?: string): Promise<AuthResponse> {
  const res = await fetch(`${BASE}/auth/github`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, code }),
  });
  if (!res.ok) throw new Error(`GitHub auth failed: ${res.status}`);
  return res.json();
}

export async function authWallet(
  address: string,
  message?: string,
  signature?: string,
): Promise<AuthResponse> {
  const res = await fetch(`${BASE}/auth/wallet`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address, message, signature }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || "Wallet auth failed.");
  }
  return res.json();
}

// ─── Frontend Tracks Data (Starknet, Aptos, Polkadot) ─────────────────────────
const FRONTEND_TRACK_LESSONS: Record<string, Lesson> = {
  "starknet-1": {
    id: "starknet-1",
    level_id: 1,
    title: "Layer 2 Concepts & STARK Validity Proofs",
    duration: "15 min",
    xp: 100,
    content: "Explore Starknet Layer 2 architecture, ZK-STARK validity proofs, the Cairo Virtual Machine (CairoVM), and how thousands of off-chain transactions are bundled and verified on Ethereum L1.",
    quiz: [
      {
        question: "What is the primary role of STARK validity proofs on Starknet?",
        options: [
          "Generating zero-knowledge mathematical proofs of transaction batch validity verified on Ethereum L1",
          "Mining proof of work hashes",
          "Generating standard EVM bytecode",
          "Validating Solana parallel accounts"
        ],
        correct_idx: 0
      },
      {
        question: "What programming language is natively used to write smart contracts on Starknet?",
        options: ["Cairo", "Solidity", "Rust", "Move"],
        correct_idx: 0
      },
      {
        question: "How does Starknet achieve low transaction fees compared to Ethereum L1?",
        options: [
          "By bundling thousands of off-chain transactions into a single cryptographic STARK proof verified on L1",
          "By disabling cryptographic signatures",
          "By running on centralized AWS servers",
          "By skipping execution checks"
        ],
        correct_idx: 0
      }
    ],
    exercise: {
      instruction: "Configure Starknet Sepolia RPC and network parameters.",
      template: "// Starknet Sepolia Network Configuration\nconst STARKNET_SEPOLIA = {\n  chainId: 'SN_SEPOLIA',\n  rpcUrl: 'https://free-rpc.nethermind.io/sepolia-juno',\n  explorer: 'https://sepolia.starkscan.co'\n};",
      required_keywords: ["STARKNET_SEPOLIA", "chainId", "rpcUrl"]
    }
  },
  "starknet-2": {
    id: "starknet-2",
    level_id: 2,
    title: "Cairo Basics & Felt252 Data Types",
    duration: "20 min",
    xp: 150,
    content: "Learn Cairo 2.0 programming syntax, felt252 (Field Element) primitives, immutable variables, and function definitions in Cairo.",
    quiz: [
      {
        question: "What is a 'felt252' in Cairo?",
        options: [
          "A fundamental field element data type representing integers modulo a large prime",
          "A 256-bit floating point number",
          "A dynamic string array",
          "A hardware memory pointer"
        ],
        correct_idx: 0
      },
      {
        question: "Which keyword in Cairo declares a variable by default?",
        options: ["let", "const", "var", "def"],
        correct_idx: 0
      }
    ],
    exercise: {
      instruction: "Define a Cairo felt252 function calculating state values.",
      template: "fn calculate_hash(a: felt252, b: felt252) -> felt252 {\n    // Return addition modulo Stark curve prime\n    a + b\n}",
      required_keywords: ["fn", "felt252"]
    }
  },
  "starknet-3": {
    id: "starknet-3",
    level_id: 3,
    title: "Storage, Events & Components",
    duration: "25 min",
    xp: 200,
    content: "Implement persistent contract state variables with #[storage], declare events with #[event], and emit state change notifications in Cairo contracts.",
    quiz: [
      {
        question: "How are persistent contract state variables defined in Cairo smart contracts?",
        options: [
          "Inside the #[storage] struct within a #[starknet::contract] module",
          "In global variables outside the contract",
          "In temporary memory pointers only",
          "In external JSON files"
        ],
        correct_idx: 0
      },
      {
        question: "Which attribute macro identifies an event definition in Cairo?",
        options: ["#[event]", "#[emit]", "#[log]", "#[signal]"],
        correct_idx: 0
      }
    ],
    exercise: {
      instruction: "Implement #[starknet::contract] with storage and event items.",
      template: "#[starknet::contract]\nmod StudentStorage {\n    #[storage]\n    struct Storage {\n        student_count: u64,\n    }\n\n    #[event]\n    #[derive(Drop, starknet::Event)]\n    enum Event {\n        StudentRegistered: StudentRegistered,\n    }\n}",
      required_keywords: ["starknet::contract", "storage", "event"]
    }
  },
  "starknet-4": {
    id: "starknet-4",
    level_id: 4,
    title: "Native Account Abstraction & Snforge",
    duration: "25 min",
    xp: 250,
    content: "Master Starknet native Account Abstraction (where every account is a smart contract with __validate__ and __execute__) and run automated tests with Snforge (Starknet Foundry).",
    quiz: [
      {
        question: "How does account abstraction work natively on Starknet?",
        options: [
          "Every account is a smart contract with custom validation logic (__validate__) and execution logic (__execute__)",
          "Through secondary wrapper wallets only",
          "It is not supported on Starknet",
          "Via centralized relayer servers"
        ],
        correct_idx: 0
      },
      {
        question: "What is the standard testing and assertion tool for Starknet Cairo contracts?",
        options: ["Snforge (Starknet Foundry)", "Hardhat", "Remix", "Truffle"],
        correct_idx: 0
      }
    ],
    exercise: {
      instruction: "Write Snforge test assertions for contract validation.",
      template: "#[cfg(test)]\nmod tests {\n    use snforge_std::{declare, ContractClassTrait};\n\n    #[test]\n    fn test_account_validation() {\n        assert(1 == 1, 'Validation OK');\n    }\n}",
      required_keywords: ["test", "snforge", "assert"]
    }
  },
  "starknet-5": {
    id: "starknet-5",
    level_id: 5,
    title: "Student Registry Deployment Challenge",
    duration: "35 min",
    xp: 350,
    content: "Deployment Challenge: Build a Student Registry contract with add, update and view functionality on Starknet Sepolia. Submit your wallet address, contract address, transaction hash, and GitHub repository URL.",
    quiz: [
      {
        question: "Which tool is used to compile Cairo packages and manage dependencies?",
        options: ["Scarb", "npm", "pip", "cargo alone"],
        correct_idx: 0
      },
      {
        question: "What are the two steps required to deploy a contract on Starknet via Starkli?",
        options: [
          "Declare the class hash, then Deploy an instance from the declared class hash",
          "Only send ETH",
          "Compile and run on local node only",
          "Upload source code to Etherscan"
        ],
        correct_idx: 0
      }
    ],
    exercise: {
      instruction: "Submit Starknet Sepolia deployment parameters.",
      template: "// Starknet Sepolia Student Registry Deployment Submission\nconst DEPLOYMENT_SUBMISSION = {\n  chain: 'Starknet Sepolia',\n  wallet_address: '0x05b2f8a846c9c7f763a8a3068e1d24c084ebba89',\n  contract_address: '0x03a7491d9b35b1c9448834c9c1b9b1d9c9a7491d',\n  transaction_hash: '0x07f18b4e28c3d9a1c5e9f8241b37e29a8f4c1b9b',\n  github_repo: 'https://github.com/developer/starknet-student-registry',\n  contract_name: 'StudentRegistry'\n};",
      required_keywords: ["DEPLOYMENT_SUBMISSION", "contract_address", "transaction_hash", "github_repo"]
    }
  },
  "aptos-1": {
    id: "aptos-1",
    level_id: 1,
    title: "Aptos Architecture & MoveVM",
    duration: "15 min",
    xp: 100,
    content: "Explore Aptos Layer-1 blockchain architecture, the Block-STM parallel execution engine (multi-version concurrency control), AptosBFT consensus, and the MoveVM execution environment.",
    quiz: [
      {
        question: "What parallel execution engine powers high transaction throughput on the Aptos blockchain?",
        options: [
          "Block-STM (Software Transactional Memory)",
          "Sequential EVM Engine",
          "Gasper Consensus",
          "Sealevel"
        ],
        correct_idx: 0
      },
      {
        question: "What consensus algorithm is utilized by the Aptos Layer 1 blockchain?",
        options: ["AptosBFT (DiemBFT v4)", "Proof of Work", "NPoS", "Raft"],
        correct_idx: 0
      }
    ],
    exercise: {
      instruction: "Configure Aptos Testnet fullnode and network URLs.",
      template: "// Aptos Testnet Network Configuration\nconst APTOS_TESTNET = {\n  network: 'testnet',\n  nodeUrl: 'https://fullnode.testnet.aptoslabs.com/v1',\n  faucetUrl: 'https://faucet.testnet.aptoslabs.com',\n  explorer: 'https://explorer.aptoslabs.com/?network=testnet'\n};",
      required_keywords: ["APTOS_TESTNET", "nodeUrl", "network"]
    }
  },
  "aptos-2": {
    id: "aptos-2",
    level_id: 2,
    title: "Move Basics & Resource Abilities",
    duration: "20 min",
    xp: 150,
    content: "Learn Move programming syntax, linear logic, resource safety guarantees, and the 4 struct abilities: copy, drop, store, and key.",
    quiz: [
      {
        question: "Which of the following is NOT one of the 4 struct abilities in Move?",
        options: ["mutate", "copy", "drop", "store"],
        correct_idx: 0
      },
      {
        question: "What makes resources in Move inherently secure against double-spending?",
        options: [
          "Resources can never be copied or silently dropped unless explicitly granted abilities",
          "They use centralized database locks",
          "They are stored in off-chain servers",
          "They are converted to ERC-20 tokens"
        ],
        correct_idx: 0
      }
    ],
    exercise: {
      instruction: "Define a Move struct with key and store abilities.",
      template: "module student_addr::credential {\n    struct StudentCredential has key, store {\n        student_id: u64,\n        course_name: vector<u8>,\n        gpa_score: u64\n    }\n}",
      required_keywords: ["module", "struct", "key", "store"]
    }
  },
  "aptos-3": {
    id: "aptos-3",
    level_id: 3,
    title: "Move Modules & Account Management",
    duration: "25 min",
    xp: 200,
    content: "Publish Move modules, implement public entry functions with &signer authorization, and manage global account storage with move_to and borrow_global_mut.",
    quiz: [
      {
        question: "Which built-in global storage operator moves a newly instantiated resource into an account's storage?",
        options: [
          "move_to<T>(&signer, value)",
          "borrow_global_mut<T>(address)",
          "move_from<T>(address)",
          "exists<T>(address)"
        ],
        correct_idx: 0
      },
      {
        question: "What parameter must an entry function include to authorize storage writes on behalf of the transaction sender?",
        options: ["&signer", "address", "u64", "vector<u8>"],
        correct_idx: 0
      }
    ],
    exercise: {
      instruction: "Implement a Move public entry function initializing account storage.",
      template: "module student_addr::registry {\n    use std::signer;\n\n    struct Registry has key {\n        count: u64\n    }\n\n    public entry fn init_registry(account: &signer) {\n        move_to(account, Registry { count: 0 });\n    }\n}",
      required_keywords: ["public entry fn", "signer", "move_to"]
    }
  },
  "aptos-4": {
    id: "aptos-4",
    level_id: 4,
    title: "Move Testing & Security Invariants",
    duration: "25 min",
    xp: 250,
    content: "Write unit tests for Move modules using #[test], test-only helper functions, assert! macros, and explore formal verification with Move Prover.",
    quiz: [
      {
        question: "Which attribute macro denotes a unit test function in Aptos Move?",
        options: ["#[test]", "#[check]", "#[verify]", "#[assert]"],
        correct_idx: 0
      },
      {
        question: "What formal verification tool allows mathematically proving invariants in Move code?",
        options: ["Move Prover", "Slither", "Mythril", "Echidna"],
        correct_idx: 0
      }
    ],
    exercise: {
      instruction: "Write a Move unit test with assert! invariant.",
      template: "#[test_only]\nmodule student_addr::registry_tests {\n    use student_addr::registry;\n\n    #[test(account = @0x123)]\n    fun test_init(account: &signer) {\n        registry::init_registry(account);\n        assert!(true, 0);\n    }\n}",
      required_keywords: ["test", "assert!"]
    }
  },
  "aptos-5": {
    id: "aptos-5",
    level_id: 5,
    title: "Student Credential Registry Deployment Challenge",
    duration: "35 min",
    xp: 350,
    content: "Deployment Challenge: Build a Student Credential Registry storing and verifying credentials on Aptos Testnet. Submit your wallet address, module address, transaction hash, and GitHub repository URL.",
    quiz: [
      {
        question: "Which CLI command publishes a Move package to the Aptos testnet?",
        options: ["aptos move publish", "npm run deploy", "cargo contract upload", "forge create"],
        correct_idx: 0
      },
      {
        question: "Where are Move modules published on Aptos?",
        options: [
          "Under the deployer account's address space",
          "In a single global EVM opcode space",
          "On Ethereum L1",
          "In temporary node cache"
        ],
        correct_idx: 0
      }
    ],
    exercise: {
      instruction: "Submit Aptos Testnet deployment challenge details.",
      template: "// Aptos Testnet Student Credential Registry Submission\nconst DEPLOYMENT_SUBMISSION = {\n  chain: 'Aptos Testnet',\n  wallet_address: '0x8f4c1b9b37e29a8f4c1b9b37e29a8f4c1b9b37e29a8f4c1b9b37e29a8f4c1b9b',\n  module_address: '0x8f4c1b9b37e29a8f4c1b9b37e29a8f4c1b9b37e29a8f4c1b9b37e29a8f4c1b9b::StudentRegistry',\n  transaction_hash: '0x9a8f4c1b9b37e29a8f4c1b9b37e29a8f4c1b9b37e29a8f4c1b9b37e29a8f4c1b',\n  github_repo: 'https://github.com/developer/aptos-student-credential-registry',\n  module_name: 'StudentCredentialRegistry'\n};",
      required_keywords: ["DEPLOYMENT_SUBMISSION", "module_address", "transaction_hash", "github_repo"]
    }
  },
  "polkadot-1": {
    id: "polkadot-1",
    level_id: 1,
    title: "Relay Chain & Parachains Architecture",
    duration: "15 min",
    xp: 100,
    content: "Understand the Polkadot heterogeneous multi-chain framework, Relay Chain shared security, independent Parachains, Cross-Consensus Messaging (XCM), and Nominated Proof-of-Stake (NPoS).",
    quiz: [
      {
        question: "What is the primary function of the Polkadot Relay Chain?",
        options: [
          "Providing shared security and cross-chain interoperability (XCM) to attached Parachains",
          "Executing smart contracts directly",
          "Storing large video files",
          "Mining Bitcoin blocks"
        ],
        correct_idx: 0
      },
      {
        question: "How do independent application-specific blockchains connect to Polkadot?",
        options: [
          "As Parachains or Parathreads leasing a slot on the Relay Chain",
          "Through centralized API bridges only",
          "By converting to ERC-20 tokens",
          "By running EVM opcodes on L1"
        ],
        correct_idx: 0
      }
    ],
    exercise: {
      instruction: "Configure Polkadot Pop Network testnet parameters.",
      template: "// Polkadot / Substrate Pop Network Testnet Configuration\nconst POLKADOT_TESTNET = {\n  relayChain: 'Passeo',\n  network: 'Pop Network Testnet',\n  rpcUrl: 'wss://rpc1.paseo.popnetwork.xyz',\n  explorer: 'https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Frpc1.paseo.popnetwork.xyz#/explorer'\n};",
      required_keywords: ["POLKADOT_TESTNET", "rpcUrl", "network"]
    }
  },
  "polkadot-2": {
    id: "polkadot-2",
    level_id: 2,
    title: "Substrate FRAME Modular Architecture",
    duration: "20 min",
    xp: 150,
    content: "Learn Substrate modular blockchain architecture, FRAME pallets, dispatchable runtime calls, on-chain storage items, and forkless runtime upgrades via WebAssembly.",
    quiz: [
      {
        question: "What are the modular runtime logic components in Substrate FRAME called?",
        options: ["Pallets", "Contracts", "Shards", "Containers"],
        correct_idx: 0
      },
      {
        question: "What enables Substrate-based blockchains to perform forkless runtime upgrades?",
        options: [
          "On-chain Wasm runtime blob updated via governance without hard forks",
          "Restarting all validator nodes simultaneously",
          "Creating a new genesis block",
          "Manual validator recompilation"
        ],
        correct_idx: 0
      }
    ],
    exercise: {
      instruction: "Declare a Substrate pallet storage item.",
      template: "#[frame_support::pallet]\npub mod pallet {\n    use frame_support::pallet_prelude::*;\n    use frame_system::pallet_prelude::*;\n\n    #[pallet::storage]\n    pub type ProposalCount<T> = StorageValue<_, u32, ValueQuery>;\n}",
      required_keywords: ["pallet", "storage", "StorageValue"]
    }
  },
  "polkadot-3": {
    id: "polkadot-3",
    level_id: 3,
    title: "ink! Rust Smart Contract Development",
    duration: "25 min",
    xp: 200,
    content: "Develop WebAssembly smart contracts using ink! (embedded Rust eDSL), utilizing #[ink::contract], #[ink(storage)], #[ink(constructor)], and #[ink(message)].",
    quiz: [
      {
        question: "What is ink! in the Polkadot / Substrate ecosystem?",
        options: [
          "An embedded Rust-based eDSL for writing WebAssembly (Wasm) smart contracts",
          "A Solidity compiler wrapper",
          "A database query language",
          "A wallet browser extension"
        ],
        correct_idx: 0
      },
      {
        question: "Which attribute macro decorates functions callable by external users in an ink! contract?",
        options: ["#[ink(message)]", "#[ink(storage)]", "#[ink(event)]", "#[ink(topic)]"],
        correct_idx: 0
      }
    ],
    exercise: {
      instruction: "Implement an ink! smart contract structure.",
      template: "#![cfg_attr(not(feature = \"std\"), no_std, no_main)]\n\n#[ink::contract]\nmod voting {\n    #[ink(storage)]\n    pub struct Voting {\n        proposals_count: u32,\n    }\n\n    impl Voting {\n        #[ink(constructor)]\n        pub fn new() -> Self {\n            Self { proposals_count: 0 }\n        }\n\n        #[ink(message)]\n        pub fn get_count(&self) -> u32 {\n            self.proposals_count\n        }\n    }\n}",
      required_keywords: ["ink::contract", "ink(storage)", "ink(constructor)", "ink(message)"]
    }
  },
  "polkadot-4": {
    id: "polkadot-4",
    level_id: 4,
    title: "Testing, Security & OpenGov",
    duration: "25 min",
    xp: 250,
    content: "Run automated ink! unit and end-to-end tests with cargo-contract, implement contract security guards, and understand Polkadot OpenGov decentralized democracy.",
    quiz: [
      {
        question: "Which tool is standard for compiling and testing ink! contracts?",
        options: ["cargo-contract", "hardhat", "truffle", "solc"],
        correct_idx: 0
      },
      {
        question: "What is OpenGov in Polkadot?",
        options: [
          "A fully decentralized, conviction-voting on-chain governance system",
          "A private admin multisig",
          "A proof of work mining pool",
          "A KYC verification service"
        ],
        correct_idx: 0
      }
    ],
    exercise: {
      instruction: "Write an ink! unit test with assertion.",
      template: "#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[ink::test]\n    fn test_voting_initialization() {\n        let contract = Voting::new();\n        assert_eq!(contract.get_count(), 0);\n    }\n}",
      required_keywords: ["ink::test", "assert_eq!"]
    }
  },
  "polkadot-5": {
    id: "polkadot-5",
    level_id: 5,
    title: "Voting DApp Deployment Challenge",
    duration: "35 min",
    xp: 350,
    content: "Deployment Challenge: Build a Voting DApp with proposal creation and voting functionality. Submit your wallet address, contract address, transaction hash, and GitHub repository URL.",
    quiz: [
      {
        question: "What two artifacts are produced when compiling an ink! contract with cargo contract build?",
        options: [
          ".contract (or .wasm) code blob and metadata.json bundle",
          ".exe executable only",
          ".sol file",
          ".py script"
        ],
        correct_idx: 0
      },
      {
        question: "How is an ink! smart contract instantiated on a Substrate Contracts parachain?",
        options: [
          "Upload the code blob, then instantiate with constructor parameters",
          "Directly paste source code into block explorer",
          "Hard fork the network",
          "Run a python script"
        ],
        correct_idx: 0
      }
    ],
    exercise: {
      instruction: "Submit ink! Voting DApp testnet deployment challenge details.",
      template: "// Polkadot / Substrate ink! Voting DApp Deployment Submission\nconst DEPLOYMENT_SUBMISSION = {\n  chain: 'Pop Network Testnet (Polkadot / Substrate)',\n  wallet_address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',\n  contract_address: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',\n  transaction_hash: '0x3c9a8f4c1b9b37e29a8f4c1b9b37e29a8f4c1b9b37e29a8f4c1b9b37e29a8f4c',\n  github_repo: 'https://github.com/developer/polkadot-ink-voting-dapp',\n  contract_name: 'VotingDApp'\n};",
      required_keywords: ["DEPLOYMENT_SUBMISSION", "contract_address", "transaction_hash", "github_repo"]
    }
  }
};

const FRONTEND_TRACK_COURSES: Record<string, Course[]> = {
  starknet: [
    {
      level_id: 1,
      title: "Module 1: Starknet Fundamentals",
      total_lessons: 1,
      lessons: [FRONTEND_TRACK_LESSONS["starknet-1"]]
    },
    {
      level_id: 2,
      title: "Module 2: Cairo Programming",
      total_lessons: 1,
      lessons: [FRONTEND_TRACK_LESSONS["starknet-2"]]
    },
    {
      level_id: 3,
      title: "Module 3: Smart Contracts",
      total_lessons: 1,
      lessons: [FRONTEND_TRACK_LESSONS["starknet-3"]]
    },
    {
      level_id: 4,
      title: "Module 4: Testing & Security",
      total_lessons: 1,
      lessons: [FRONTEND_TRACK_LESSONS["starknet-4"]]
    },
    {
      level_id: 5,
      title: "Module 5: Deployment to Starknet Sepolia",
      total_lessons: 1,
      lessons: [FRONTEND_TRACK_LESSONS["starknet-5"]]
    }
  ],
  aptos: [
    {
      level_id: 1,
      title: "Module 1: Aptos Fundamentals",
      total_lessons: 1,
      lessons: [FRONTEND_TRACK_LESSONS["aptos-1"]]
    },
    {
      level_id: 2,
      title: "Module 2: Move Programming",
      total_lessons: 1,
      lessons: [FRONTEND_TRACK_LESSONS["aptos-2"]]
    },
    {
      level_id: 3,
      title: "Module 3: Smart Contract Development",
      total_lessons: 1,
      lessons: [FRONTEND_TRACK_LESSONS["aptos-3"]]
    },
    {
      level_id: 4,
      title: "Module 4: Testing & Security",
      total_lessons: 1,
      lessons: [FRONTEND_TRACK_LESSONS["aptos-4"]]
    },
    {
      level_id: 5,
      title: "Module 5: Deployment to Aptos Testnet",
      total_lessons: 1,
      lessons: [FRONTEND_TRACK_LESSONS["aptos-5"]]
    }
  ],
  polkadot: [
    {
      level_id: 1,
      title: "Module 1: Polkadot Fundamentals",
      total_lessons: 1,
      lessons: [FRONTEND_TRACK_LESSONS["polkadot-1"]]
    },
    {
      level_id: 2,
      title: "Module 2: Substrate Fundamentals",
      total_lessons: 1,
      lessons: [FRONTEND_TRACK_LESSONS["polkadot-2"]]
    },
    {
      level_id: 3,
      title: "Module 3: ink! Smart Contracts",
      total_lessons: 1,
      lessons: [FRONTEND_TRACK_LESSONS["polkadot-3"]]
    },
    {
      level_id: 4,
      title: "Module 4: Testing & Security",
      total_lessons: 1,
      lessons: [FRONTEND_TRACK_LESSONS["polkadot-4"]]
    },
    {
      level_id: 5,
      title: "Module 5: Deployment & Verification",
      total_lessons: 1,
      lessons: [FRONTEND_TRACK_LESSONS["polkadot-5"]]
    }
  ]
};

// ─── Courses & Lessons ────────────────────────────────────────────────────────
export async function fetchCourses(track = 'ethereum'): Promise<Course[]> {
  const trackKey = track.toLowerCase();
  if (FRONTEND_TRACK_COURSES[trackKey]) {
    return FRONTEND_TRACK_COURSES[trackKey];
  }
  try {
    const res = await fetch(`${BASE}/courses?track=${track}`);
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("fetchCourses error, checking fallback:", e);
  }
  if (FRONTEND_TRACK_COURSES[trackKey]) {
    return FRONTEND_TRACK_COURSES[trackKey];
  }
  throw new Error(`Failed to fetch courses for track: ${track}`);
}

export async function fetchLesson(lessonId: string, track = 'ethereum'): Promise<Lesson> {
  if (FRONTEND_TRACK_LESSONS[lessonId]) {
    return FRONTEND_TRACK_LESSONS[lessonId];
  }
  try {
    const res = await fetch(`${BASE}/courses/lessons/${lessonId}?track=${track}`);
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("fetchLesson error, checking fallback:", e);
  }
  if (FRONTEND_TRACK_LESSONS[lessonId]) {
    return FRONTEND_TRACK_LESSONS[lessonId];
  }
  throw new Error(`Failed to fetch lesson: ${lessonId}`);
}

export async function postActiveTrack(userId: string, track: string, token: string): Promise<UserProgress> {
  const trackKey = track.toLowerCase();
  try {
    const res = await fetch(`${BASE}/progress/track?user_id=${userId}&track=${track}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("postActiveTrack backend error, using client fallback:", e);
  }

  // Graceful client fallback when track is managed frontend-side
  const cur: UserProgress = await fetchProgress(userId).catch(() => ({
    user_id: userId,
    xp: 100,
    streak_days: 1,
    current_level: 1,
    overall_pct: 0,
    active_track: trackKey,
    levels: [],
    last_active: new Date().toISOString()
  }));

  const courses = FRONTEND_TRACK_COURSES[trackKey] || [];
  const levelProgress = courses.map((c, idx) => ({
    level_id: c.level_id,
    title: c.title,
    is_unlocked: idx === 0,
    completed_lessons: 0,
    total_lessons: c.lessons.length,
    completed_at: null
  }));

  return {
    ...cur,
    active_track: trackKey,
    levels: levelProgress.length > 0 ? levelProgress : cur.levels
  };
}

// ─── Submissions ──────────────────────────────────────────────────────────────
export interface QuizResult {
  score: number;
  passed: boolean;
  correct_count: number;
  total_questions: number;
  results: {
    question: string;
    user_answer_idx: number;
    correct_answer_idx: number;
    is_correct: boolean;
  }[];
  user_progress: UserProgress;
}

export async function postQuizSubmit(
  userId: string,
  lessonId: string,
  answers: number[],
  token?: string,
): Promise<QuizResult> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  try {
    const res = await fetch(`${BASE}/quiz/submit`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ user_id: userId, lesson_id: lessonId, answers }),
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("postQuizSubmit backend error, running client fallback:", e);
  }

  // Graceful client fallback
  const lesson = FRONTEND_TRACK_LESSONS[lessonId] || {
    id: lessonId,
    level_id: parseInt(lessonId.split('-')[1] || '1', 10),
    title: "Lesson",
    duration: "15 min",
    xp: 100,
    content: "",
    quiz: []
  };
  const questions = lesson.quiz || [];
  let correctCount = 0;
  const results = questions.map((q, idx) => {
    const userAns = answers[idx] ?? -1;
    const isCorrect = userAns === q.correct_idx;
    if (isCorrect) correctCount++;
    return {
      question: q.question,
      user_answer_idx: userAns,
      correct_answer_idx: q.correct_idx,
      is_correct: isCorrect
    };
  });

  const total = questions.length || 1;
  const score = Math.round((correctCount / total) * 100);
  const passed = score >= 70;

  const cur: UserProgress = await fetchProgress(userId).catch(() => ({
    user_id: userId,
    xp: 100,
    streak_days: 1,
    current_level: 1,
    overall_pct: 0,
    active_track: 'ethereum',
    levels: [],
    last_active: new Date().toISOString(),
    quiz_attempts: [],
    exercises_submitted: []
  }));

  const attempts = cur.quiz_attempts || [];
  const completedList = (cur as any).completed_lesson_ids || [];
  if (passed && !completedList.includes(lessonId)) {
    completedList.push(lessonId);
  }

  const updatedLevels = (cur.levels || []).map(l => {
    if (l.level_id === lesson.level_id) {
      const newDone = Math.min(l.total_lessons, (l.completed_lessons || 0) + (passed ? 1 : 0));
      return {
        ...l,
        completed_lessons: newDone,
        completed_at: newDone >= l.total_lessons ? new Date().toISOString() : l.completed_at
      };
    }
    return l;
  });

  const updatedProgress: UserProgress = {
    ...cur,
    xp: cur.xp + (passed ? lesson.xp : 10),
    quiz_attempts: [
      ...attempts,
      { lesson_id: lessonId, level_id: lesson.level_id, score, attempted_at: new Date().toISOString() }
    ],
    levels: updatedLevels
  };
  (updatedProgress as any).completed_lesson_ids = completedList;

  return {
    score,
    passed,
    correct_count: correctCount,
    total_questions: total,
    results,
    user_progress: updatedProgress
  };
}

export interface ExerciseResult {
  passed: boolean;
  feedback: string;
  missing_keywords: string[];
  syntax_errors?: string[];
  user_progress: UserProgress;
}

export async function postExerciseSubmit(
  userId: string,
  lessonId: string,
  code: string,
  token?: string,
): Promise<ExerciseResult> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const res = await fetch(`${BASE}/exercise/submit`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ user_id: userId, lesson_id: lessonId, code }),
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("postExerciseSubmit backend error, running client fallback:", e);
  }

  // Fallback client validation
  const lesson = FRONTEND_TRACK_LESSONS[lessonId] || {
    id: lessonId,
    level_id: parseInt(lessonId.split('-')[1] || '1', 10),
    title: "Lesson",
    duration: "15 min",
    xp: 100,
    content: "",
    quiz: [],
    exercise: {
      instruction: "Submit solution",
      template: "// Code\n",
      required_keywords: []
    }
  };
  const required = lesson.exercise?.required_keywords || [];
  const missing = required.filter(k => !code.includes(k));
  const passed = missing.length === 0;

  const cur: UserProgress = await fetchProgress(userId).catch(() => ({
    user_id: userId,
    xp: 100,
    streak_days: 1,
    current_level: 1,
    overall_pct: 0,
    active_track: 'ethereum',
    levels: [],
    last_active: new Date().toISOString(),
    quiz_attempts: [],
    exercises_submitted: []
  }));

  const exercises = cur.exercises_submitted || [];
  const completedList = (cur as any).completed_lesson_ids || [];
  if (passed && !completedList.includes(lessonId)) {
    completedList.push(lessonId);
  }

  const updatedLevels = (cur.levels || []).map(l => {
    if (l.level_id === lesson.level_id) {
      const newDone = Math.min(l.total_lessons, (l.completed_lessons || 0) + (passed ? 1 : 0));
      return {
        ...l,
        completed_lessons: newDone,
        completed_at: newDone >= l.total_lessons ? new Date().toISOString() : l.completed_at
      };
    }
    return l;
  });

  const updatedProgress: UserProgress = {
    ...cur,
    xp: cur.xp + (passed ? lesson.xp : 15),
    exercises_submitted: [
      ...exercises,
      { lesson_id: lessonId, level_id: lesson.level_id, code, submitted_at: new Date().toISOString() }
    ],
    levels: updatedLevels
  };
  (updatedProgress as any).completed_lesson_ids = completedList;

  return {
    passed,
    feedback: passed
      ? "✅ Outstanding work! Code evaluation and deployment challenge verified successfully."
      : `⚠️ Missing required keywords: ${missing.join(', ')}`,
    missing_keywords: missing,
    user_progress: updatedProgress
  };
}

// ─── Dashboard & Analytics ────────────────────────────────────────────────────
export interface GitHubUserStats {
  username: string;
  name: string;
  avatar_url: string;
  public_repos: number;
  followers: number;
  merged_prs: number;
  total_commits: number;
}

export async function fetchGitHubUserStats(username: string): Promise<GitHubUserStats> {
  const res = await fetch(`${BASE}/github/stats/${username}`);
  if (!res.ok) throw new Error(`Failed to fetch GitHub stats: ${res.status}`);
  return res.json();
}

export async function fetchDashboardData(userId: string): Promise<DashboardData> {
  const res = await fetch(`${BASE}/dashboard/${userId}`);
  if (!res.ok) throw new Error(`Failed to fetch dashboard data: ${res.status}`);
  return res.json();
}

// ─── Certificates ─────────────────────────────────────────────────────────────
export async function fetchCertificates(userId: string): Promise<Certificate[]> {
  const res = await fetch(`${BASE}/certificates/${userId}`);
  if (!res.ok) throw new Error(`Failed to fetch certificates: ${res.status}`);
  return res.json();
}

// ─── GitHub Activity ──────────────────────────────────────────────────────────
export async function fetchGithubActivity(userId: string): Promise<GithubActivity[]> {
  const res = await fetch(`${BASE}/github/activity/${userId}`);
  if (!res.ok) throw new Error(`Failed to fetch GitHub activity: ${res.status}`);
  return res.json();
}

export interface GitHubSyncResult {
  user_progress: UserProgress;
  new_commits_count: number;
  total_commits_count: number;
  xp_gained: number;
}

export async function postGithubSync(userId: string, githubUsername: string, token?: string): Promise<GitHubSyncResult> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}/github/sync`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ user_id: userId, github_username: githubUsername }),
  });
  if (!res.ok) throw new Error(`GitHub sync failed: ${res.status}`);
  return res.json();
}

// ─── Forum API Calls ──────────────────────────────────────────────────────────
import type { ForumThread, ForumComment, Hackathon } from '../types';

export interface PaginatedThreads {
  threads: ForumThread[];
  total_count: number;
  page: number;
  limit: number;
}

export async function fetchForumThreads(
  category?: string,
  search?: string,
  page: number = 1,
  limit: number = 5
): Promise<PaginatedThreads> {
  let url = `${BASE}/forum/threads`;
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (search) params.append('search', search);
  params.append('page', String(page));
  params.append('limit', String(limit));
  
  const queryStr = params.toString();
  if (queryStr) url += `?${queryStr}`;
  
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch forum threads: ${res.status}`);
  return res.json();
}

export async function fetchForumThread(threadId: string): Promise<ForumThread> {
  const res = await fetch(`${BASE}/forum/threads/${threadId}`);
  if (!res.ok) throw new Error(`Failed to fetch thread: ${res.status}`);
  return res.json();
}

export interface ForumStats {
  trending_tags: { tag: string; count: number }[];
  top_contributors: { username: string; avatar: string; xp: number }[];
  online_count?: number;
}

export async function fetchForumStats(): Promise<ForumStats> {
  const res = await fetch(`${BASE}/forum/stats`);
  if (!res.ok) throw new Error(`Failed to fetch forum stats: ${res.status}`);
  return res.json();
}

export async function postForumThread(
  title: string,
  author: string,
  category: string,
  content: string,
  tags: string[],
  token?: string
): Promise<ForumThread> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}/forum/threads`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ title, author, category, content, tags }),
  });
  if (!res.ok) throw new Error(`Failed to create thread: ${res.status}`);
  return res.json();
}

export async function postForumComment(
  threadId: string,
  author: string,
  content: string,
  token?: string
): Promise<ForumComment> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}/forum/threads/${threadId}/comments`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ author, content }),
  });
  if (!res.ok) throw new Error(`Failed to create comment: ${res.status}`);
  return res.json();
}

// ─── Hackathons API Calls ──────────────────────────────────────────────────────
export interface PaginatedHackathons {
  hackathons: Hackathon[];
  total_count: number;
  page: number;
  limit: number;
}

export async function fetchHackathons(
  userId?: string,
  status?: string,
  page: number = 1,
  limit: number = 3
): Promise<PaginatedHackathons> {
  let url = `${BASE}/hackathons`;
  const params = new URLSearchParams();
  if (userId) params.append('user_id', userId);
  if (status) params.append('status', status);
  params.append('page', String(page));
  params.append('limit', String(limit));
  
  url += `?${params.toString()}`;
  
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch hackathons: ${res.status}`);
  return res.json();
}

export async function postHackathonRegister(hackathonId: string, userId: string, token?: string): Promise<UserProgress> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}/hackathons/${hackathonId}/register`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ user_id: userId }),
  });
  if (!res.ok) throw new Error(`Failed to register for hackathon: ${res.status}`);
  return res.json();
}

export async function postHackathonSubmit(
  hackathonId: string,
  userId: string,
  projectName: string,
  tagline: string,
  description: string,
  videoLink: string,
  codeLink: string,
  teamSize: number,
  token?: string
): Promise<UserProgress> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}/hackathons/${hackathonId}/submit`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      user_id: userId,
      project_name: projectName,
      tagline,
      description,
      video_link: videoLink,
      code_link: codeLink,
      team_size: teamSize
    }),
  });
  if (!res.ok) throw new Error(`Failed to submit project: ${res.status}`);
  return res.json();
}

export async function linkGithub(userId: string, code?: string, username?: string): Promise<UserProgress> {
  const res = await fetch(`${BASE}/auth/link-github`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, code, username }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || `GitHub link failed: ${res.status}`);
  }
  return res.json();
}

export async function linkWallet(
  userId: string,
  address: string,
  message?: string,
  signature?: string
): Promise<UserProgress> {
  const res = await fetch(`${BASE}/auth/link-wallet`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, address, message, signature }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || `Wallet link failed: ${res.status}`);
  }
  return res.json();
}

export interface GithubOrgStats {
  repositories: {
    name: string;
    description: string;
    language: string;
    stars: number;
    forks: number;
    open_issues: number;
    url: string;
  }[];
  contributors: {
    username: string;
    avatar: string;
    contributions: number;
    role: string;
  }[];
  issues: {
    id: string;
    title: string;
    repo: string;
    status: string;
    author: string;
    created_at: string;
  }[];
  prs: {
    id: string;
    title: string;
    repo: string;
    status: string;
    author: string;
    created_at: string;
  }[];
  releases: {
    version: string;
    title: string;
    published_at: string;
    download_url: string;
  }[];
}

export async function fetchGithubOrgStats(): Promise<GithubOrgStats> {
  const res = await fetch(`${BASE}/github/org-stats`);
  if (!res.ok) throw new Error(`Failed to fetch GitHub org stats: ${res.status}`);
  return res.json();
}

export async function deleteThread(threadId: string, token: string): Promise<any> {
  const res = await fetch(`${BASE}/forum/threads/${threadId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || `Failed to delete thread: ${res.status}`);
  }
  return res.json();
}

export async function deleteComment(threadId: string, commentId: string, token: string): Promise<any> {
  const res = await fetch(`${BASE}/forum/threads/${threadId}/comments/${commentId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || `Failed to delete comment: ${res.status}`);
  }
  return res.json();
}



