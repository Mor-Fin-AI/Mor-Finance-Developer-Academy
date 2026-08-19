"""
Curriculum and Lessons Database for the Developer Academy.
Contains rich educational Markdown text, multi-choice quizzes, and smart contract coding exercises.
"""
from typing import Dict, List
from src.models.lesson import QuizQuestion, CodingExercise, Lesson, Course

# ─── LESSON DATABASE ──────────────────────────────────────────────────────────
LESSONS_DB: Dict[str, Lesson] = {
    # ── Level 1: Blockchain Fundamentals
    "1-1": Lesson(
        id="1-1",
        level_id=1,
        title="Introduction to Peer-to-Peer Networks",
        duration="8 mins",
        xp=100,
        content="""# Introduction to Peer-to-Peer Networks

A peer-to-peer (P2P) network is a decentralized communications model in which each party (peer) has equivalent capabilities and can initiate communications. This is in contrast to the traditional client-server model, where some computers are dedicated to serving others.

### Key Concepts:
1. **Decentralization**: No central server acts as a single point of failure.
2. **Distributed Ledger**: Every node keeps a copy of the database.
3. **Consensus**: Nodes must agree on the state of the network.

Web3 relies heavily on P2P networks (like Ethereum DevP2P or LibP2P) to broadcast transactions and blocks to all participants without relying on a centralized intermediary.
""",
        quiz=[
            QuizQuestion(
                question="What is the primary difference between a client-server network and a peer-to-peer network?",
                options=[
                    "Client-server networks have no central authority.",
                    "Peer-to-peer networks distribute data and control equally.",
                    "Peer-to-peer networks are slower and less secure.",
                    "Client-server networks only run on Unix machines."
                ],
                correct_idx=1
            ),
            QuizQuestion(
                question="Which protocol is commonly used in modern blockchains like Ethereum for peer communication?",
                options=["HTTP", "FTP", "DevP2P / LibP2P", "SMTP"],
                correct_idx=2
            )
        ],
        exercise=CodingExercise(
            instruction="Write a basic comment explaining the concept of a decentralized node in your own words. The code should contain the word '// decentralization'.",
            template="// Starter template\n// Write your comment here:\n",
            required_keywords=["decentralization"]
        )
    ),
    "1-2": Lesson(
        id="1-2",
        level_id=1,
        title="Cryptography: Hash Functions & Keys",
        duration="10 mins",
        xp=100,
        content="""# Cryptography: Hash Functions & Keys

Cryptography is the foundation of blockchain security. It enables trustless verification and secures assets using mathematical concepts.

### Hash Functions
A cryptographic hash function takes an input (message) and returns a fixed-size string of bytes (digest).
- **Deterministic**: The same input always produces the same output.
- **One-way**: You cannot reverse-engineer the input from the hash.
- **Collision Resistant**: It is extremely hard to find two different inputs that produce the same output.
- **Example**: Keccak-256 (used in Ethereum) and SHA-256 (used in Bitcoin).

### Public and Private Keys
Blockchains use asymmetric cryptography:
- **Private Key**: A secret number that allows you to sign transactions and spend funds. Keep it secret!
- **Public Key**: Derived mathematically from the private key; acts as your identity on the network.
- **Address**: A shortened hash of your public key (e.g., `0x71C...`).
""",
        quiz=[
            QuizQuestion(
                question="Which hash function is primarily used inside the Ethereum Virtual Machine (EVM)?",
                options=["SHA-256", "MD5", "Keccak-256", "bcrypt"],
                correct_idx=2
            ),
            QuizQuestion(
                question="What is the purpose of a Private Key?",
                options=[
                    "To share publicly as your account number.",
                    "To cryptographically sign transactions and approve transfers.",
                    "To encrypt files on your local hard drive.",
                    "To generate random blocks in mining."
                ],
                correct_idx=1
            )
        ],
        exercise=CodingExercise(
            instruction="Create a smart contract comment defining a mock private key variable. The code must contain the word 'privateKey' and 'Keccak256'.",
            template="// Define variables below:\n",
            required_keywords=["privateKey", "Keccak256"]
        )
    ),

    # ── Level 2: Wallet Development
    "2-1": Lesson(
        id="2-1",
        level_id=2,
        title="Understanding HD Wallets & Mnemonic Seeds",
        duration="10 mins",
        xp=150,
        content="""# Hierarchical Deterministic (HD) Wallets & Seed Phrases

An HD Wallet generates a tree structure of keys from a single root seed, which is generated from a human-readable mnemonic seed phrase (typically 12 or 24 words).

### Key Standards:
1. **BIP-39**: Defines the generation of mnemonic phrases and how they map to binary seeds.
2. **BIP-32**: Introduces HD wallet structure, allowing creation of child keys from parent keys.
3. **BIP-44**: Outlines a multi-account hierarchy structure (e.g., `m / purpose' / coin_type' / account' / change / address_index`).

A seed phrase can recover your entire wallet and all generated accounts, making recovery simple.
""",
        quiz=[
            QuizQuestion(
                question="Which BIP standard defines the human-readable 12- or 24-word seed phrase format?",
                options=["BIP-32", "BIP-39", "BIP-44", "ERC-20"],
                correct_idx=1
            ),
            QuizQuestion(
                question="What does the BIP-44 path 'm/44'/60'/0'/0/0' represent?",
                options=[
                    "A Bitcoin address index.",
                    "The first Ethereum address for account 0.",
                    "A smart contract deployment key.",
                    "A consensus validation node."
                ],
                correct_idx=1
            )
        ],
        exercise=CodingExercise(
            instruction="Write a JavaScript/TypeScript pseudocode comment containing the BIP-44 path for Ethereum. Ensure your code contains the exact path string: `m/44'/60'/0'/0/0`.",
            template="// Mnemonic recovery script:\nconst derivationPath = \"\";\n",
            required_keywords=["m/44'/60'/0'/0/0"]
        )
    ),
    "2-2": Lesson(
        id="2-2",
        level_id=2,
        title="Connecting Wallets to DApps (Ethers & Viem)",
        duration="12 mins",
        xp=150,
        content="""# Connecting Wallets to DApps

To interact with Web3 applications (DApps), user browsers use Web3 providers supplied by wallets like MetaMask, Coinbase Wallet, or Rabby.

### Window.ethereum
Wallets inject a global API object at `window.ethereum` into websites. DApps use libraries like **Ethers.js** or **Viem** (often wrapped by **Wagmi** / **RainbowKit**) to interact with it.

### Example connection flow in JS:
```javascript
// Request account access
const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
const userAddress = accounts[0];
```
This enables the DApp to read the user's address and request signatures for transactions.
""",
        quiz=[
            QuizQuestion(
                question="What global window object does a browser extension wallet inject?",
                options=["window.web3wallet", "window.ethereum", "window.metamask", "window.provider"],
                correct_idx=1
            ),
            QuizQuestion(
                question="Which RPC method is requested from window.ethereum to prompt the user to connect their wallet?",
                options=["eth_accounts", "eth_requestAccounts", "personal_sign", "eth_connect"],
                correct_idx=1
            )
        ],
        exercise=CodingExercise(
            instruction="Write a comment simulating the request for user accounts using the `eth_requestAccounts` RPC method. The code must contain the keywords `window.ethereum` and `eth_requestAccounts`.",
            template="// Implement wallet connection request below:\n",
            required_keywords=["window.ethereum", "eth_requestAccounts"]
        )
    ),

    # ── Level 3: Smart Contract Development
    "3-1": Lesson(
        id="3-1",
        level_id=3,
        title="Introduction to Solidity & State Variables",
        duration="15 mins",
        xp=200,
        content="""# Solidity & State Variables

Solidity is a statically typed, contract-oriented programming language designed for compiling to Ethereum Virtual Machine (EVM) bytecode.

### Structure of a Solidity Contract:
- **SPDX License**: Specifying license (e.g. `// SPDX-License-Identifier: MIT`).
- **Pragma**: Specifying compiler version compatibility (e.g. `pragma solidity ^0.8.20;`).
- **State Variables**: Variables stored permanently in contract storage.

### Data Types:
- `uint256`: Unsigned integer of 256 bits.
- `address`: Holds a 20-byte Ethereum address.
- `bool`: Boolean.
- `mapping(key => value)`: Hash table mapping keys to values.
""",
        quiz=[
            QuizQuestion(
                question="Which keyword indicates that a variable's value is stored permanently in the contract's blockchain storage?",
                options=["memory", "calldata", "storage", "transient"],
                correct_idx=2
            ),
            QuizQuestion(
                question="What is the size of the standard unsigned integer used in Solidity?",
                options=["uint8", "uint64", "uint256", "uint512"],
                correct_idx=2
            )
        ],
        exercise=CodingExercise(
            instruction="Write a basic Solidity contract structure named `AcademyStore` with a state variable named `storedNumber` of type `uint256`. The code must contain 'contract AcademyStore' and 'uint256 public storedNumber'.",
            template="// SPDX-License-Identifier: MIT\npragma solidity ^0.8.20;\n\n",
            required_keywords=["contract AcademyStore", "uint256", "storedNumber"]
        )
    ),
    "3-2": Lesson(
        id="3-2",
        level_id=3,
        title="Functions & Modifiers in Solidity",
        duration="15 mins",
        xp=200,
        content="""# Solidity Functions & Modifiers

Functions are the executable units of code within a contract. Modifiers are reusable code blocks used to modify function behavior.

### Function Visibility:
- `public`: Accessible inside and outside the contract.
- `external`: Only accessible outside the contract.
- `internal`: Only accessible inside the contract and derived contracts.
- `private`: Only accessible inside the contract itself.

### Modifiers
Modifiers are run before (or after) the function executes. They are typically used for access controls:
```solidity
modifier onlyOwner() {
    require(msg.sender == owner, "Not owner");
    _; // This represents the function body executing
}
```
""",
        quiz=[
            QuizQuestion(
                question="What does the underscore symbol `_;` represent in a Solidity modifier?",
                options=[
                    "A wildcard parameter.",
                    "The continuation of the function execution flow.",
                    "An exit return statement.",
                    "A private variable reference."
                ],
                correct_idx=1
            ),
            QuizQuestion(
                question="Which function visibility is the most gas-efficient for functions that are only called from outside the blockchain?",
                options=["public", "external", "internal", "private"],
                correct_idx=1
            )
        ],
        exercise=CodingExercise(
            instruction="Create a modifier named `onlyAdmin` that requires `msg.sender == admin`. Assume `admin` is already defined as an address. Your code must contain 'modifier onlyAdmin()' and 'require(msg.sender == admin' and '_;'.",
            template="contract AcademyAdmin {\n    address public admin;\n    \n    // Write your modifier below:\n",
            required_keywords=["modifier onlyAdmin()", "msg.sender == admin", "_;"]
        )
    ),

    # ── Level 4: DeFi Fundamentals
    "4-1": Lesson(
        id="4-1",
        level_id=4,
        title="Decentralized Exchanges & Automated Market Makers",
        duration="15 mins",
        xp=250,
        content="""# Automated Market Makers (AMMs)

An Automated Market Maker (AMM) is a Decentralized Exchange (DEX) protocol that relies on mathematical formulas to price assets, rather than traditional order books.

### Constant Product Formula
Uniswap V2 popularized the Constant Product Formula:
$$x \\cdot y = k$$
- $x$: Token balance of Asset A in the liquidity pool.
- $y$: Token balance of Asset B in the liquidity pool.
- $k$: A constant invariant that must remain unchanged during trades (ignoring fees).

When a user buys Token A, they add Token B to the pool, reducing $x$ and increasing $y$. This pushes the relative price of Token A up.
""",
        quiz=[
            QuizQuestion(
                question="What mathematical formula defines the Uniswap V2 Constant Product AMM invariant?",
                options=["x + y = k", "x * y = k", "x^2 + y^2 = k", "x / y = k"],
                correct_idx=1
            ),
            QuizQuestion(
                question="Who provides tokens to a DEX AMM liquidity pool to enable trading?",
                options=["Central Banks", "Liquidity Providers (LPs)", "FastAPI backend services", "GitHub Actions"],
                correct_idx=1
            )
        ],
        exercise=CodingExercise(
            instruction="Write a Solidity public function named `getK` that calculates the product of two state variables `tokenABalance` and `tokenBBalance` and returns it as a `uint256`. The code must contain 'function getK()' and 'return tokenABalance * tokenBBalance;'.",
            template="contract AMMPool {\n    uint256 public tokenABalance;\n    uint256 public tokenBBalance;\n    \n    // Write function getK below:\n",
            required_keywords=["function getK()", "tokenABalance * tokenBBalance"]
        )
    ),

    # ── Level 5: DAO Governance
    "5-1": Lesson(
        id="5-1",
        level_id=5,
        title="DAO Mechanics & Voting Structures",
        duration="12 mins",
        xp=250,
        content="""# Decentralized Autonomous Organizations (DAOs)

A DAO is an organization represented by rules encoded as a computer program that is transparent, controlled by the organization members, and not influenced by a central government.

### Typical Lifecycle of a DAO Proposal:
1. **Creation**: A token holder creates a proposal (e.g. allocate funds, change parameter).
2. **Voting**: Token holders cast votes using their governance tokens (delegated or native).
3. **Queueing**: If approved, the proposal enters a Timelock contract to allow users to leave the DAO if they disagree.
4. **Execution**: The proposal's transactions are dispatched and run on-chain.
""",
        quiz=[
            QuizQuestion(
                question="What is the purpose of a Timelock contract in DAO governance?",
                options=[
                    "To speed up the voting process.",
                    "To delay approved proposals, giving users time to withdraw funds if they disagree with the outcome.",
                    "To secure the database against unauthorized access.",
                    "To generate mining rewards."
                ],
                correct_idx=1
            )
        ],
        exercise=CodingExercise(
            instruction="Write a comment simulating the status check of a DAO proposal. Include the words `ProposalState` and `Executed` in your comment.",
            template="// DAO Proposal State check:\n",
            required_keywords=["ProposalState", "Executed"]
        )
    ),

    # ── Level 6: MOR Finance Protocols
    "6-1": Lesson(
        id="6-1",
        level_id=6,
        title="Morpheus Network & AI-Compute Agents",
        duration="15 mins",
        xp=300,
        content="""# Morpheus Network (MOR Finance)

Morpheus is a decentralized network that connects AI Compute Providers, Smart Agent Creators, and End Users through smart contracts.

### How it works:
1. **Compute Providers**: Offer GPU resources to run LLMs.
2. **Smart Agents**: AI systems designed to perform operations on the blockchain (e.g., execute trades, monitor prices).
3. **MOR Token**: Rewards compute providers and developers, aligning economic incentives.
""",
        quiz=[
            QuizQuestion(
                question="What are 'Smart Agents' in the Morpheus Network?",
                options=[
                    "Human smart contract auditors.",
                    "AI systems that can execute smart contract operations on behalf of users.",
                    "Automated web servers.",
                    "Specialized node mining hardware."
                ],
                correct_idx=1
            )
        ],
        exercise=CodingExercise(
            instruction="Write a contract comment that references compute bidding. It must contain the keywords `GPU compute` and `bidding reward`.",
            template="// Write your Compute reward notes:\n",
            required_keywords=["GPU compute", "bidding reward"]
        )
    )
}

TRACK_TOPICS = {
    "ethereum": [
        "Ethereum Architecture", "ERC-20 Standard", "ERC-721 Standard", "ERC-1155 Standard",
        "Account Abstraction", "Ethereum Security", "Ethereum Public Goods", "Smart Contract Development"
    ],
    "arbitrum": [
        "Arbitrum Deployment", "Nitro Architecture", "Arbitrum Orbit L3s", "Arbitrum DeFi Protocols",
        "Stylus (Rust/C++) Development", "Building on Arbitrum", "Arbitrum Hackathons"
    ],
    "optimism": [
        "OP Stack Architecture", "Superchain Interoperability", "Optimism Governance",
        "Retroactive Public Goods Funding", "Optimism Deployment", "Optimism Developer Tooling"
    ],
    "polygon": [
        "Polygon PoS Chain", "Polygon CDK Framework", "zkEVM Rollups", "Polygon Smart Contracts",
        "Polygon Consumer dApps"
    ],
    "base": [
        "Base Ecosystem & MOR", "Onchain Applications", "Coinbase Wallet Integrations",
        "Base Smart Contract Deployment", "Base Hackathons & Developer Blueprints"
    ],
    "solana": [
        "Solana High-Throughput Architecture", "Solana Accounts Model", "Anchor Framework & Rust",
        "Solana Program Security", "Solana DeFi Pools"
    ],
    "avalanche": [
        "Avalanche Subnet Deployments", "Avalanche Consensus Engine", "Avalanche Virtual Machine (AVM)",
        "Avalanche Warp Messaging (AWM)", "Avalanche DeFi Integration"
    ]
}

def get_track_lessons(track_id: str) -> List[Lesson]:
    """
    Generate the standardized Multichain Integration curriculum for each supported ecosystem:
    - 2 Introductory Lessons
    - 2 Quizzes (multiple questions per lesson)
    - 2 Coding Exercises
    - 2 Starter Projects
    - AI Mentor Support (OpenClaw & Hermes)
    - Full Ecosystem Roadmap: Intermediate, Advanced, DeFi, NFTs, Governance, Hackathons, Certifications & Capstones
    """
    t_id = track_id.lower().strip()
    name = t_id.capitalize()
    
    # Ecosystem-specific metadata for bespoke introductory content & starter projects
    ECOSYSTEM_DETAILS = {
        "fundamentals": {
            "arch": "Peer-to-peer network topologies, cryptographic hashing (SHA256, Keccak256), public/private key pairs, and consensus mechanisms (PoW, PoS).",
            "tool": "Solidity, Rust, Web3.js, Ethers.js, Hardhat, Foundry, and MOR Developer Toolkits",
            "p1_title": "Web3 Fundamentals Starter Project 1: OpenZeppelin Core Contracts",
            "p1_desc": "Build and compile foundational smart contracts using OpenZeppelin's official Web3 smart contract library.",
            "p1_repo": "https://github.com/OpenZeppelin/openzeppelin-contracts",
            "p2_title": "Web3 Fundamentals Starter Project 2: Scaffold-ETH 2 Multi-Chain DApp",
            "p2_desc": "Deploy a multi-chain dApp with Next.js, Wagmi, RainbowKit, and AI Mentor support.",
            "p2_repo": "https://github.com/scaffold-eth/scaffold-eth-2"
        },
        "ethereum": {
            "arch": "Ethereum Virtual Machine (EVM), proof-of-stake consensus (Gasper), and gas execution model.",
            "tool": "Solidity (^0.8.20), Hardhat, Foundry, and Ethers.js / Viem",
            "p1_title": "Ethereum Starter Project 1: OpenZeppelin Smart Contract Library",
            "p1_desc": "Build, compile, and test secure EVM smart contracts using OpenZeppelin's official smart contract repository.",
            "p1_repo": "https://github.com/OpenZeppelin/openzeppelin-contracts",
            "p2_title": "Ethereum Starter Project 2: Scaffold-ETH 2 Full-Stack DApp",
            "p2_desc": "Deploy an interactive Web3 frontend using Scaffold-ETH 2 with RainbowKit, Wagmi, Next.js, and AI mentor support.",
            "p2_repo": "https://github.com/scaffold-eth/scaffold-eth-2"
        },
        "arbitrum": {
            "arch": "Arbitrum Nitro execution engine, Optimistic Rollup AVM, Orbit L3 chains, and Stylus Rust execution environment.",
            "tool": "Solidity & Rust (Stylus SDK), Arbitrum Nitro testnet nodes, and Foundry",
            "p1_title": "Arbitrum Starter Project 1: Arbitrum Stylus Rust Smart Contract",
            "p1_desc": "Develop a WebAssembly-compiled Rust smart contract using Offchain Labs' official Stylus Rust starter repository for 10x gas savings.",
            "p1_repo": "https://github.com/OffchainLabs/stylus-hello-world",
            "p2_title": "Arbitrum Starter Project 2: Arbitrum Nitro & Orbit Tutorials DApp",
            "p2_desc": "Deploy custom smart contracts and L3 Orbit chain scripts with Offchain Labs' official Arbitrum developer tutorials.",
            "p2_repo": "https://github.com/OffchainLabs/arbitrum-tutorials"
        },
        "optimism": {
            "arch": "OP Stack infrastructure, Superchain inter-rollup messaging, and Bedrock rollup execution layer.",
            "tool": "Solidity, OP Stack Devnet CLI, Foundry, and Wagmi",
            "p1_title": "Optimism Starter Project 1: OP Stack Cross-Domain Messenger",
            "p1_desc": "Build and execute cross-domain L1 <-> L2 message passing using the official Optimism Developer Tutorial codebase.",
            "p1_repo": "https://github.com/ethereum-optimism/optimism-tutorial",
            "p2_title": "Optimism Starter Project 2: OP Superchain Ecosystem DApp",
            "p2_desc": "Construct an OP Superchain-compatible governance and voting portal using official Optimism ecosystem templates.",
            "p2_repo": "https://github.com/ethereum-optimism/ecosystem-contributions"
        },
        "base": {
            "arch": "Base Layer-2 execution engine, Coinbase Wallet Smart Wallet standards, and Onchain app architecture.",
            "tool": "Solidity (^0.8.20), Coinbase Smart Wallet SDK, Foundry, and MOR Finance APIs",
            "p1_title": "Base Starter Project 1: Coinbase OnchainKit Developer SDK",
            "p1_desc": "Integrate Coinbase's official OnchainKit React components and TypeScript utilities for Base L2 dApps.",
            "p1_repo": "https://github.com/coinbase/onchainkit",
            "p2_title": "Base Starter Project 2: Coinbase Build-Onchain-Apps Template",
            "p2_desc": "Build a zero-friction mobile Web3 dApp with Paymaster gasless transactions using Coinbase's official Build-Onchain-Apps kit.",
            "p2_repo": "https://github.com/coinbase/build-onchain-apps"
        },
        "polygon": {
            "arch": "Polygon PoS architecture, Polygon CDK (Chain Development Kit), and zkEVM zero-knowledge rollups.",
            "tool": "Solidity, Polygon CDK CLI, Hardhat, and Plonky2 ZK verifiers",
            "p1_title": "Polygon Starter Project 1: Polygon CDK Core Node Repository",
            "p1_desc": "Explore and configure custom ZK-Rollups and Validium chains with Polygon's official Chain Development Kit (CDK).",
            "p1_repo": "https://github.com/0xPolygon/cdk",
            "p2_title": "Polygon Starter Project 2: Polygon Kurtosis CDK Devnet Package",
            "p2_desc": "Deploy a private, portable, and modular Polygon CDK devnet using the official Kurtosis-CDK package.",
            "p2_repo": "https://github.com/0xPolygon/kurtosis-cdk"
        },
        "avalanche": {
            "arch": "Avalanche Snow consensus engine, Primary Network (C-Chain, P-Chain, X-Chain), and Subnet Virtual Machines.",
            "tool": "Solidity, Avalanche CLI, Avalanche Warp Messaging (AWM), and Ethers.js",
            "p1_title": "Avalanche Starter Project 1: Ava Labs Avalanche Starter Kit",
            "p1_desc": "Deploy custom EVM Subnets and configure inter-subnet messaging with the official Ava Labs Avalanche Starter Kit.",
            "p1_repo": "https://github.com/ava-labs/avalanche-starter-kit",
            "p2_title": "Avalanche Starter Project 2: Avalanche Teleporter Cross-Subnet DApp",
            "p2_desc": "Implement cross-subnet liquidity bridges and contracts with Ava Labs' official Teleporter AWM messaging protocol.",
            "p2_repo": "https://github.com/ava-labs/teleporter"
        },
        "solana": {
            "arch": "Solana Sealevel parallel smart contract runtime, Proof-of-History (PoH) consensus, and Accounts model.",
            "tool": "Rust, Anchor Framework, Solana CLI, and @solana/web3.js",
            "p1_title": "Solana Starter Project 1: Coral XYZ Anchor Framework Rust Program",
            "p1_desc": "Write high-throughput Rust programs using Coral XYZ's official Anchor framework repository with Program Derived Addresses.",
            "p1_repo": "https://github.com/coral-xyz/anchor",
            "p2_title": "Solana Starter Project 2: Solana Foundation Next.js DApp Scaffold",
            "p2_desc": "Build a Solana Web3 dApp with Phantom wallet connection using the official Solana Developers Next.js DApp Scaffold.",
            "p2_repo": "https://github.com/solana-developers/solana-dapp-next"
        },
        "polkadot": {
            "arch": "Polkadot heterogeneous multi-chain framework, Relay Chain shared security, Parachains, and XCM cross-consensus messaging.",
            "tool": "Rust, Substrate FRAME framework, cargo-contract, ink! SDK, and Pop Network CLI",
            "p1_title": "Polkadot Starter Project 1: Parity Substrate Framework Core Repository",
            "p1_desc": "Build application-specific modular blockchains with custom FRAME runtime pallets on Substrate.",
            "p1_repo": "https://github.com/paritytech/substrate",
            "p2_title": "Polkadot Starter Project 2: use-ink WebAssembly ink! Smart Contracts",
            "p2_desc": "Write, test, and deploy Rust-based WebAssembly smart contracts on Substrate Contracts parachains using ink!.",
            "p2_repo": "https://github.com/use-ink/ink"
        },
        "substrate": {
            "arch": "Substrate modular blockchain development framework, FRAME runtime pallets, and forkless WebAssembly upgrades.",
            "tool": "Rust, Substrate CLI, FRAME pallets, cargo-contract, and Chopsticks devnet",
            "p1_title": "Substrate Starter Project 1: Parity Substrate Framework Core Repository",
            "p1_desc": "Build application-specific modular blockchains with custom FRAME runtime pallets on Substrate.",
            "p1_repo": "https://github.com/paritytech/substrate",
            "p2_title": "Substrate Starter Project 2: use-ink WebAssembly ink! Smart Contracts",
            "p2_desc": "Write, test, and deploy Rust-based WebAssembly smart contracts on Substrate Contracts parachains using ink!.",
            "p2_repo": "https://github.com/use-ink/ink"
        },
        "starknet": {
            "arch": "Starknet STARK validity proofs, Cairo Virtual Machine (CairoVM), and native Account Abstraction.",
            "tool": "Cairo (^2.6.0), Scarb, Starkli, Snforge, and Starknet.js",
            "p1_title": "Starknet Starter Project 1: Starknet Cairo Core Repository",
            "p1_desc": "Write scalable zero-knowledge smart contracts in Cairo 2.0 with native account abstraction.",
            "p1_repo": "https://github.com/starkware-libs/cairo",
            "p2_title": "Starknet Starter Project 2: OpenZeppelin Cairo Smart Contracts",
            "p2_desc": "Deploy audited token standards, components, and access control contracts on Starknet Sepolia testnet.",
            "p2_repo": "https://github.com/OpenZeppelin/cairo-contracts"
        },
        "aptos": {
            "arch": "Aptos Layer-1 blockchain, MoveVM execution environment, and Block-STM parallel transaction execution engine.",
            "tool": "Move CLI, Aptos CLI, Aptos TypeScript SDK, and Aptos Framework",
            "p1_title": "Aptos Starter Project 1: Aptos Core Blockchain Repository",
            "p1_desc": "Develop and deploy high-throughput Move smart contracts and resource accounts with parallel execution.",
            "p1_repo": "https://github.com/aptos-labs/aptos-core",
            "p2_title": "Aptos Starter Project 2: Aptos Developer Docs & Contract Examples",
            "p2_desc": "Build production Move modules and frontends with Petra Wallet on Aptos testnet.",
            "p2_repo": "https://github.com/aptos-labs/aptos-developer-docs"
        }
    }
    
    details = ECOSYSTEM_DETAILS.get(t_id, ECOSYSTEM_DETAILS["ethereum"])

    lessons: List[Lesson] = [
        # 1. Introductory Lesson 1
        Lesson(
            id=f"{t_id}-1",
            level_id=1,
            title=f"Introductory Lesson 1: {name} Architecture & Core Principles",
            duration="12 mins",
            xp=150,
            content=f"""# Introductory Lesson 1: {name} Architecture & Core Principles

Welcome to the **{name} Ecosystem Track** on Developer Academy!

### Overview & Architecture
{details['arch']}

### Key Concepts:
1. **Consensus & Execution**: Learn how transactions are validated, ordered, and committed to state.
2. **Network Topology**: Explore mainnet, testnet RPC endpoints, and block explorer verification.
3. **Gas & Execution Efficiency**: Understand execution limits, state storage costs, and transaction fees.

### AI Mentor Assistance:
You can switch to **OpenClaw (Education Mentor)** in the chat panel above to ask questions about {name}'s consensus or architecture at any point!
""",
            quiz=[
                QuizQuestion(
                    question=f"Which architectural model powers transaction processing on {name}?",
                    options=[
                        details['arch'],
                        "A centralized SQL relational database server.",
                        "Unencrypted local file storage.",
                        "Legacy FTP file transfers."
                    ],
                    correct_idx=0
                ),
                QuizQuestion(
                    question=f"Why is understanding network RPC endpoints critical when developing for {name}?",
                    options=[
                        "RPC nodes broadcast transactions, query on-chain state, and interface between dApps and nodes.",
                        "RPC nodes compile CSS stylesheets for frontend designs.",
                        "RPC nodes replace Web3 wallet seed phrases.",
                        "RPC nodes parse HTML tags."
                    ],
                    correct_idx=0
                )
            ],
            exercise=CodingExercise(
                instruction=f"Write a smart contract comment initializing the {name} architecture definition. Ensure your code contains the keywords `{t_id}` and `architecture`.",
                template=f"// Ecosystem: {t_id}\n// Defined below:\n",
                required_keywords=[t_id, "architecture"]
            )
        ),

        # 2. Introductory Lesson 2
        Lesson(
            id=f"{t_id}-2",
            level_id=2,
            title=f"Introductory Lesson 2: {name} Environment Setup & Tooling",
            duration="15 mins",
            xp=150,
            content=f"""# Introductory Lesson 2: {name} Environment Setup & Tooling

In this second introductory module, you will configure your developer environment to compile, test, and deploy smart contracts on **{name}**.

### Developer Tooling Chain:
- **Primary Frameworks**: {details['tool']}.
- **RPC & Provider Bindings**: Configure custom network RPC URLs, chain IDs, and testnet faucets.
- **Verification Workflow**: Submit contract source code and ABI artifacts to block explorers.

### AI Mentor Assistance:
If you encounter compiler warnings or deployment errors, switch to **Hermes (Engineering Mentor)** for automated code reviews and fixes!
""",
            quiz=[
                QuizQuestion(
                    question=f"Which developer toolchain is recommended for {name} contract development?",
                    options=[
                        details['tool'],
                        "Microsoft Word and Excel macros.",
                        "Adobe Photoshop CS6.",
                        "Python 2.7 legacy script interpreters."
                    ],
                    correct_idx=0
                ),
                QuizQuestion(
                    question=f"What step must be performed after deploying a contract on {name} testnets?",
                    options=[
                        "Verify contract source code and ABI artifacts on the block explorer.",
                        "Delete the private key from disk.",
                        "Restart the local operating system.",
                        "Format the hard drive."
                    ],
                    correct_idx=0
                )
            ],
            exercise=CodingExercise(
                instruction=f"Write a configuration comment referencing the compiler setup for {name}. Ensure your code contains `{t_id}` and `compiler`.",
                template=f"// {name} Config Setup\n",
                required_keywords=[t_id, "compiler"]
            )
        ),

        # 3. Starter Project 1
        Lesson(
            id=f"{t_id}-3",
            level_id=3,
            title=details['p1_title'],
            duration="20 mins",
            xp=200,
            content=f"""# {details['p1_title']}

### Project Blueprint:
{details['p1_desc']}

### 📦 GitHub Starter Repository & Quickstart:
- **GitHub Repository**: [{details['p1_repo']}]({details['p1_repo']})
- **Clone Command**:
```bash
git clone {details['p1_repo']}.git
cd {details['p1_repo'].split('/')[-1]}
npm install
```

### Hands-On Instructions:
1. **Clone & Explore**: Clone the starter repository above to your local environment.
2. **Contract Logic**: Implement state variables, event logging, and access control modifiers.
3. **Compilation**: Run local compilation scripts using {details['tool']}.
4. **Testnet Deployment**: Broadcast contract bytecodes to the testnet RPC node.
""",
            quiz=[
                QuizQuestion(
                    question=f"What is the primary objective of {details['p1_title']}?",
                    options=[
                        details['p1_desc'],
                        "To format static CSS stylesheets.",
                        "To send manual HTTP GET requests."
                    ],
                    correct_idx=0
                )
            ],
            exercise=CodingExercise(
                instruction=f"Write a contract structure comment for Starter Project 1. The code must contain `{t_id}` and `project1`.",
                template=f"// {details['p1_title']}\n// GitHub: {details['p1_repo']}\n",
                required_keywords=[t_id, "project1"]
            )
        ),

        # 4. Starter Project 2
        Lesson(
            id=f"{t_id}-4",
            level_id=4,
            title=details['p2_title'],
            duration="25 mins",
            xp=250,
            content=f"""# {details['p2_title']}

### Project Blueprint:
{details['p2_desc']}

### 📦 GitHub Starter Repository & Quickstart:
- **GitHub Repository**: [{details['p2_repo']}]({details['p2_repo']})
- **Clone Command**:
```bash
git clone {details['p2_repo']}.git
cd {details['p2_repo'].split('/')[-1]}
npm install
```

### AI Mentor Integration:
- **OpenClaw (Education)**: Guides your users through onboarding and learning recommendations.
- **Hermes (Engineering)**: Reviews your frontend contract calls, debugging state shifts in real-time.
""",
            quiz=[
                QuizQuestion(
                    question=f"How do OpenClaw & Hermes AI Mentors assist in Starter Project 2?",
                    options=[
                        "OpenClaw provides education & onboarding guidance while Hermes offers real-time engineering and code review support.",
                        "They disable Web3 wallet connections.",
                        "They convert Rust code to HTML tables."
                    ],
                    correct_idx=0
                )
            ],
            exercise=CodingExercise(
                instruction=f"Write a dApp integration comment for Starter Project 2. The code must contain `{t_id}` and `project2`.",
                template=f"// {details['p2_title']}\n// GitHub: {details['p2_repo']}\n",
                required_keywords=[t_id, "project2"]
            )
        ),

        # 5. Full Ecosystem Roadmap & Capstone Projects
        Lesson(
            id=f"{t_id}-5",
            level_id=5,
            title=f"{name} Full Ecosystem Roadmap & Capstone Projects",
            duration="30 mins",
            xp=300,
            content=f"""# {name} Full Ecosystem Roadmap & Capstone Projects

Congratulations on completing the Introductory Lessons, Quizzes, Coding Exercises, and Starter Projects for **{name}**!

### Comprehensive Ecosystem Roadmap Scope:
1. **Intermediate Modules**: Multi-sig contracts, tokenomics, state optimization.
2. **Advanced Protocols**: Cross-chain messaging, ZK proof verification, high-throughput scaling.
3. **DeFi Protocols**: AMMs, liquidity pools, collateralized lending, yield vaults.
4. **NFTs & Standards**: Dynamic NFTs, soulbound tokens, marketplace contracts.
5. **Governance**: On-chain DAOs, voting delegation, timelocks.
6. **Hackathons & Bounties**: Ecosystem hackathons, MOR builder bounties, open-source public goods.
7. **Certifications & Capstones**: On-chain verifiable credentials and production capstone projects.
""",
            quiz=[
                QuizQuestion(
                    question=f"Which advanced topics are covered in the complete {name} Ecosystem Roadmap?",
                    options=[
                        "Intermediate, Advanced Protocols, DeFi, NFTs, Governance, Hackathons, Certifications, and Capstone Projects.",
                        "Basic HTML styling only.",
                        "Legacy PHP scripting."
                    ],
                    correct_idx=0
                )
            ],
            exercise=CodingExercise(
                instruction=f"Write a final capstone completion comment. The code must contain `{t_id}` and `capstone`.",
                template=f"// {name} Capstone Status:\n",
                required_keywords=[t_id, "capstone"]
            )
        )
    ]
    
    return lessons

def get_courses_list(track: str = "fundamentals") -> List[Course]:
    """Compile courses list separating universal fundamentals track from chain-specific tracks."""
    t_id = track.lower().strip()
    if t_id == "fundamentals":
        levels_meta = [
            {"id": 1, "title": "Blockchain Fundamentals & Web3 Core"},
            {"id": 2, "title": "Smart Contract Architecture"},
            {"id": 3, "title": "Token Standards & ERCs"},
            {"id": 4, "title": "Protocol Security & Auditing"},
            {"id": 5, "title": "DeFi Fundamentals & Liquidity"},
            {"id": 6, "title": "MOR Finance Protocols & Governance"},
        ]
        courses = []
        for lm in levels_meta:
            level_id = lm["id"]
            lessons = [l for l in LESSONS_DB.values() if l.level_id == level_id]
            courses.append(
                Course(
                    level_id=level_id,
                    title=lm["title"],
                    total_lessons=len(lessons),
                    lessons=lessons
                )
            )
        return courses
    else:
        chain_name = "Polkadot / Substrate" if t_id in ("polkadot", "substrate") else t_id.capitalize()
        t_lessons = get_track_lessons(t_id)
        chain_meta = [
            {"id": 1, "title": f"{chain_name} Architecture & Core Principles", "lessons": [t_lessons[0]] if len(t_lessons) > 0 else []},
            {"id": 2, "title": f"{chain_name} Environment Setup & Tooling", "lessons": [t_lessons[1]] if len(t_lessons) > 1 else []},
            {"id": 3, "title": f"{chain_name} Starter Project 1 (GitHub Repo)", "lessons": [t_lessons[2]] if len(t_lessons) > 2 else []},
            {"id": 4, "title": f"{chain_name} Starter Project 2 (Full-Stack DApp)", "lessons": [t_lessons[3]] if len(t_lessons) > 3 else []},
            {"id": 5, "title": f"{chain_name} Capstone & Testnet Deployment", "lessons": [t_lessons[4]] if len(t_lessons) > 4 else []},
        ]
        courses = []
        for cm in chain_meta:
            courses.append(
                Course(
                    level_id=cm["id"],
                    title=cm["title"],
                    total_lessons=len(cm["lessons"]),
                    lessons=cm["lessons"]
                )
            )
        return courses
