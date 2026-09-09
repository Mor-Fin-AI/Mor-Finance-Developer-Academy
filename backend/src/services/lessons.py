"""
Curriculum and Lessons Database for the Developer Academy.
Contains rich educational Markdown text, multi-choice quizzes (25–30 questions per chain),
and hands-on smart contract deployment challenges.
"""
import random
from typing import Dict, List, Any, Optional
from src.models.lesson import QuizQuestion, CodingExercise, Lesson, Course

def _shuffle_quiz_questions(quiz_list: List[QuizQuestion], seed_prefix: str) -> List[QuizQuestion]:
    """Deterministically randomize option order so correct answers are naturally spread across A, B, C, D."""
    shuffled: List[QuizQuestion] = []
    for idx, q in enumerate(quiz_list):
        rng = random.Random(f"{seed_prefix}-{idx}-{q.question}")
        correct_val = q.options[q.correct_idx]
        opts = list(q.options)
        rng.shuffle(opts)
        new_correct_idx = opts.index(correct_val)
        shuffled.append(
            QuizQuestion(
                question=q.question,
                options=opts,
                correct_idx=new_correct_idx
            )
        )
    return shuffled

# ─── CORE FUNDAMENTALS LESSONS ────────────────────────────────────────────────
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
                    "Peer-to-peer networks distribute data and control equally among participating nodes.",
                    "Peer-to-peer networks are slower and less secure.",
                    "Client-server networks only run on Unix machines."
                ],
                correct_idx=1
            ),
            QuizQuestion(
                question="Which protocol is commonly used in modern blockchains like Ethereum for peer communication?",
                options=["HTTP", "FTP", "DevP2P / LibP2P", "SMTP"],
                correct_idx=2
            ),
            QuizQuestion(
                question="What role does a distributed ledger play in a decentralized network?",
                options=[
                    "Every validator maintains an immutable synchronized copy of state transitions.",
                    "It stores temporary browser session cookies.",
                    "It hosts centralized frontend web servers.",
                    "It encrypts hard drives locally."
                ],
                correct_idx=0
            ),
            QuizQuestion(
                question="What prevents bad actors from rewriting history on a consensus-driven P2P blockchain?",
                options=[
                    "Cryptographic hashing combined with majority Byzantine Fault Tolerant consensus.",
                    "Legal copyright agreements.",
                    "Manual administrator passwords.",
                    "Cloud firewall rules."
                ],
                correct_idx=0
            ),
            QuizQuestion(
                question="In blockchain P2P gossip networks, what is transaction propagation?",
                options=[
                    "Nodes broadcasting verified unconfirmed transactions to neighboring peers until the whole network is informed.",
                    "Sending private emails between wallet owners.",
                    "Deleting invalid blocks from disk.",
                    "Streaming video files over torrents."
                ],
                correct_idx=0
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
                    "To cryptographically sign transactions and approve transfers without revealing secrets.",
                    "To encrypt files on your local hard drive.",
                    "To generate random blocks in mining."
                ],
                correct_idx=1
            ),
            QuizQuestion(
                question="What does collision resistance in cryptographic hash functions guarantee?",
                options=[
                    "It is computationally infeasible to find two distinct inputs x and y such that hash(x) == hash(y).",
                    "Hashes can never be decrypted.",
                    "Hashes always contain 128 characters.",
                    "Hashes run in constant zero milliseconds."
                ],
                correct_idx=0
            ),
            QuizQuestion(
                question="How is a public blockchain wallet address typically derived?",
                options=[
                    "By hashing the public key derived from the ECDSA/Ed25519 private key curve.",
                    "By generating a random 6-digit PIN code.",
                    "By asking an ISP for a static IP address.",
                    "By registering a username on a DNS server."
                ],
                correct_idx=0
            ),
            QuizQuestion(
                question="Why is elliptic curve digital signature algorithm (ECDSA/Ed25519) crucial in Web3?",
                options=[
                    "It allows anyone with the public key to mathematically verify transaction authenticity without knowing the private key.",
                    "It compresses smart contract bytecode.",
                    "It converts Solidity code into HTML.",
                    "It prevents high gas prices automatically."
                ],
                correct_idx=0
            )
        ],
        exercise=CodingExercise(
            instruction="Create a smart contract comment defining a mock private key variable. The code must contain the word 'privateKey' and 'Keccak256'.",
            template="// Define variables below:\n",
            required_keywords=["privateKey", "Keccak256"]
        )
    ),

    # ── Level 2: Smart Contract Architecture
    "2-1": Lesson(
        id="2-1",
        level_id=2,
        title="Solidity Fundamentals & State Variables",
        duration="15 mins",
        xp=150,
        content="""# Solidity Fundamentals & State Variables

Smart contracts are immutable programs deployed on-chain that execute deterministic logic.

### Contract Anatomy
1. **SPDX License Identifier**: Tells users and compilers how the code is licensed.
2. **Pragma Directive**: Specifies the compiler version (e.g., `pragma solidity ^0.8.20;`).
3. **State Variables**: Permanently stored in contract storage on the blockchain.
4. **Functions**: Read or modify state variables.
""",
        quiz=[
            QuizQuestion(
                question="Where are state variables stored in a smart contract?",
                options=["In temporary memory", "On the blockchain's persistent storage", "In the call stack", "On the local hard drive"],
                correct_idx=1
            ),
            QuizQuestion(
                question="What is the purpose of the `pragma solidity` directive?",
                options=[
                    "It sets the gas limit for execution.",
                    "It specifies the compiler version the contract is written for.",
                    "It imports external npm packages.",
                    "It connects to MetaMask."
                ],
                correct_idx=1
            ),
            QuizQuestion(
                question="What is the gas difference between `view` functions and state-modifying functions when called externally?",
                options=[
                    "`view` functions executed off-chain via RPC are free of gas, while state-modifying transactions consume gas.",
                    "`view` functions cost double the gas.",
                    "Both cost exactly 21,000 gas.",
                    "State-modifying functions are free."
                ],
                correct_idx=0
            ),
            QuizQuestion(
                question="Which keyword in Solidity restricts state variable access to within the contract and derived contracts?",
                options=["public", "external", "internal", "private"],
                correct_idx=2
            ),
            QuizQuestion(
                question="What occurs when an integer arithmetic overflow happens in Solidity ^0.8.0?",
                options=[
                    "The transaction automatically reverts due to built-in overflow checks.",
                    "The number wraps around silently like in Solidity 0.4.",
                    "The compiler crashes.",
                    "The miner receives extra gas."
                ],
                correct_idx=0
            )
        ],
        exercise=CodingExercise(
            instruction="Write a minimal Solidity contract named `StorageExample` that declares a `uint256 public count;` state variable.",
            template="// SPDX-License-Identifier: MIT\npragma solidity ^0.8.20;\n\ncontract StorageExample {\n    // Declare count variable here\n}\n",
            required_keywords=["contract", "uint256", "public", "count"]
        )
    ),

    # ── Level 3: Token Standards
    "3-1": Lesson(
        id="3-1",
        level_id=3,
        title="ERC-20 Fungible Token Standard",
        duration="18 mins",
        xp=200,
        content="""# ERC-20 Fungible Token Standard

The ERC-20 standard defines a common interface for fungible tokens on EVM networks. Every token unit is identical in type and value.

### Key ERC-20 Functions:
- `totalSupply()`: Returns total circulating supply.
- `balanceOf(account)`: Returns token balance of an address.
- `transfer(to, amount)`: Transfers tokens from caller to recipient.
- `approve(spender, amount)` & `transferFrom(from, to, amount)`: Allows third-party contracts (DEXs/lending) to spend tokens on behalf of a user.
""",
        quiz=[
            QuizQuestion(
                question="What is the primary characteristic of an ERC-20 token?",
                options=[
                    "Each token has a unique ID and metadata (non-fungible).",
                    "All tokens are identical and interchangeable (fungible).",
                    "It can only be held by validators.",
                    "It does not require gas to transfer."
                ],
                correct_idx=1
            ),
            QuizQuestion(
                question="Which function pair allows a decentralized exchange (DEX) to swap tokens on your behalf?",
                options=[
                    "`burn` and `mint`",
                    "`approve` and `transferFrom`",
                    "`deposit` and `withdraw`",
                    "`lock` and `unlock`"
                ],
                correct_idx=1
            ),
            QuizQuestion(
                question="What security vulnerability can occur if an ERC-20 `transferFrom` lacks reentrancy guards or safe checks?",
                options=[
                    "Reentrancy or allowance underflow exploits.",
                    "CSS stylesheet injection.",
                    "Memory leak on node servers.",
                    "DNS spoofing."
                ],
                correct_idx=0
            ),
            QuizQuestion(
                question="What standard decimal precision is used by the vast majority of ERC-20 tokens?",
                options=["6 decimals", "8 decimals", "18 decimals", "0 decimals"],
                correct_idx=2
            ),
            QuizQuestion(
                question="Why is emitting a `Transfer` event required by the ERC-20 specification?",
                options=[
                    "It allows block explorers, indexers, and wallets to detect state changes and update balances off-chain.",
                    "It increases contract bytecode size.",
                    "It resets contract allowances.",
                    "It burns unused gas."
                ],
                correct_idx=0
            )
        ],
        exercise=CodingExercise(
            instruction="Implement an ERC-20 interface snippet containing `function transfer(address to, uint256 amount) external returns (bool);`.",
            template="// SPDX-License-Identifier: MIT\npragma solidity ^0.8.20;\n\ninterface IERC20 {\n    // Add transfer signature here\n}\n",
            required_keywords=["function", "transfer", "address", "uint256", "returns", "bool"]
        )
    ),

    # ── Level 4: Security & Auditing
    "4-1": Lesson(
        id="4-1",
        level_id=4,
        title="Reentrancy Attacks & Checks-Effects-Interactions Pattern",
        duration="20 mins",
        xp=250,
        content="""# Reentrancy Attacks & Security Best Practices

Reentrancy is one of the most famous vulnerabilities in smart contract history, responsible for the 2016 DAO hack.

### How Reentrancy Occurs:
1. Contract A calls an external contract B or sends ETH (`call{value: x}("")`).
2. Execution control transfers to Contract B before Contract A updates its internal balance.
3. Contract B calls back into Contract A's withdrawal function, draining funds repeatedly!

### Defense Mechanisms:
- **Checks-Effects-Interactions Pattern**: Always update internal state (Effects) before making external calls (Interactions).
- **ReentrancyGuard**: Use OpenZeppelin's `nonReentrant` modifier.
""",
        quiz=[
            QuizQuestion(
                question="What is the Checks-Effects-Interactions pattern?",
                options=[
                    "A design pattern where internal state is updated BEFORE external contract calls or transfers are executed.",
                    "A pattern where external calls are made first to check liquidity.",
                    "A compiler setting in Hardhat.",
                    "A frontend React hook."
                ],
                correct_idx=0
            ),
            QuizQuestion(
                question="Which OpenZeppelin modifier prevents recursive reentry into smart contract functions?",
                options=["onlyOwner", "whenNotPaused", "nonReentrant", "initializer"],
                correct_idx=2
            ),
            QuizQuestion(
                question="Why is `transfer()` no longer unconditionally recommended for sending ETH in modern contracts?",
                options=[
                    "It imposes a strict 2,300 gas limit which breaks contracts using account abstraction or multisigs.",
                    "It always fails on testnets.",
                    "It uses too much memory.",
                    "It was removed in Solidity 0.8."
                ],
                correct_idx=0
            ),
            QuizQuestion(
                question="What security risk is posed by `tx.origin` authentication?",
                options=[
                    "Phishing attacks where a malicious intermediary contract tricks a victim into calling a privileged function.",
                    "Integer overflow.",
                    "Flash loan liquidation.",
                    "Gas starvation."
                ],
                correct_idx=0
            ),
            QuizQuestion(
                question="What is the purpose of static analysis tools like Slither and Mythril in smart contract auditing?",
                options=[
                    "To automatically inspect ASTs and CFGs to flag vulnerabilities like uninitialized storage and reentrancy before deployment.",
                    "To compress video files for IPFS.",
                    "To generate CSS animations.",
                    "To manage seed phrases."
                ],
                correct_idx=0
            )
        ],
        exercise=CodingExercise(
            instruction="Implement a secure withdrawal pattern using the `nonReentrant` modifier keyword.",
            template="// SPDX-License-Identifier: MIT\npragma solidity ^0.8.20;\n\ncontract SecureVault {\n    mapping(address => uint256) public balances;\n\n    // Implement secure withdraw function\n}\n",
            required_keywords=["withdraw", "nonReentrant", "balances", "msg.sender"]
        )
    ),

    # ── Level 5: Testnet Deployment Challenge
    "5-1": Lesson(
        id="5-1",
        level_id=5,
        title="Ethereum / EVM Testnet Deployment Challenge",
        duration="25 mins",
        xp=300,
        content="""# EVM Testnet Deployment Challenge

Deploy your verified smart contract to Ethereum Sepolia or Base Sepolia testnets.

### Deployment Verification Steps:
1. Compile your contract with Hardhat / Foundry (`forge build`).
2. Set your testnet RPC URL and deployer private key.
3. Broadcast the deployment transaction to Sepolia testnet (`forge create`).
4. Verify contract source code on Etherscan or Basescan block explorer.
""",
        quiz=[
            QuizQuestion(
                question="What artifact is generated by Solidity compilers for frontend interfaces to interact with deployed contracts?",
                options=[
                    "Application Binary Interface (ABI) JSON specification.",
                    "PNG favicon image.",
                    "CSS stylesheet.",
                    "Node.js package.json."
                ],
                correct_idx=0
            ),
            QuizQuestion(
                question="What is the purpose of verifying contract source code on block explorers?",
                options=[
                    "It proves the compiled bytecode matches the published human-readable source code for transparency.",
                    "It prevents anyone from calling contract functions.",
                    "It hides transaction history.",
                    "It refunds deployment gas."
                ],
                correct_idx=0
            ),
            QuizQuestion(
                question="Which testnet is the primary recommended testnet for Ethereum protocol upgrades and testing?",
                options=["Sepolia", "Ropsten (deprecated)", "Mainnet", "Bitcoin Testnet"],
                correct_idx=0
            ),
            QuizQuestion(
                question="What toolchain command in Foundry compiles and builds smart contract bytecode?",
                options=["forge build", "npm start", "git push", "solc --clean"],
                correct_idx=0
            ),
            QuizQuestion(
                question="Why should private keys NEVER be hardcoded into source code repositories?",
                options=[
                    "Automated bots continuously scrape public repos to immediately drain funds from exposed keys.",
                    "It slows down compiler performance.",
                    "It makes the contract name too long.",
                    "It changes the contract address."
                ],
                correct_idx=0
            )
        ],
        exercise=CodingExercise(
            instruction="Write a deployment script comment declaring the Sepolia testnet target and contract verification. Must contain 'Sepolia', 'deploy', and 'verify'.",
            template="// Deployment Script\n",
            required_keywords=["Sepolia", "deploy", "verify"]
        )
    ),

    # ── Level 6: MOR Finance Protocols
    "6-1": Lesson(
        id="6-1",
        level_id=6,
        title="MOR Finance Protocols & AI Smart Agents",
        duration="25 mins",
        xp=300,
        content="""# MOR Finance Protocols & AI Smart Agents

MOR Finance pioneers the convergence of decentralized AI, on-chain capital allocation, and automated smart agent economies.

### Core Ecosystem Pillars:
1. **Morpheus Smart Agents**: Decentralized AI agents executing smart contract transactions on behalf of users.
2. **Compute & Capital Provision**: Directing computational power and capital rewards to open-source developers.
3. **Decentralized Governance**: Token-weighted protocol steering and community-directed grants.
""",
        quiz=[
            QuizQuestion(
                question="What is a Morpheus AI Smart Agent in the MOR Finance ecosystem?",
                options=[
                    "An autonomous decentralized software agent combining LLM reasoning with direct smart contract interaction capabilities.",
                    "A static HTML web page.",
                    "A centralized cloud chatbot running on a private database.",
                    "A graphic design tool."
                ],
                correct_idx=0
            ),
            QuizQuestion(
                question="How does MOR Finance incentivize open-source AI and Web3 developer contributions?",
                options=[
                    "Through proof-of-contribution emission rewards, ecosystem grants, and compute rewards.",
                    "By charging developers high subscription fees.",
                    "By restricting code access.",
                    "Through manual fiat wire transfers."
                ],
                correct_idx=0
            ),
            QuizQuestion(
                question="What role does the Developer Academy play in the MOR Finance ecosystem?",
                options=[
                    "Onboarding, training, certifying, and connecting developers to grant applications, ecosystem bounties, and Web3 careers.",
                    "Selling proprietary hardware.",
                    "Managing fiat banking licenses.",
                    "Hosting video streaming servers."
                ],
                correct_idx=0
            ),
            QuizQuestion(
                question="Which cryptographic standard ensures AI agents only execute approved on-chain transactions?",
                options=[
                    "Session keys with granular permission scopes and spend limits.",
                    "Unrestricted master private keys.",
                    "PlainText passwords.",
                    "Cookie tokens."
                ],
                correct_idx=0
            ),
            QuizQuestion(
                question="How do decentralized AI agents interact with liquidity and DeFi protocols on-chain?",
                options=[
                    "By querying on-chain oracle feeds, calculating optimal paths, and submitting signed transactions via RPC nodes.",
                    "By making phone calls to market makers.",
                    "By sending physical checks.",
                    "Through web scraping only."
                ],
                correct_idx=0
            )
        ],
        exercise=CodingExercise(
            instruction="Write a contract comment declaring an AI Agent interaction module. Must contain 'SmartAgent', 'Morpheus', and 'Governance'.",
            template="// MOR Finance AI Protocol\n",
            required_keywords=["SmartAgent", "Morpheus", "Governance"]
        )
    )
}

# Deterministically randomize option orders for LESSONS_DB so correct choices are naturally spread across A, B, C, D
for _l_id, _l_obj in LESSONS_DB.items():
    _l_obj.quiz = _shuffle_quiz_questions(_l_obj.quiz, f"lessons_db-{_l_id}")

# ─── MULTI-CHAIN TRACK CURRICULUM GENERATOR ────────────────────────────────────
# Generates 5 Comprehensive Modules with 25–30 Quiz Questions + 1 Deployment Challenge per Chain

CHAIN_METADATA: Dict[str, Dict[str, Any]] = {
    "arbitrum": {
        "name": "Arbitrum",
        "currency": "ETH",
        "lang": "Solidity / Rust",
        "vm": "EVM (Nitro) + WASM (Stylus)",
        "framework": "Stylus SDK & Hardhat/Foundry",
        "testnet": "Arbitrum Sepolia",
        "explorer": "Arbiscan",
        "repo1": "https://github.com/OffchainLabs/nitro",
        "repo2": "https://github.com/OffchainLabs/stylus-sdk-rs",
        "modules": [
            {
                "title": "Arbitrum Nitro Architecture, One/Nova Topologies & Rollup Messaging",
                "desc": "Master Arbitrum Nitro architecture: WASM-based State Transition Function (Wasm STF), ArbOS execution, Sequencer batching, and L1-L2 cross-chain inbox messaging.",
                "keywords": ["ArbitrumNitro", "ArbOS"],
                "questions": [
                    ("What is the execution engine behind Arbitrum Nitro that replaces the classic AVM?",
                     ["A WASM-based emulator running standard geth core inside WebAssembly.",
                      "A customized JavaScript V8 runtime.",
                      "A centralized SQL transaction processor.",
                      "A single-threaded Python interpreter."], 0),
                    ("What is the primary architectural difference between Arbitrum One and Arbitrum Nova?",
                     ["Arbitrum One posts full transaction data to Ethereum L1 with fraud proofs, whereas Nova uses a Data Availability Committee for ultra-low fees in gaming.",
                      "Arbitrum One only supports Bitcoin transactions.",
                      "Arbitrum Nova disables smart contracts completely.",
                      "Both networks share the exact same Data Availability model."], 0),
                    ("How does L1-to-L2 message passing work on Arbitrum?",
                     ["By depositing into the Inbox contract on Ethereum L1, which creates a retryable ticket executed by ArbOS on L2.",
                      "By sending an unencrypted WebSocket packet to node miners.",
                      "By executing a hard-fork on Ethereum L1.",
                      "By creating a temporary DNS record."], 0),
                    ("What are 'Retryable Tickets' in Arbitrum cross-chain messaging?",
                     ["L2 transaction execution requests created on L1 that can be redeemed within a timeout period if gas execution initially fails.",
                      "Refund receipts printed for cancelled transactions.",
                      "Discount vouchers for future gas purchases.",
                      "Temporary testnet tokens."], 0),
                    ("What is the role of the Arbitrum Sequencer?",
                     ["Receiving user transactions, establishing deterministic instant execution ordering, and publishing compressed transaction batches to Ethereum.",
                      "Mining proof-of-work blocks on Bitcoin.",
                      "Generating cryptographic artwork for NFT marketplaces.",
                      "Validating email credentials of users."], 0),
                    ("How does fraud proof verification work during the challenge period on Arbitrum One?",
                     ["Interactive multi-round bisection search narrowing disputes down to a single one-step WASM instruction executed on L1.",
                      "Instant unilateral rollback by a single central administrator.",
                      "Voting via Discord community polls.",
                      "Random lottery selection of valid blocks."], 0)
                ]
            },
            {
                "title": "Arbitrum Stylus SDK & Rust Smart Contract WASM Setup",
                "desc": "Set up the official Stylus Rust toolchain (cargo stylus), compile Rust smart contracts to WebAssembly, configure activation transactions, and benchmark gas execution.",
                "keywords": ["StylusSDK", "cargo-stylus"],
                "questions": [
                    ("What is Arbitrum Stylus?",
                     ["A feature allowing developers to write smart contracts in Rust, C, and C++ compiled to WebAssembly that run alongside EVM contracts at near-native speeds.",
                      "A visual drawing tool for smart contract diagrams.",
                      "A centralized code formatting extension.",
                      "A token bridge for moving Solana tokens to Arbitrum."], 0),
                    ("Which CLI tool is used to compile, check, and deploy Rust smart contracts to Arbitrum Stylus?",
                     ["cargo-stylus",
                      "npm stylus-cli",
                      "anchor build",
                      "truffle compile"], 0),
                    ("What does `cargo stylus check` do before deploying a Rust contract?",
                     ["It performs static analysis and checks WASM exports, memory bounds, and Stylus SDK compatibility.",
                      "It publishes code directly to mainnet without authorization.",
                      "It deletes all Rust compiler warnings.",
                      "It mines 100 testnet blocks."], 0),
                    ("What is the gas cost benefit of executing compute-heavy algorithms in Stylus Rust compared to EVM bytecode?",
                     ["Stylus reduces compute costs by 10x–100x and memory costs by up to 500x.",
                      "Stylus makes transactions 50% more expensive.",
                      "Stylus has identical gas costs to Solidity EVM bytecode.",
                      "Stylus charges zero gas fees forever."], 0),
                    ("How do Stylus WASM contracts interoperate with standard EVM Solidity contracts?",
                     ["They share the exact same global state, contract storage layout, and can seamlessly call each other using standard ABI interfaces.",
                      "They cannot communicate and operate on completely isolated blockchains.",
                      "They require centralized cross-chain bridges.",
                      "They require converting Solidity code to JavaScript."], 0),
                    ("What macro in the Stylus SDK declares the public smart contract entrypoint?",
                     ["#[entrypoint]",
                      "#[main_function]",
                      "#[solidity_export]",
                      "#[public_contract]"], 0)
                ]
            },
            {
                "title": "Stylus Rust Smart Contracts: Memory, Storage & Host I/O",
                "desc": "Implement production Stylus Rust contracts: managing StorageType, StorageU256, StorageVec, reentrancy guards, event emission with evm::log, and custom Solidity ABI export.",
                "keywords": ["StorageU256", "StylusHost"],
                "questions": [
                    ("How does the Stylus Rust SDK handle contract storage without garbage collection?",
                     ["Using typed storage wrappers like StorageU256 and StorageMap that read and write directly to EVM 32-byte storage slots.",
                      "By storing all data in browser cookies.",
                      "By writing to a centralized MongoDB database.",
                      "By storing everything in temporary memory RAM."], 0),
                    ("How do you emit EVM-compatible events from a Stylus Rust smart contract?",
                     ["Using `stylus_sdk::evm::log` or the `#[stylus::event]` macro.",
                      "By writing to standard Linux stdout files.",
                      "By calling `console.log()` in Rust.",
                      "By sending HTTP POST requests to an external server."], 0),
                    ("What is the purpose of `cargo stylus export-abi`?",
                     ["It automatically generates a Solidity ABI and interface definitions from your Rust contract functions.",
                      "It exports private keys to a text file.",
                      "It compiles the contract into an APK file.",
                      "It translates Rust code into Python."], 0),
                    ("Why does Stylus use `#[cfg_attr(not(feature = \"export-abi\"), no_main)]` in Rust contract crates?",
                     ["To export ABI metadata during interface extraction while targeting bare WASM compilation for deployment.",
                      "To disable compilation errors.",
                      "To encrypt the source code.",
                      "To permit unrestricted recursion."], 0),
                    ("How does Stylus prevent out-of-bounds memory allocation attacks in WASM?",
                     ["By enforcing strict WebAssembly page limits and charging gas for WASM memory expansion.",
                      "By running contracts in an unmetered sandbox.",
                      "By disabling dynamic memory allocations entirely.",
                      "By checking user IP addresses."], 0),
                    ("How is msg.sender and msg.value accessed inside a Stylus Rust method?",
                     ["Using `stylus_sdk::msg::sender()` and `stylus_sdk::msg::value()`.",
                      "By reading environment variables from `.env`.",
                      "By querying the local operating system user.",
                      "By passing parameters manually in function arguments."], 0)
                ]
            },
            {
                "title": "Full-Stack Arbitrum DApps & Arbiscan Contract Verification",
                "desc": "Build reactive frontends connecting to Arbitrum Sepolia (Chain ID 421614), integrate Viem/Wagmi with Arbitrum RPC nodes, and verify multi-contract deployments on Arbiscan.",
                "keywords": ["Arbiscan", "ArbitrumSepolia"],
                "questions": [
                    ("What is the Chain ID for the Arbitrum Sepolia testnet?",
                     ["421614",
                      "1",
                      "8453",
                      "11155111"], 0),
                    ("Which block explorer is the primary explorer for Arbitrum One and Arbitrum Sepolia?",
                     ["Arbiscan",
                      "Solscan",
                      "AptosScan",
                      "Voyager"], 0),
                    ("How does a frontend connect to Arbitrum Sepolia using Wagmi/Viem?",
                     ["By configuring `arbitrumSepolia` from `viem/chains` in the Wagmi client configuration.",
                      "By writing raw TCP socket handlers in WebSockets.",
                      "By manually rewriting browser network headers.",
                      "By connecting directly via SSH."], 0),
                    ("What step is required to activate a Stylus Rust contract on-chain after deploying the WASM code?",
                     ["Submitting a contract activation transaction that compiles the WASM bytecode to native machine code in ArbOS.",
                      "Restarting the Arbitrum validator network.",
                      "Paying an annual license subscription in Bitcoin.",
                      "Signing an agreement with the Arbitrum Foundation."], 0),
                    ("How do you query L1-to-L2 gas fees and base fees on Arbitrum?",
                     ["By calling the ArbSys precompile at address `0x0000000000000000000000000000000000000064`.",
                      "By calling Google Maps API.",
                      "By checking centralized exchange spot prices.",
                      "By estimating randomly in the frontend."], 0),
                    ("What API enables programmatic source code verification on Arbiscan?",
                     ["The Arbiscan API using Foundry `forge verify-contract` or Hardhat verify plugin.",
                      "The GitHub OAuth API.",
                      "The Twitter verification badge API.",
                      "A manual paper form submitted via postal mail."], 0)
                ]
            },
            {
                "title": "Arbitrum Sepolia Deployment Challenge & Stylus WASM Verification",
                "desc": "Hands-on Deployment Challenge: Compile your Arbitrum smart contracts (Solidity or Stylus Rust), deploy to Arbitrum Sepolia testnet, verify on Arbiscan, and complete institutional certification.",
                "keywords": ["arbitrum", "deploy", "testnet", "verify"],
                "questions": [
                    ("Which command deploys and activates a Stylus Rust smart contract to Arbitrum Sepolia?",
                     ["cargo stylus deploy --private-key=<KEY> --endpoint=<RPC_URL>",
                      "npm publish --arbitrum",
                      "git push testnet main",
                      "docker run arbitrum-node"], 0),
                    ("Where can grant reviewers and employers inspect your verified Arbitrum Sepolia smart contract deployment?",
                     ["On the Arbiscan Sepolia block explorer at `https://sepolia.arbiscan.io/address/<CONTRACT_ADDRESS>`.",
                      "In a local text file.",
                      "On GitHub issues only.",
                      "In private browser cookies."], 0),
                    ("What verified proof is generated upon completing the Arbitrum Developer Academy challenge?",
                     ["An on-chain transaction hash and certified digital credential verified by academy telemetry.",
                      "A printed certificate sent in the mail.",
                      "A local terminal screenshot.",
                      "An empty git repository."], 0),
                    ("Why do ecosystem foundations like the Arbitrum Foundation value verified testnet contract deployments?",
                     ["They prove practical engineering competence in building scalable Layer-2 and Stylus WASM decentralized applications.",
                      "They guarantee instant mainnet token distributions.",
                      "They eliminate the need for open-source code licenses.",
                      "They replace developer technical interviews."], 0),
                    ("What gas optimization best practice applies when deploying to Arbitrum Nitro?",
                     ["Using standard Solidity 0.8.20+ with Shanghai/Cancun EVM targets and optimizing storage slot packing.",
                      "Writing code without any functions.",
                      "Setting transaction gas limit to the maximum integer value.",
                      "Adding random comments in contract headers."], 0),
                    ("How does completing the Arbitrum curriculum prepare developers for Arbitrum Foundation grant funding?",
                     ["It satisfies the required technical milestones, Blueprint compliance, and on-chain telemetry criteria.",
                      "It provides automated bank loans.",
                      "It guarantees full-time governance seats.",
                      "It deletes all smart contract audits."], 0)
                ]
            }
        ]
    },
    "base": {
        "name": "Base",
        "currency": "ETH",
        "lang": "Solidity",
        "vm": "OP Stack EVM",
        "framework": "Coinbase Smart Wallet & Foundry",
        "testnet": "Base Sepolia",
        "explorer": "BaseScan",
        "repo1": "https://github.com/base-org",
        "repo2": "https://github.com/coinbase/smart-wallet",
        "modules": [
            {
                "title": "Base Architecture, OP Stack Integration & Coinbase Ecosystem",
                "desc": "Explore Base Layer-2 architecture: OP Stack rollup mechanics, Superchain interoperability, sequencer revenue sharing, and Coinbase developer ecosystem integration.",
                "keywords": ["BaseOPStack", "Superchain"],
                "questions": [
                    ("What framework powers the Base Layer-2 blockchain architecture?",
                     ["The open-source MIT-licensed OP Stack (Optimism Collective Superchain).",
                      "A proprietary closed-source database engine.",
                      "Solana Sealevel BPF runtime.",
                      "Bitcoin Lightning Network."], 0),
                    ("What is the primary mission of the Base network in the Web3 ecosystem?",
                     ["To bring the next billion users on-chain with sub-cent gas fees, developer-friendly UX, and deep Coinbase product integration.",
                      "To replace all Layer-1 blockchains with a centralized company server.",
                      "To restrict developer smart contract creation.",
                      "To disable fiat onramps and offramps."], 0),
                    ("How does Base achieve low transaction fees while maintaining Ethereum L1 security?",
                     ["By batching transactions off-chain, compressing state updates, and posting EIP-4844 blobs to Ethereum Layer-1.",
                      "By deleting transaction history every week.",
                      "By operating without cryptographic signatures.",
                      "By running validators on residential laptops only."], 0),
                    ("What is the Superchain vision shared by Base and Optimism?",
                     ["A unified network of interconnected OP Stack chains sharing security, communication (interoperability), and an open-source development stack.",
                      "A single giant monopolistic server.",
                      "A bridge that only transfers fiat currencies.",
                      "A private corporate intranet."], 0),
                    ("What role does EIP-4844 (Proto-Danksharding) play in Base's transaction cost reduction?",
                     ["It introduces ephemeral 'data blobs' on Ethereum L1 that drastically lower L2 rollup data posting costs by over 90%.",
                      "It removes miner tips completely.",
                      "It increases block confirmation times.",
                      "It prevents smart contracts from using storage."], 0),
                    ("How does Base support developer grants and builder retro-funding?",
                     ["Through Base Builder Grants, Optimism RetroPGF allocations, and hackathon bounties tracking verified contract activity.",
                      "By issuing corporate stock options.",
                      "By selling user data to advertisers.",
                      "By charging upfront developer registration fees."], 0)
                ]
            },
            {
                "title": "Base Toolchain, Base Sepolia Setup & Foundry Development",
                "desc": "Configure Foundry and Hardhat for Base Sepolia (Chain ID 84532), manage RPC connections, testnet faucets, and build optimized Solidity contracts.",
                "keywords": ["BaseSepolia", "Foundry"],
                "questions": [
                    ("What is the Chain ID for the Base Sepolia testnet?",
                     ["84532",
                      "8453",
                      "1",
                      "421614"], 0),
                    ("Which command compiles and runs Solidity test suites using Foundry for Base?",
                     ["forge test -vvv",
                      "npm start",
                      "cargo build",
                      "python test.py"], 0),
                    ("How do developers acquire Base Sepolia testnet ETH for gas?",
                     ["Using the official Coinbase Developer Platform Faucet or Superchain Faucet.",
                      "By purchasing tokens on centralized exchanges.",
                      "By mining proof-of-work blocks on Base.",
                      "By emailing Coinbase support."], 0),
                    ("What RPC URL is the standard public endpoint for Base Sepolia?",
                     ["https://sepolia.base.org",
                      "https://mainnet.base.org",
                      "http://localhost:8545",
                      "https://eth.llamarpc.com"], 0),
                    ("Why is Foundry preferred by high-velocity Base smart contract developers?",
                     ["Because tests and scripts are written directly in pure Solidity with blazing fast native Rust execution and fuzzing.",
                      "Because it requires no knowledge of blockchain.",
                      "Because it only runs on mobile devices.",
                      "Because it does not support EVM bytecode."], 0),
                    ("What environment variable configuration is required in `foundry.toml` to verify contracts on BaseScan?",
                     ["`[etherscan] base_sepolia = { key = \"${BASESCAN_API_KEY}\", url = \"https://api-sepolia.basescan.org/api\" }`",
                      "`apiKey = 12345` without quotes",
                      "`network = 'testnet'` only",
                      "`disable_verification = true`"], 0)
                ]
            },
            {
                "title": "Smart Contracts on Base: Gas Optimization & Account Abstraction",
                "desc": "Write gas-optimized Solidity smart contracts for Base, leverage ERC-4337 Account Abstraction, passkey signers, and Coinbase Smart Wallet integration.",
                "keywords": ["CoinbaseSmartWallet", "AccountAbstraction"],
                "questions": [
                    ("What major UX breakthrough does the Coinbase Smart Wallet bring to Base applications?",
                     ["Passkey-based onboarding allowing users to create on-chain smart wallets in seconds using FaceID/TouchID with zero seed phrases or browser extensions.",
                      "It requires users to write down 24 recovery words on paper.",
                      "It replaces blockchain transactions with SMS text messages.",
                      "It forces all users to submit government IDs before sending transactions."], 0),
                    ("How does ERC-4337 Paymaster integration benefit Base users?",
                     ["Applications can sponsor all transaction gas fees (gasless UX) or let users pay gas in USDC instead of ETH.",
                      "It increases gas costs by 200%.",
                      "It disables token transfers.",
                      "It prevents contracts from emitting events."], 0),
                    ("What is OnchainKit provided by the Base ecosystem?",
                     ["A ready-to-use collection of React components and TypeScript utilities for seamless wallet connection, identity, and checkout flows on Base.",
                      "A physical hardware wallet device.",
                      "A closed-source proprietary database.",
                      "A compiler plugin for C++."], 0),
                    ("How do developers verify EIP-712 typed data signatures in Base smart contracts?",
                     ["Using `ECDSA.recover()` with the domain separator and typed hash struct according to EIP-712 standards.",
                      "By comparing string lengths.",
                      "By checking user IP addresses.",
                      "By querying an off-chain REST API."], 0),
                    ("What storage layout optimization saves the most gas in Solidity contracts deployed to Base?",
                     ["Packing multiple variables (`uint128`, `uint64`, `address`, `bool`) into single 32-byte storage slots (`SSTORE` efficiency).",
                      "Declaring all variables as strings.",
                      "Creating a separate storage slot for every single variable.",
                      "Avoiding storage entirely."], 0),
                    ("Why are UserOperations bundled rather than sent directly as standard EOA transactions in ERC-4337?",
                     ["To allow bundlers to batch multiple operations and execute them via the canonical EntryPoint contract in a single atomic transaction.",
                      "To bypass blockchain consensus.",
                      "To encrypt transactions so validators cannot see them.",
                      "To slow down transaction processing."], 0)
                ]
            },
            {
                "title": "Full-Stack Base DApps, OnchainKit & Smart Wallet Integration",
                "desc": "Construct production React/Next.js applications on Base Sepolia using Wagmi, Viem, OnchainKit components, and BaseScan contract verification.",
                "keywords": ["OnchainKit", "BaseScan"],
                "questions": [
                    ("Which Wagmi chain definition represents Base Sepolia in frontend code?",
                     ["`baseSepolia` from `wagmi/chains` or `viem/chains`.",
                      "`mainnet`",
                      "`polygon`",
                      "`solanaDevnet`"], 0),
                    ("What component from OnchainKit provides instant 1-click Passkey login for Base users?",
                     ["`<Wallet>` and `<ConnectWallet>` wrappers from `@coinbase/onchainkit/wallet`.",
                      "`<LoginForm>` from standard HTML.",
                      "`<MetamaskButton>` only.",
                      "`<OAuthButton>` only."], 0),
                    ("Which block explorer is dedicated to tracking Base transactions and smart contract bytecode?",
                     ["BaseScan (basescan.org / sepolia.basescan.org).",
                      "Solscan.",
                      "Voyager.",
                      "Subscan."], 0),
                    ("How do you verify a Solidity contract on BaseScan using Foundry CLI?",
                     ["`forge verify-contract <ADDRESS> <CONTRACT_PATH>:<NAME> --chain-id 84532 --verifier-url https://api-sepolia.basescan.org/api --etherscan-api-key <KEY>`",
                      "`forge upload-source --base`",
                      "`npm verify`",
                      "`git commit -m 'verified'`"], 0),
                    ("What telemetry metric proves active student engagement on Base for grant applications?",
                     ["Verified testnet and mainnet contract deployments, transaction interaction count, and unique active user addresses.",
                      "The number of lines of README text.",
                      "The color theme of the website.",
                      "The number of local git branches."], 0),
                    ("What is the average transaction confirmation latency on Base Layer-2?",
                     ["Under 2 seconds with instant soft-finality from the OP Stack Sequencer.",
                      "15 minutes.",
                      "2 hours.",
                      "3 business days."], 0)
                ]
            },
            {
                "title": "Base Sepolia Deployment Challenge & BaseScan Verification",
                "desc": "Hands-on Deployment Challenge: Compile your smart contracts, deploy to Base Sepolia testnet, verify source code on BaseScan, and achieve verified Base Builder status.",
                "keywords": ["base", "deploy", "testnet", "verify"],
                "questions": [
                    ("What is required to pass the Base Sepolia Testnet Deployment Challenge?",
                     ["A live deployed smart contract on Base Sepolia with verified source code on BaseScan and emitted contract events.",
                      "A draft text file on your desktop.",
                      "An unresolved compiler error.",
                      "A Figma design prototype only."], 0),
                    ("Where can grant reviewers view your verified contract on Base Sepolia?",
                     ["At `https://sepolia.basescan.org/address/<YOUR_CONTRACT_ADDRESS>`.",
                      "In a private Discord message only.",
                      "On a local offline computer.",
                      "In browser local storage."], 0),
                    ("What digital credential is minted upon completing the Base Track challenge?",
                     ["A cryptographically verifiable Developer Academy Certificate recognizing Base and OP Stack competence.",
                      "A physical plastic badge.",
                      "An email receipt.",
                      "A temporary coupon."], 0),
                    ("How does verified contract deployment on Base enhance developer career opportunities?",
                     ["It demonstrates verifiable, on-chain proof of execution capability to Web3 companies and grant foundations.",
                      "It guarantees an immediate executive salary.",
                      "It replaces all future code testing requirements.",
                      "It eliminates the need for software licenses."], 0),
                    ("What security check should always be completed before deploying smart contracts to Base?",
                     ["Auditing access controls (Ownable/Roles), checking reentrancy guards, and verifying input validation math.",
                      "Disabling all unit tests.",
                      "Hardcoding private keys into the frontend code.",
                      "Deleting error revert messages."], 0),
                    ("How can developers apply for Base Ecosystem funding following track graduation?",
                     ["By submitting their verified contract address and GitHub repository to the Base Grants portal and Optimism RetroPGF.",
                      "By calling telephone customer support.",
                      "By mailing paper invoices.",
                      "By purchasing third-party marketing ads."], 0)
                ]
            }
        ]
    },
    "optimism": {
        "name": "Optimism",
        "currency": "ETH",
        "lang": "Solidity",
        "vm": "OP Stack Superchain EVM",
        "framework": "Foundry & Hardhat",
        "testnet": "OP Sepolia",
        "explorer": "OP Etherscan",
        "repo1": "https://github.com/ethereum-optimism/optimism",
        "repo2": "https://github.com/ethereum-optimism/superchain-registry",
        "modules": [
            {
                "title": "Optimism Architecture, Fault Proofs & Superchain Interoperability",
                "desc": "Master Optimism rollup architecture: Cannon fault-proof VM, OP Stack execution clients (op-geth/op-node), and Superchain cross-chain communication.",
                "keywords": ["OptimismOPStack", "FaultProofs"],
                "questions": [
                    ("What is Cannon in the Optimism fault proof architecture?",
                     ["An on-chain MIPS emulator that executes compiled EVM byte-steps on Ethereum L1 to mathematically resolve dispute challenges.",
                      "A physical artillery weapon.",
                      "A video compression codec.",
                      "A database clustering plugin."], 0),
                    ("What are the two core software components of an OP Stack rollup node?",
                     ["op-node (consensus/derivation client) and op-geth (execution engine client).",
                      "nginx and apache.",
                      "mysql and postgres.",
                      "react and vite."], 0),
                    ("What is the Optimism Superchain?",
                     ["A horizontally scalable network of OP Stack chains that share security, communication layers, and governance standards.",
                      "A single monolithic blockchain running on 10,000 servers.",
                      "A private consortium for credit card companies.",
                      "A cryptocurrency exchange platform."], 0),
                    ("How do OP Stack rollups handle Layer-1 data availability?",
                     ["By deriving state transitions from transaction data batches posted to Ethereum L1 via EIP-4844 data blobs.",
                      "By storing everything in IPFS exclusively.",
                      "By running daily SQL database backups.",
                      "By broadcasting data over FM radio frequencies."], 0),
                    ("What is the role of the Optimism Collective governance model?",
                     ["A bicameral governance system (Token House & Citizens' House) driving protocol upgrades and RetroPGF public goods funding.",
                      "A single centralized board of directors with unilateral control.",
                      "An automated AI bot that controls all funds.",
                      "A legal court in Switzerland."], 0),
                    ("What is Retroactive Public Goods Funding (RetroPGF)?",
                     ["Rewarding projects and developers after they have delivered verified positive impact to the Optimism and Web3 ecosystem.",
                      "Giving upfront venture capital loans with high interest.",
                      "Collecting taxes from developers.",
                      "Charging subscription fees to access documentation."], 0)
                ]
            },
            {
                "title": "OP Stack Toolchain, Local Devnet & Hardhat/Foundry Environment",
                "desc": "Set up the OP Stack development environment: running local devnets with `op-node`, configuring OP Sepolia (Chain ID 11155420), and building Solidity smart contracts.",
                "keywords": ["OPSepolia", "SuperchainDev"],
                "questions": [
                    ("What is the Chain ID for the Optimism Sepolia testnet?",
                     ["11155420",
                      "10",
                      "1",
                      "420"], 0),
                    ("Which block explorer is the standard verification tool for OP Sepolia?",
                     ["OP Etherscan (sepolia-optimism.etherscan.io).",
                      "Solscan.",
                      "Voyager.",
                      "Arbiscan."], 0),
                    ("How do you configure an OP Sepolia network connection in `foundry.toml`?",
                     ["By defining `op_sepolia = { url = \"https://sepolia.optimism.io\", chain_id = 11155420 }` under `[rpc_endpoints]`.",
                      "By hardcoding IP addresses in Solidity code.",
                      "By setting `network = 'internet'`.",
                      "By disabling RPC endpoints."], 0),
                    ("What is the L1Block precompile contract on Optimism (address `0x4200000000000000000000000000000000000015`)?",
                     ["A special system contract that exposes current Ethereum Layer-1 block attributes (number, timestamp, basefee, blobBaseFee) to L2 contracts.",
                      "A user wallet contract.",
                      "A DEX liquidity pool.",
                      "A compiler configuration file."], 0),
                    ("How do developers acquire OP Sepolia testnet ETH for contract deployment?",
                     ["Via the Superchain Faucet (faucet.circle.com or superchain-faucet.optimism.io) or bridging from Ethereum Sepolia.",
                      "By mining proof-of-work on GPU rigs.",
                      "By paying credit card fees.",
                      "By transferring from mainnet."], 0),
                    ("What is the gas fee formula on Optimism Layer-2?",
                     ["Total Fee = (Execution Gas * L2 Base Fee) + (L1 Data Fee calculated from compressed transaction size and L1 blob base fee).",
                      "Total Fee = Flat 1 USD per transaction.",
                      "Total Fee = Random percentage of transaction value.",
                      "Transactions on Optimism are completely free."], 0)
                ]
            },
            {
                "title": "Superchain Smart Contracts: Standard Bridge & Cross-Domain Messaging",
                "desc": "Build cross-chain decentralized applications using the OP Stack Standard Bridge, CrossDomainMessenger, and multi-chain messaging interfaces.",
                "keywords": ["StandardBridge", "CrossDomainMessenger"],
                "questions": [
                    ("What contract enables secure cross-domain messaging between Ethereum L1 and Optimism L2?",
                     ["The `L1CrossDomainMessenger` and `L2CrossDomainMessenger` contracts.",
                      "A centralized backend web server.",
                      "A standard WebSocket connection.",
                      "An HTTP REST endpoint."], 0),
                    ("What is the `L1StandardBridge` contract on Optimism?",
                     ["A canonical bridge contract that locks ERC-20 tokens on L1 and mints corresponding `OptimismMintableERC20` representations on L2.",
                      "A physical suspension bridge in California.",
                      "A decentralized exchange router.",
                      "A frontend React UI library."], 0),
                    ("How do developers verify that an incoming call to an L2 contract was initiated by a specific address on L1?",
                     ["By checking `ICrossDomainMessenger(msg.sender).xDomainMessageSender()` inside the target contract method.",
                      "By reading `tx.origin` only.",
                      "By comparing string names.",
                      "By querying a centralized Oracle."], 0),
                    ("What is an `OptimismMintableERC20` token standard?",
                     ["An ERC-20 standard interface allowing the canonical bridge to mint and burn token supplies in sync with L1 collateral deposits and withdrawals.",
                      "An unbacked algorithmic stablecoin.",
                      "A non-transferable soulbound token.",
                      "An NFT metadata standard."], 0),
                    ("What is the standard withdrawal challenge period when moving assets from Optimism back to Ethereum L1 via fault proofs?",
                     ["7 days (the dispute challenge window).",
                      "10 seconds.",
                      "1 year.",
                      "Instant with zero challenge window."], 0),
                    ("How can fast third-party liquidity bridges provide instant L2-to-L1 withdrawals without waiting 7 days?",
                     ["By providing fronted liquidity on L1 in exchange for a small fee, taking on the 7-day settlement risk themselves.",
                      "By bypassing Ethereum protocol security.",
                      "By bribing miners.",
                      "By deleting the transaction history."], 0)
                ]
            },
            {
                "title": "Full-Stack Optimism DApps & OP Etherscan Verification",
                "desc": "Develop responsive full-stack applications with Wagmi, Viem, Next.js, and verify deployed smart contracts on OP Etherscan.",
                "keywords": ["OPEtherscan", "SuperchainUI"],
                "questions": [
                    ("Which Viem chain definition represents Optimism Sepolia in TypeScript frontends?",
                     ["`optimismSepolia` from `viem/chains`.",
                      "`mainnet`",
                      "`arbitrumOne`",
                      "`solana`"], 0),
                    ("How do you verify a deployed Solidity contract on OP Etherscan using Foundry CLI?",
                     ["`forge verify-contract <ADDRESS> <PATH>:<NAME> --chain-id 11155420 --verifier-url https://api-sepolia-optimistic.etherscan.io/api --etherscan-api-key <KEY>`",
                      "`forge publish --superchain`",
                      "`npm run verify-optimism`",
                      "`git push verify main`"], 0),
                    ("What is the primary benefit of deploying on the Optimism Superchain for multi-chain DApps?",
                     ["Consistent tooling, shared developer standards, zero code refactoring across OP Stack chains (Base, OP, Zora, Mode, Frax).",
                      "Higher gas costs.",
                      "Incompatibility with standard EVM wallets.",
                      "Restricted smart contract execution."], 0),
                    ("What precompile contract is used to estimate L1 data fees before broadcasting an Optimism transaction?",
                     ["The `GasPriceOracle` contract at address `0x420000000000000000000000000000000000000F`.",
                      "The Uniswap router.",
                      "The Chainlink price feed.",
                      "A local JSON file."], 0),
                    ("How does the OP Stack support future interop and shared sequencing across the Superchain?",
                     ["Through Superchain Interop protocols enabling atomic cross-chain transactions without trust assumptions between OP chains.",
                      "By running all chains on a single central server.",
                      "By merging all chains into a single giant database.",
                      "By disabling independent chain governance."], 0),
                    ("Where can developers monitor ecosystem grants, RetroPGF rounds, and Superchain analytics?",
                     ["On the official Optimism Governance Portal (gov.optimism.io) and RetroPGF directories.",
                      "On private Reddit forums.",
                      "In closed Discord groups only.",
                      "On physical bulletin boards."], 0)
                ]
            },
            {
                "title": "OP Sepolia Deployment Challenge & Superchain Verification",
                "desc": "Hands-on Deployment Challenge: Compile your smart contracts, deploy to OP Sepolia testnet, verify on OP Etherscan, and complete Superchain certification.",
                "keywords": ["optimism", "deploy", "testnet", "verify"],
                "questions": [
                    ("What is required to complete the Optimism Sepolia Deployment Challenge?",
                     ["A live deployed smart contract on OP Sepolia with verified source code on OP Etherscan and active transaction telemetry.",
                      "A PowerPoint presentation only.",
                      "An unverified bytecode string on a local machine.",
                      "A testnet faucet transaction only."], 0),
                    ("Where can grant evaluators and hiring partners inspect your verified OP Sepolia deployment?",
                     ["On the OP Etherscan Sepolia explorer at `https://sepolia-optimism.etherscan.io/address/<CONTRACT_ADDRESS>`.",
                      "On a private USB thumb drive.",
                      "On an unhosted local web server.",
                      "In browser session storage."], 0),
                    ("What on-chain milestone does the Developer Academy issue upon completing the Optimism track?",
                     ["A verifiable cryptographic certificate registered on-chain validating Superchain & OP Stack technical mastery.",
                      "A paper receipt in the mail.",
                      "A temporary coupon code.",
                      "A text message confirmation."], 0),
                    ("Why do ecosystem grant programs value interactive testnet deployments over theoretical coursework?",
                     ["Because live deployments prove real-world engineering execution, smart contract safety, and end-to-end tooling competence.",
                      "Because testnet deployments generate mining revenue for funders.",
                      "Because they eliminate all future software maintenance.",
                      "Because they replace open-source licenses."], 0),
                    ("What security pattern should always be implemented in smart contracts handling user funds on Layer-2?",
                     ["Checks-Effects-Interactions, reentrancy guards, strict access control, and safe token transfer wrappers (`SafeERC20`).",
                      "Disabling all error messages.",
                      "Storing private keys in smart contract state.",
                      "Allowing anyone to call withdrawal functions."], 0),
                    ("How can graduating developers leverage their Optimism track completion for RetroPGF and Superchain Grants?",
                     ["By linking their verified academy credential, GitHub repository, and deployed contract in their official grant application.",
                      "By purchasing social media followers.",
                      "By sending automated spam emails.",
                      "By creating multiple fake GitHub accounts."], 0)
                ]
            }
        ]
    },
    "polygon": {
        "name": "Polygon",
        "currency": "POL",
        "lang": "Solidity",
        "vm": "Polygon PoS & zkEVM",
        "framework": "Foundry & Hardhat",
        "testnet": "Polygon Amoy Testnet",
        "explorer": "PolygonScan",
        "repo1": "https://github.com/maticnetwork",
        "repo2": "https://github.com/0xPolygon/polygon-docs",
        "modules": [
            {
                "title": "Polygon Architecture: PoS Heimdall/Bor & zkEVM Validium Topologies",
                "desc": "Explore Polygon's dual architecture: the Heimdall (Tendermint validator) / Bor (EVM block producer) PoS network and Polygon zkEVM ZK-Rollup scaling technology.",
                "keywords": ["PolygonPoS", "zkEVM"],
                "questions": [
                    ("What are the two core layers of the Polygon PoS network architecture?",
                     ["Heimdall (Proof-of-Stake validator layer based on Tendermint) and Bor (EVM-compatible block production layer based on Geth).",
                      "Frontend React and Backend Python.",
                      "MySQL and Redis.",
                      "Master node and Slave node."], 0),
                    ("What is Polygon zkEVM?",
                     ["A Type-2 ZK-Rollup that executes standard Ethereum bytecode with zero changes and generates zero-knowledge validity proofs for L1 verification.",
                      "A centralized database running in AWS.",
                      "A proof-of-work mining algorithm for GPUs.",
                      "A browser extension for Chrome."], 0),
                    ("What native token powers gas fees and staking on Polygon (formerly MATIC)?",
                     ["POL (Polygon Ecosystem Token).",
                      "BTC",
                      "SOL",
                      "DOGE"], 0),
                    ("How does Polygon PoS maintain checkpoint security with Ethereum Layer-1?",
                     ["Heimdall validators periodically aggregate blocks and post signed Merkle root checkpoints to Ethereum L1 smart contracts.",
                      "By running daily database dumps to Amazon S3.",
                      "By emailing block summaries to Ethereum miners.",
                      "By using paper receipts."], 0),
                    ("What is the AggLayer (Aggregation Layer) in the Polygon 2.0 vision?",
                     ["A cross-chain settlement protocol connecting multiple ZK-powered chains for near-instant cross-chain transactions and shared liquidity.",
                      "A database aggregation pipeline in MongoDB.",
                      "A CSS style preprocessor.",
                      "A centralized token exchange."], 0),
                    ("Why do enterprise and gaming applications frequently choose Polygon for deployment?",
                     ["Because of sub-cent transaction fees, high throughput (thousands of TPS), and instant finality combined with full EVM compatibility.",
                      "Because Polygon does not support smart contracts.",
                      "Because Polygon charges monthly user fees.",
                      "Because Polygon only works on Android."], 0)
                ]
            },
            {
                "title": "Polygon Toolchain, Amoy Testnet Faucets & Foundry Setup",
                "desc": "Configure developer environments for Polygon Amoy Testnet (Chain ID 80002), manage POL faucets, RPC endpoints, and deploy Solidity smart contracts.",
                "keywords": ["PolygonAmoy", "POL"],
                "questions": [
                    ("What is the Chain ID for the Polygon Amoy testnet (Sepolia-anchored testnet)?",
                     ["80002",
                      "137",
                      "1101",
                      "1"], 0),
                    ("Which block explorer is the standard tool for inspecting Polygon Amoy transactions and contracts?",
                     ["PolygonScan (amoy.polygonscan.com).",
                      "Etherscan mainnet.",
                      "Solscan.",
                      "Voyager."], 0),
                    ("How do developers obtain testnet POL tokens for Polygon Amoy gas fees?",
                     ["From the official Polygon Faucet (faucet.polygon.technology) or Alchemy/Infura Amoy faucets.",
                      "By purchasing tokens on Binance.",
                      "By mining proof-of-work blocks on GPU.",
                      "By calling telephone support."], 0),
                    ("What RPC URL is commonly used to connect to Polygon Amoy testnet?",
                     ["https://rpc-amoy.polygon.technology",
                      "https://polygon-rpc.com",
                      "http://localhost:8545",
                      "https://eth.llamarpc.com"], 0),
                    ("How do you configure Polygon Amoy verification in `foundry.toml`?",
                     ["`[etherscan] polygon_amoy = { key = \"${POLYGONSCAN_API_KEY}\", url = \"https://api-amoy.polygonscan.com/api\" }`",
                      "`verifier = 'auto'` without API keys",
                      "`skip_verification = true`",
                      "`network = 'polygon'` only"], 0),
                    ("What is the primary advantage of testing on Amoy over legacy Mumbai testnet?",
                     ["Amoy is anchored to Ethereum Sepolia L1, providing long-term stability and modern EVM feature compatibility.",
                      "Amoy disables all gas fees forever.",
                      "Amoy does not require a wallet.",
                      "Amoy uses Python instead of Solidity."], 0)
                ]
            },
            {
                "title": "Polygon Smart Contracts: State Sync, FxPortal & Plasma Bridges",
                "desc": "Implement cross-chain interoperability: state receiver contracts, FxPortal bridge mechanics, and custom token mapping between Ethereum and Polygon.",
                "keywords": ["StateSync", "FxPortal"],
                "questions": [
                    ("What is the State Sync mechanism on Polygon PoS?",
                     ["A native protocol mechanism that automatically forwards events emitted by L1 StateSender contracts to L2 StateReceiver contracts.",
                      "A WebSocket synchronization library for React.",
                      "A database replication service in AWS.",
                      "An FTP file transfer tool."], 0),
                    ("What is the FxPortal bridge on Polygon?",
                     ["A permissionless, tokenless state transfer bridge that allows contracts on Ethereum and Polygon to pass arbitrary data without token mapping approvals.",
                      "A physical gate at an office.",
                      "A decentralized lending protocol.",
                      "A frontend styling template."], 0),
                    ("Which interface must a Polygon contract implement to receive state sync data from Ethereum L1?",
                     ["`IFxMessageProcessor` or `IStateReceiver` (`onStateReceive`).",
                      "`IERC20` only.",
                      "`IOwnable` only.",
                      "`IDisposable` only."], 0),
                    ("What is the difference between the Polygon PoS Bridge and Polygon zkEVM Bridge?",
                     ["The PoS bridge relies on validator multisig checkpoints, whereas the zkEVM bridge uses cryptographic ZK validity proofs for trustless security.",
                      "The PoS bridge only transfers Bitcoin.",
                      "The zkEVM bridge requires 30 days to withdraw.",
                      "Both bridges are centralized web servers."], 0),
                    ("What is `FxERC20RootTunnel` and `FxERC20ChildTunnel` in the FxPortal architecture?",
                     ["The L1 and L2 bridge tunnel contracts that lock ERC-20 tokens on Ethereum and mint/burn corresponding child tokens on Polygon.",
                      "Network routing cables.",
                      "Private VPN tunnels.",
                      "CSS animation classes."], 0),
                    ("Why should developers sanitize data payloads received via `onStateReceive`?",
                     ["To verify that `msg.sender` matches the canonical StateReceiver address and validate the origin sender address from L1.",
                      "To compress the payload size.",
                      "To encrypt the data on disk.",
                      "To format strings into uppercase."], 0)
                ]
            },
            {
                "title": "Full-Stack Polygon DApps & PolygonScan Verification",
                "desc": "Build scalable decentralized applications on Polygon using Wagmi/Viem, integrate fast RPC providers, and verify smart contract deployments on PolygonScan.",
                "keywords": ["PolygonScan", "WagmiPolygon"],
                "questions": [
                    ("Which Viem chain definition corresponds to Polygon Amoy Testnet?",
                     ["`polygonAmoy` from `viem/chains`.",
                      "`polygon` (mainnet)",
                      "`mainnet`",
                      "`bsc`"], 0),
                    ("How do you verify a smart contract on PolygonScan using Foundry CLI?",
                     ["`forge verify-contract <ADDRESS> <PATH>:<NAME> --chain-id 80002 --verifier-url https://api-amoy.polygonscan.com/api --etherscan-api-key <KEY>`",
                      "`forge verify --polygon`",
                      "`npm run verify`",
                      "`git push polygon main`"], 0),
                    ("What is Polygon ID / Privado ID?",
                     ["A decentralized identity and zero-knowledge verifiable credentials framework built on Polygon for private identity proof without revealing data.",
                      "A government issued passport.",
                      "A social security database.",
                      "An email username."], 0),
                    ("What RPC optimization ensures high-throughput reliability when interacting with Polygon nodes?",
                     ["Using dedicated provider RPC endpoints (Alchemy, Infura, QuickNode) with automated retry and fallback configurations.",
                      "Sending all requests over plain HTTP without TLS.",
                      "Disabling JSON-RPC responses.",
                      "Querying only public free endpoints with high rate limits."], 0),
                    ("How does sub-second block time on Polygon affect frontend transaction tracking UX?",
                     ["Transactions confirm in 2–3 seconds, allowing frontends to provide near-instant feedback and fluid UI updates.",
                      "It requires users to wait 30 minutes for confirmation.",
                      "It prevents frontends from querying transaction receipts.",
                      "It forces full page reloads."], 0),
                    ("Where can developers submit their Polygon projects for Polygon Village ecosystem grants and accelerators?",
                     ["On the official Polygon Village developer portal (polygon.technology/village).",
                      "In closed Telegram channels only.",
                      "By sending paper letters to India.",
                      "On Craigslist."], 0)
                ]
            },
            {
                "title": "Polygon Amoy Deployment Challenge & zkEVM Verification",
                "desc": "Hands-on Deployment Challenge: Compile your smart contracts, deploy to Polygon Amoy testnet, verify on PolygonScan, and complete your Polygon Developer certification.",
                "keywords": ["polygon", "deploy", "testnet", "verify"],
                "questions": [
                    ("What is required to complete the Polygon Amoy Deployment Challenge?",
                     ["A live deployed contract on Polygon Amoy with verified source code on PolygonScan and successful state execution.",
                      "A text document on your desktop.",
                      "A screenshot of a code editor with no broadcasted transaction.",
                      "A testnet faucet request only."], 0),
                    ("Where can grant reviewers inspect your verified Polygon Amoy smart contract?",
                     ["At `https://amoy.polygonscan.com/address/<YOUR_CONTRACT_ADDRESS>`.",
                      "In a private email only.",
                      "On an unhosted local server.",
                      "In browser local storage."], 0),
                    ("What credential is issued upon completing the Polygon track?",
                     ["A cryptographically verifiable digital certificate demonstrating mastery of Polygon PoS, zkEVM, and Solidity smart contracts.",
                      "A physical paper diploma.",
                      "A temporary gift card.",
                      "An SMS message."], 0),
                    ("Why do enterprise Web3 hiring managers value verified testnet smart contract deployments on Polygon?",
                     ["Because they prove end-to-end technical capability, gas-efficient design, and practical deployment experience on high-throughput networks.",
                      "Because testnets replace the need for real user testing.",
                      "Because testnets provide legal immunity.",
                      "Because testnets eliminate software licensing."], 0),
                    ("What gas optimization technique is especially important for high-frequency Polygon applications?",
                     ["Using immutable variables, batching state updates in arrays, and caching storage variables in memory inside loops.",
                      "Writing code without any loops or functions.",
                      "Using strings for all numerical values.",
                      "Setting the gas limit to infinite."], 0),
                    ("How can developers use their Polygon Developer Academy credentials to apply for Polygon Village funding?",
                     ["By including their verifiable certificate link, GitHub repo, and verified contract address in the Polygon Village grant application form.",
                      "By purchasing advertising space.",
                      "By emailing personal bank statements.",
                      "By running automated bots."], 0)
                ]
            }
        ]
    },
    "avalanche": {
        "name": "Avalanche",
        "currency": "AVAX",
        "lang": "Solidity",
        "vm": "Avalanche C-Chain EVM & Subnets",
        "framework": "Avalanche CLI & Foundry",
        "testnet": "Avalanche Fuji Testnet",
        "explorer": "Snowtrace",
        "repo1": "https://github.com/ava-labs/avalanchego",
        "repo2": "https://github.com/ava-labs/avalanche-starter-kit",
        "modules": [
            {
                "title": "Avalanche Architecture: Primary Network (X/P/C Chains) & Snow Consensus",
                "desc": "Master the Avalanche multi-chain architecture: the Primary Network consisting of the Exchange Chain (X-Chain), Platform Chain (P-Chain), Contract Chain (C-Chain), and the Snow consensus family.",
                "keywords": ["AvalancheSnow", "CChain"],
                "questions": [
                    ("What are the three built-in blockchains that compose the Avalanche Primary Network?",
                     ["X-Chain (Exchange Chain for assets), P-Chain (Platform Chain for staking and Subnets), and C-Chain (Contract Chain for EVM smart contracts).",
                      "Alpha, Beta, and Gamma chains.",
                      "Bitcoin, Ethereum, and Solana chains.",
                      "Frontend, Backend, and Database chains."], 0),
                    ("Which Avalanche chain executes standard Solidity EVM smart contracts?",
                     ["The C-Chain (Contract Chain / Coreth).",
                      "The X-Chain.",
                      "The P-Chain.",
                      "The Bitcoin network."], 0),
                    ("What is unique about Avalanche's Snow consensus family (Avalanche/Snowman)?",
                     ["It uses repeated sub-sampling voting among validators to achieve sub-second, irreversible finality with high decentralization and no leader bottlenecks.",
                      "It uses classical Proof of Work mining with energy-intensive hashes.",
                      "It relies on a single master node.",
                      "It uses round-robin voting."], 0),
                    ("What is an Avalanche Subnet (Custom L1)?",
                     ["A dynamic, sovereign group of validators working together to achieve consensus on custom blockchains with dedicated state, execution rules, and custom gas tokens.",
                      "A temporary WiFi network.",
                      "A sub-folder on GitHub.",
                      "A private chat room."], 0),
                    ("What is Avalanche Warp Messaging (AWM) and Teleporter?",
                     ["A native cross-chain communication protocol enabling trustless, sub-second message and asset transfer between Avalanche Subnets and the C-Chain without bridges.",
                      "An SMS messaging gateway.",
                      "A video conference app.",
                      "An email newsletter service."], 0),
                    ("What native token is used to pay gas fees on the Avalanche C-Chain?",
                     ["AVAX (Avalanche Native Token).",
                      "ETH",
                      "SOL",
                      "USDC only"], 0)
                ]
            },
            {
                "title": "Avalanche Toolchain, Avalanche CLI & Fuji Testnet Setup",
                "desc": "Configure the official Avalanche CLI toolchain, manage Avalanche Fuji Testnet (Chain ID 43113), fund testnet AVAX faucets, and build Solidity contracts.",
                "keywords": ["AvalancheFuji", "AvalancheCLI"],
                "questions": [
                    ("What is the Chain ID for the Avalanche Fuji C-Chain testnet?",
                     ["43113",
                      "43114",
                      "1",
                      "8453"], 0),
                    ("Which block explorer is the primary tool for verifying Avalanche C-Chain smart contracts?",
                     ["Snowtrace / Routescan (testnet.snowtrace.io / routescan.io).",
                      "Solscan.",
                      "Arbiscan.",
                      "Etherscan mainnet."], 0),
                    ("How do developers obtain testnet AVAX for Fuji deployment gas fees?",
                     ["From the official Core Faucet (core.app/tools/testnet-faucet) or Avalanche Fuji Faucets.",
                      "By purchasing tokens on Coinbase.",
                      "By mining proof-of-work blocks on GPU.",
                      "By sending letters to Ava Labs."], 0),
                    ("What CLI tool is officially used to create, test, and deploy custom Avalanche Subnets and local networks?",
                     ["`avalanche-cli` (`avalanche network start`, `avalanche subnet deploy`).",
                      "`npm start`",
                      "`anchor init`",
                      "`cargo check`"], 0),
                    ("What RPC URL is the standard public endpoint for the Avalanche Fuji C-Chain?",
                     ["`https://api.avax-test.network/ext/bc/C/rpc`",
                      "`https://api.avax.network/ext/bc/C/rpc`",
                      "`http://localhost:8545`",
                      "`https://eth.llamarpc.com`"], 0),
                    ("How do you configure Avalanche Fuji verification in `foundry.toml`?",
                     ["`[etherscan] avalanche_fuji = { key = \"${SNOWTRACE_API_KEY}\", url = \"https://api.routescan.io/v2/network/testnet/evm/43113/etherscan\" }`",
                      "`verify = true` without URLs",
                      "`disable_explorer = true`",
                      "`network = 'fuji'` only"], 0)
                ]
            },
            {
                "title": "Custom Avalanche Subnets & Custom Virtual Machine Architecture",
                "desc": "Architect custom App-Chains on Avalanche: configuring custom EVM parameters (Subnet-EVM), custom gas tokens, fee manager precompiles, and validator staking rules.",
                "keywords": ["SubnetEVM", "Precompiles"],
                "questions": [
                    ("What is Subnet-EVM on Avalanche?",
                     ["A customizable fork of Coreth (Go-Ethereum) tailored for Avalanche Subnets with configurable gas limits, block times, and custom stateful precompiles.",
                      "A frontend JavaScript library.",
                      "An SQL database server.",
                      "A hardware crypto wallet."], 0),
                    ("How do stateful precompiles in Subnet-EVM empower customized blockchain governance?",
                     ["They allow developers to implement custom native features (e.g., fee configuration, native token minting, allowlisting transactions) directly at the protocol level in Go.",
                      "They delete all smart contracts upon execution.",
                      "They force contracts to run in browser JavaScript.",
                      "They replace private keys with usernames."], 0),
                    ("Can an Avalanche Subnet use its own custom ERC-20-like token as its native gas token instead of AVAX?",
                     ["Yes, Subnet-EVM allows defining any custom native gas token with custom supply and distribution mechanics during Subnet genesis.",
                      "No, Subnets can only use Bitcoin.",
                      "No, gas tokens cannot be customized in Web3.",
                      "Yes, but only if approved by US banks."], 0),
                    ("What is Teleporter on Avalanche?",
                     ["An EVM-compatible wrapper around Avalanche Warp Messaging (AWM) that provides a standard cross-subnet smart contract messaging interface.",
                      "A physical teleportation machine.",
                      "A video conferencing protocol.",
                      "A centralized bridge website."], 0),
                    ("What validator staking requirement exists for validating an Avalanche Subnet?",
                     ["Subnet validators must validate the Avalanche Primary Network and be registered on the P-Chain via `P-Chain.addSubnetValidator`.",
                      "Validators must pay monthly cash subscriptions.",
                      "Validators must operate on AWS exclusively.",
                      "Validators require no staking collateral."], 0),
                    ("What is the benefit of building an App-Chain as an Avalanche Subnet compared to deploying on a shared public L1?",
                     ["Dedicated isolated throughput, custom compliance rules (KYC/geo-fencing if needed), custom gas mechanics, and zero fee volatility from other DApps.",
                      "Higher transaction fees for users.",
                      "Inability to interoperate with other blockchains.",
                      "Centralized server hosting requirements."], 0)
                ]
            },
            {
                "title": "Full-Stack Avalanche DApps, Core Wallet & Snowtrace Verification",
                "desc": "Develop responsive DApps on Avalanche Fuji using Wagmi, Viem, Core Wallet extension, and verify deployed Solidity smart contracts on Snowtrace.",
                "keywords": ["Snowtrace", "CoreWallet"],
                "questions": [
                    ("Which Viem chain definition represents Avalanche Fuji in frontend React code?",
                     ["`avalancheFuji` from `viem/chains`.",
                      "`avalanche` (mainnet)",
                      "`mainnet`",
                      "`polygon`"], 0),
                    ("What is the Core Wallet built by Ava Labs?",
                     ["A non-custodial multi-chain wallet built specifically for seamless interaction with Avalanche C-Chain, Subnets, Bitcoin, and Ethereum.",
                      "A centralized trading desk.",
                      "A desktop operating system.",
                      "An email client."], 0),
                    ("How do you verify a smart contract on Snowtrace / Routescan using Foundry CLI?",
                     ["`forge verify-contract <ADDRESS> <PATH>:<NAME> --chain-id 43113 --verifier-url https://api.routescan.io/v2/network/testnet/evm/43113/etherscan --etherscan-api-key <KEY>`",
                      "`forge publish --avalanche`",
                      "`npm run verify`",
                      "`git commit -m 'verified'`"], 0),
                    ("What latency advantage do users experience on the Avalanche C-Chain?",
                     ["Sub-second transaction finality (typically ~700ms) with irreversible state confirmation.",
                      "15-minute confirmation delays.",
                      "1-hour fraud proof windows.",
                      "Overnight batch processing."], 0),
                    ("What API service enables fast historical indexing of Avalanche subnets and C-Chain events?",
                     ["The Avalanche Glacier API and Subgraphs via The Graph.",
                      "SOAP XML endpoints.",
                      "FTP file transfers.",
                      "CSV spreadsheet downloads."], 0),
                    ("Where can builders apply for ecosystem grants and accelerator support within Avalanche?",
                     ["Through Blizzard the Avalanche Ecosystem Fund, Multiverse incentive programs, and Codebase accelerator.",
                      "On Craigslist.",
                      "In closed Telegram groups only.",
                      "Via postal letters."], 0)
                ]
            },
            {
                "title": "Avalanche Fuji Deployment Challenge & Subnet Verification",
                "desc": "Hands-on Deployment Challenge: Compile your smart contracts, deploy to Avalanche Fuji C-Chain testnet, verify on Snowtrace, and complete your Avalanche Developer certification.",
                "keywords": ["avalanche", "deploy", "testnet", "verify"],
                "questions": [
                    ("What is required to complete the Avalanche Fuji Deployment Challenge?",
                     ["A live deployed contract on Avalanche Fuji C-Chain with verified source code on Snowtrace/Routescan and emitted event telemetry.",
                      "A local text file on your computer.",
                      "A testnet faucet request without contract deployment.",
                      "A PowerPoint design mockup only."], 0),
                    ("Where can grant evaluators and recruiters inspect your verified Avalanche deployment?",
                     ["At `https://testnet.snowtrace.io/address/<YOUR_CONTRACT_ADDRESS>` or Routescan.",
                      "In browser local storage.",
                      "In a private offline text file.",
                      "On an unhosted local server."], 0),
                    ("What digital credential is generated upon passing the Avalanche track challenge?",
                     ["A verifiable cryptographic certificate validating Avalanche C-Chain, Subnet architecture, and Solidity competence.",
                      "A paper certificate mailed to your house.",
                      "A temporary discount coupon.",
                      "An email receipt."], 0),
                    ("Why do Avalanche Foundation and Blizzard evaluators prioritize verified on-chain deployments in grant reviews?",
                     ["Because live deployments demonstrate proven technical competency, practical execution ability, and production readiness.",
                      "Because testnet deployments generate token revenue for evaluators.",
                      "Because they remove all need for software licenses.",
                      "Because they guarantee financial loans."], 0),
                    ("What security check should always be completed before publishing smart contracts to Avalanche C-Chain?",
                     ["Ensuring arithmetic safety, implementing reentrancy guards, verifying access controls, and testing with fuzzing suites.",
                      "Disabling all unit tests.",
                      "Hardcoding private keys into frontend code.",
                      "Deleting error revert strings."], 0),
                    ("How can graduating developers use their Avalanche Developer Academy credential in ecosystem grant proposals?",
                     ["By linking their verifiable credential, GitHub repository, and verified testnet contract address in their official Blizzard/Multiverse grant application.",
                      "By purchasing advertising space.",
                      "By sending automated cold emails.",
                      "By creating multiple anonymous aliases."], 0)
                ]
            }
        ]
    },
    "aptos": {
        "name": "Aptos",
        "currency": "APT",
        "lang": "Move",
        "vm": "MoveVM",
        "framework": "Aptos CLI & Move SDK",
        "testnet": "Aptos Testnet / Devnet",
        "explorer": "Aptos Explorer",
        "repo1": "https://github.com/aptos-labs/aptos-core",
        "repo2": "https://github.com/aptos-labs/aptos-developer-docs",
        "modules": [
            {
                "title": "Aptos Architecture, MoveVM & Block-STM Parallel Engine",
                "desc": "Master Aptos Layer-1 architecture, MoveVM bytecode verification, resource safety, and Block-STM optimistic parallel transaction execution.",
                "keywords": ["MoveVM", "BlockSTM"],
                "questions": [
                    ("What is the primary innovation of Aptos's Block-STM parallel execution engine?",
                     ["It executes transactions optimistically in parallel and validates dependencies concurrently, achieving over 100k TPS without sharding.",
                      "It executes transactions one by one in single-threaded order.",
                      "It disables smart contract state changes.",
                      "It replaces blockchain with centralized SQL."], 0),
                    ("How does Move's linear type system protect digital assets compared to EVM?",
                     ["Move treats assets as scarce Resources that can never be copied, duplicated, or silently discarded.",
                      "Move allows infinite token cloning.",
                      "Move stores all balances in a single public array.",
                      "Move requires no signature verification."], 0),
                    ("What is a Resource Account in Aptos?",
                     ["An autonomous account used by developers to manage modules, publish packages, and control state without a direct private key.",
                      "A standard user wallet with 12 seed words.",
                      "A temporary testnet faucet account.",
                      "A bank savings account."], 0),
                    ("What consensus algorithm powers the Aptos Layer-1 network?",
                     ["AptosBFT (DiemBFT v4) with sub-second finality and leader reputation mechanism.",
                      "Proof of Work mining.",
                      "Proof of Authority with a single admin node.",
                      "Round-robin email consensus."], 0),
                    ("What role does the Move Bytecode Verifier play before execution?",
                     ["It rigorously verifies type safety, memory bounds, and resource linearity before any code can run on-chain.",
                      "It translates Move to Solidity.",
                      "It mines APT tokens.",
                      "It formats code indentation."], 0),
                    ("Why are reentrancy attacks virtually impossible in native Move smart contracts?",
                     ["Move enforces strict resource borrow semantics and does not permit uncontrolled dynamic call dispatch loops.",
                      "Move contracts have no external functions.",
                      "Move disables token transfers.",
                      "Move contracts do not use state."], 0)
                ]
            },
            {
                "title": "Aptos Toolchain, Aptos CLI & Move.toml Environment Setup",
                "desc": "Configure the official Aptos CLI toolchain, local testnet faucets, Move.toml package dependencies, and automated unit testing.",
                "keywords": ["aptos", "MoveCLI"],
                "questions": [
                    ("Which command initializes a new Aptos developer profile and generates testnet keypairs?",
                     ["aptos init --network testnet",
                      "npm install aptos",
                      "git clone aptos",
                      "docker run aptos"], 0),
                    ("What file defines dependencies, package metadata, and named addresses in an Aptos Move project?",
                     ["Move.toml",
                      "package.json",
                      "Cargo.toml",
                      "Hardhat.config.js"], 0),
                    ("Which Aptos CLI command runs formal unit tests and test suites locally?",
                     ["aptos move test",
                      "aptos run test",
                      "npm test",
                      "cargo check"], 0),
                    ("How do developers fund their testnet account using the Aptos CLI?",
                     ["aptos account fund-with-faucet --account default",
                      "aptos buy tokens --credit-card",
                      "aptos mine --blocks 100",
                      "aptos transfer from master"], 0),
                    ("What is the purpose of named addresses in Move.toml (e.g. `my_addr = '_'` or `0xcafe`)?",
                     ["They decouple source code from hardcoded addresses, allowing seamless deployment to dynamic account addresses.",
                      "They create DNS records.",
                      "They encrypt GitHub commits.",
                      "They rename user wallets."], 0),
                    ("What does the `--named-addresses` flag do during Move compilation?",
                     ["It dynamically binds named address identifiers in the Move module to specific hex addresses at compile/publish time.",
                      "It sets the gas price to zero.",
                      "It downloads external images.",
                      "It exports private keys."], 0)
                ]
            },
            {
                "title": "Move Smart Contracts: Resources, Structs & Abilities",
                "desc": "Write production Move modules featuring the four abilities (key, store, copy, drop), global storage access, and Fungible Assets.",
                "keywords": ["Resource", "abilities"],
                "questions": [
                    ("What are the four core abilities in the Move programming language?",
                     ["key, store, copy, and drop",
                      "public, private, internal, and external",
                      "read, write, execute, and delete",
                      "get, set, push, and pop"], 0),
                    ("Which ability must a Move struct possess to be stored in global storage under an account address?",
                     ["key",
                      "copy",
                      "drop",
                      "store only"], 0),
                    ("Which built-in Move function publishes a newly instantiated resource into the caller's account storage?",
                     ["move_to(&signer, resource_instance)",
                      "borrow_global_mut<T>(address)",
                      "exists<T>(address)",
                      "destroy(resource)"], 0),
                    ("What is the difference between `copy` and `drop` abilities in Move?",
                     ["`copy` allows value duplicating, while `drop` allows values to be popped/destroyed when leaving scope.",
                      "`copy` destroys resources and `drop` clones them.",
                      "`copy` is for NFTs and `drop` is for tokens.",
                      "Both abilities do the exact same thing."], 0),
                    ("How does the Aptos Fungible Asset (FA) standard improve upon legacy Coin modules?",
                     ["It provides a unified, object-based standard for fungible tokens with native metadata, royalties, and deposit hooks.",
                      "It requires 50% more gas.",
                      "It prevents token transfers entirely.",
                      "It only works on Bitcoin."], 0),
                    ("Which Move function safely checks if a specific resource struct exists under an address before borrowing it?",
                     ["exists<T>(address)",
                      "borrow_global<T>(address)",
                      "is_null<T>(address)",
                      "check<T>(address)"], 0)
                ]
            },
            {
                "title": "Full-Stack Aptos DApps & TypeScript SDK Integration",
                "desc": "Connect Web3 frontends with the @aptos-labs/ts-sdk, integrate Petra/Pontem wallets, and execute entry function payloads.",
                "keywords": ["AptosSDK", "TypeScript"],
                "questions": [
                    ("Which official package is used to build modern Web3 frontends and scripts on Aptos?",
                     ["@aptos-labs/ts-sdk",
                      "web3.js legacy",
                      "ethers v4",
                      "aptos-php-client"], 0),
                    ("What is an `entry` function in an Aptos Move module?",
                     ["A public entrypoint function that can be called directly by external transactions signed by user wallets.",
                      "A private helper function for internal recursion.",
                      "The constructor function that only runs once at genesis.",
                      "A compiler configuration macro."], 0),
                    ("How does a frontend DApp request Petra Wallet to sign and broadcast a Move transaction?",
                     ["window.aptos.signAndSubmitTransaction({ payload: { function: '0x1::...::transfer', typeArguments: [], functionArguments: [recipient, amount] } })",
                      "window.alert('sign transfer')",
                      "document.cookie = 'transfer'",
                      "fetch('http://localhost/pay')"], 0),
                    ("What API does the Aptos Indexer provide for lightning-fast historical queries and token balances?",
                     ["GraphQL API endpoint with real-time subscriptions.",
                      "SOAP XML endpoints.",
                      "FTP directory listings.",
                      "CSV file downloads."], 0),
                    ("How are Move `view` functions queried using the Aptos TypeScript SDK?",
                     ["aptos.view({ payload: { function: '0x123::module::get_balance', functionArguments: [account] } }) without gas fees.",
                      "By submitting an on-chain transaction that burns APT.",
                      "By mining a block locally.",
                      "By restarting the browser."], 0),
                    ("What security check ensures a frontend only interacts with audited, verified Move package addresses?",
                     ["Verifying package bytecode hashes and module addresses against known on-chain registries.",
                      "Checking CSS font sizes.",
                      "Validating email addresses.",
                      "Using HTTP without TLS."], 0)
                ]
            },
            {
                "title": "Aptos Testnet Deployment Challenge & Verification",
                "desc": "Hands-on Deployment Challenge: Compile your Move package, publish to Aptos Testnet, verify bytecode on Aptos Explorer, and complete certification.",
                "keywords": ["aptos", "deploy", "testnet", "verify"],
                "questions": [
                    ("Which Aptos CLI command publishes a compiled Move module to Aptos Testnet?",
                     ["aptos move publish --named-addresses my_addr=default --assume-yes",
                      "aptos run upload",
                      "npm run deploy",
                      "git push testnet main"], 0),
                    ("What package upgrade policies are supported on Aptos?",
                     ["`compatible` (backward-compatible upgrades) and `immutable` (permanently locked code).",
                      "Only mutable code with unrestricted replacement.",
                      "No upgrades ever permitted.",
                      "Automatic daily code replacements."], 0),
                    ("Where can developers and grant reviewers inspect verified Move module bytecode on Aptos?",
                     ["Aptos Explorer (explorer.aptoslabs.com) or AptoScan.",
                      "Etherscan.",
                      "GitHub issues only.",
                      "A local text file."], 0),
                    ("What is required to verify that an Aptos testnet deployment challenge has completed successfully?",
                     ["A confirmed transaction hash on Aptos Testnet with valid emitted events and resource state creation.",
                      "A screenshot of a terminal only.",
                      "A printed paper receipt.",
                      "An email to the miner."], 0),
                    ("What gas optimization practice reduces storage costs when publishing Move modules?",
                     ["Minimizing unused dependencies in Move.toml and leveraging optimized byte representation.",
                      "Adding random comments.",
                      "Writing code in single long lines.",
                      "Increasing transaction gas limit to max."], 0),
                    ("How does successful completion of this Aptos track and deployment challenge qualify you for ecosystem grants?",
                     ["It provides verifiable proof of technical competency, on-chain testnet deployment, and production Move proficiency.",
                      "It automatically gives financial loans.",
                      "It eliminates the need for any application form.",
                      "It replaces developer interviews."], 0)
                ]
            }
        ]
    },
    "starknet": {
        "name": "Starknet",
        "currency": "STRK",
        "lang": "Cairo",
        "vm": "CairoVM",
        "framework": "Scarb, Starkli & Snforge",
        "testnet": "Starknet Sepolia",
        "explorer": "Starkscan / Voyager",
        "repo1": "https://github.com/starkware-libs/cairo",
        "repo2": "https://github.com/OpenZeppelin/cairo-contracts",
        "modules": [
            {
                "title": "Starknet Architecture, CairoVM & STARK Validity Proofs",
                "desc": "Explore Starknet ZK-Rollup architecture, STARK validity proofs, CairoVM execution, and native Account Abstraction.",
                "keywords": ["CairoVM", "STARK"],
                "questions": [
                    ("What is the primary scaling mechanism of Starknet as a Layer-2 ZK-Rollup?",
                     ["It executes thousands of transactions off-chain, bundles them into a single STARK validity proof, and verifies it on Ethereum L1.",
                      "It runs sidechains with separate consensus and no L1 security.",
                      "It deletes historical transactions every 30 days.",
                      "It uses centralized web servers without cryptography."], 0),
                    ("What is unique about STARK proofs compared to SNARKs?",
                     ["STARKs require no trusted setup ceremony and are transparent and post-quantum secure.",
                      "STARKs require toxic waste ceremonies.",
                      "STARKs are slower to verify.",
                      "STARKs only work on Bitcoin."], 0),
                    ("What does Native Account Abstraction mean on Starknet?",
                     ["All accounts are smart contracts with custom validation (`__validate__`) and execution (`__execute__`) logic — there are no EOAs.",
                      "Accounts are managed by centralized email servers.",
                      "Users have no private keys.",
                      "Contracts cannot hold balances."], 0),
                    ("What computational unit is natively used for arithmetic in the Cairo Virtual Machine (CairoVM)?",
                     ["Prime Field elements (`felt252`).",
                      "Floating-point IEEE-754 numbers.",
                      "ASCII strings.",
                      "64-bit signed integers only."], 0),
                    ("What role does the Starknet Sequencer play in the network topology?",
                     ["It receives transactions, orders them, executes Cairo bytecode, and generates L2 blocks before sending state diffs to the Prover.",
                      "It mines Proof of Work hashes.",
                      "It verifies Ethereum L1 consensus.",
                      "It hosts user frontends."], 0),
                    ("How does Cairo 2.0 guarantee that code execution can always be proven?",
                     ["Using Sierra (Safe Intermediate Execution Representation) which ensures all branches and operations are provable without crashes.",
                      "By running Java bytecode in a sandbox.",
                      "By preventing loops and if statements.",
                      "By executing code on Ethereum L1 directly."], 0)
                ]
            },
            {
                "title": "Cairo 2.0 Tooling: Scarb, Starkli & Snforge Environment",
                "desc": "Set up Scarb package manager, Starkli CLI account management, and Snforge testing framework for Starknet Sepolia.",
                "keywords": ["Scarb", "Starkli"],
                "questions": [
                    ("Which official build tool and package manager is used for Cairo and Starknet projects?",
                     ["Scarb",
                      "npm",
                      "pip",
                      "maven"], 0),
                    ("What command-line tool is used for declaring class hashes and deploying contract instances on Starknet?",
                     ["starkli",
                      "hardhat",
                      "truffle",
                      "remix"], 0),
                    ("Why are Starknet deployments split into two distinct steps (`declare` and `deploy`)?",
                     ["`declare` registers the immutable contract class code and computes the class hash once, while `deploy` instantiates individual contract instances.",
                      "Because the compiler cannot run in one step.",
                      "To charge double gas fees.",
                      "To verify user identity."], 0),
                    ("Which testing framework provides blazing-fast unit tests and cheatcodes for Cairo contracts?",
                     ["snforge (Starknet Foundry)",
                      "Mocha/Chai",
                      "PyTest legacy",
                      "JUnit"], 0),
                    ("What configuration file defines dependencies and compiler targets for a Scarb project?",
                     ["Scarb.toml",
                      "Cargo.lock",
                      "package.json",
                      "starknet.config.json"], 0),
                    ("Which testnet is the primary network for Starknet contract testing and grant verifications?",
                     ["Starknet Sepolia",
                      "Goerli (deprecated)",
                      "Ropsten",
                      "Kovan"], 0)
                ]
            },
            {
                "title": "Cairo Smart Contracts: Storage, Components & Events",
                "desc": "Write secure Cairo 2.0 contracts using #[starknet::contract], storage mappings, Cairo components, and events.",
                "keywords": ["starknet", "contract", "cairo"],
                "questions": [
                    ("Which attribute macro marks a module as a deployable Starknet smart contract in Cairo 2.0?",
                     ["#[starknet::contract]",
                      "#[contract]",
                      "#[solidity::contract]",
                      "#[program]"], 0),
                    ("Where is contract persistent state declared in a Cairo smart contract?",
                     ["Inside the `#[storage]` struct definition.",
                      "In global memory variables.",
                      "In the Scarb.toml file.",
                      "In frontend localStorage."], 0),
                    ("How do Cairo Components replace Solidity-style contract inheritance?",
                     ["Components are modular, composable contract logic packages (like OpenZeppelin ERC20) that can be embedded into any contract state.",
                      "Components are CSS UI widgets.",
                      "Components replace RPC endpoints.",
                      "Components delete contract storage."], 0),
                    ("Which type is used to represent modern 256-bit integers in Cairo 2.0?",
                     ["u256 (composed of two 128-bit limbs: low and high)",
                      "felt252 only",
                      "int64",
                      "double"], 0),
                    ("How are events declared and emitted in Cairo smart contracts?",
                     ["Declared inside an `#[event]` enum and emitted via `self.emit(EventName { ... })`.",
                      "By printing to console with `println!()`.",
                      "By sending HTTP POST requests.",
                      "By writing to a text file."], 0),
                    ("What access control pattern is standard in Cairo OpenZeppelin contracts?",
                     ["Ownable Component (`#[abi(embed_v0)] impl OwnableImpl`) and AccessControl Component.",
                      "Hardcoding admin private key in storage.",
                      "Checking IP addresses.",
                      "Allowing any caller to call admin functions."], 0)
                ]
            },
            {
                "title": "Full-Stack Starknet DApps & Starknet.js Integration",
                "desc": "Build full-stack DApps with Starknet.js v6, connect ArgentX & Braavos wallets, and leverage Account Abstraction multicalls.",
                "keywords": ["StarknetJS", "ArgentX"],
                "questions": [
                    ("Which JavaScript/TypeScript SDK is the industry standard for Starknet DApps?",
                     ["starknet.js (v6)",
                      "web3.js",
                      "ethers.js v5",
                      "viem EVM"], 0),
                    ("What major UX advantage does Starknet's Account Abstraction provide for transaction bundling?",
                     ["Multicalls — users can approve tokens AND execute a swap in a single atomic transaction signature.",
                      "Transactions require no internet connection.",
                      "Gas is refunded in Bitcoin.",
                      "Wallets have no passcodes."], 0),
                    ("Which popular Web3 smart contract wallets are native to Starknet?",
                     ["Argent X and Braavos",
                      "MetaMask only",
                      "Phantom only",
                      "Coinbase Wallet extension only"], 0),
                    ("What is a Paymaster on Starknet?",
                     ["A smart contract that sponsors transaction gas fees or allows users to pay gas in alternative ERC-20 tokens (like USDC or STRK).",
                      "A payroll employee.",
                      "A hardware mining machine.",
                      "A block explorer advertisement."], 0),
                    ("How do developers query read-only contract state using Starknet.js?",
                     ["Using `myContract.call('get_balance', [userAddress])` without submitting a transaction.",
                      "By broadcasting a signed transaction that pays gas.",
                      "By querying an SQL database.",
                      "By restarting the RPC node."], 0),
                    ("What RPC method retrieves filtered contract events directly from Starknet RPC nodes?",
                     ["starknet_getEvents",
                      "eth_getLogs",
                      "sol_getEvents",
                      "get_transactions"], 0)
                ]
            },
            {
                "title": "Starknet Sepolia Deployment Challenge & ZK Verification",
                "desc": "Hands-on Deployment Challenge: Build with Scarb, declare your class hash, deploy to Starknet Sepolia, and verify on Starkscan.",
                "keywords": ["starknet", "deploy", "sepolia", "verify"],
                "questions": [
                    ("Which command declares a compiled Cairo contract class hash to Starknet Sepolia?",
                     ["starkli declare target/dev/my_contract.contract_class.json --network sepolia",
                      "starkli upload contract",
                      "scarb push mainnet",
                      "npm run declare"], 0),
                    ("Which command instantiates and deploys a declared class hash with constructor arguments?",
                     ["starkli deploy <CLASS_HASH> <CONSTRUCTOR_ARGS> --network sepolia",
                      "starkli create contract",
                      "forge create",
                      "cargo deploy"], 0),
                    ("Where can developers and grant evaluators verify deployed Cairo contracts on Starknet Sepolia?",
                     ["Starkscan (sepolia.starkscan.co) or Voyager (sepolia.voyager.online).",
                      "Etherscan mainnet.",
                      "Solscan.",
                      "Subscan."], 0),
                    ("What role does the Universal Deployer Contract (UDC) play on Starknet?",
                     ["It standardizes deterministic contract address deployment using salt and caller addresses across the network.",
                      "It burns unused STRK tokens.",
                      "It manages user seed phrases.",
                      "It routes DNS traffic."], 0),
                    ("What verification artifact confirms successful completion of the Starknet Deployment Challenge?",
                     ["A confirmed transaction hash on Starknet Sepolia with verified contract class and initial storage state.",
                      "A local terminal log screenshot.",
                      "A paper certificate.",
                      "A GitHub commit with no deployment."], 0),
                    ("Why is completing this deployment challenge critical for Starknet Foundation grant reviewers?",
                     ["It provides immutable on-chain proof of working Cairo smart contract deployments and real Layer-2 builder impact.",
                      "It guarantees immediate grant funding without review.",
                      "It eliminates the need for code review.",
                      "It waives all future gas fees."], 0)
                ]
            }
        ]
    },
    "solana": {
        "name": "Solana",
        "currency": "SOL",
        "lang": "Rust & Anchor",
        "vm": "Sealevel",
        "framework": "Anchor Framework & Solana CLI",
        "testnet": "Solana Devnet",
        "explorer": "Solana Explorer / Solscan",
        "repo1": "https://github.com/coral-xyz/anchor",
        "repo2": "https://github.com/solana-labs/solana-program-library",
        "modules": [
            {
                "title": "Solana Architecture, Sealevel Runtime & Proof of History",
                "desc": "Master Solana high-throughput architecture: Proof of History (PoH), Sealevel parallel execution, and the Account model.",
                "keywords": ["Sealevel", "ProofOfHistory"],
                "questions": [
                    ("What is Proof of History (PoH) in Solana architecture?",
                     ["A verifiable cryptographic delay function (VDF) that creates a decentralized clock before consensus, enabling parallel processing.",
                      "A Proof of Work mining algorithm.",
                      "A database backup system.",
                      "A KYC identity verification standard."], 0),
                    ("How does the Sealevel parallel smart contract runtime achieve massive throughput?",
                     ["By reading and writing to non-overlapping accounts concurrently across multiple CPU threads and GPU cores.",
                      "By executing all transactions on a single thread.",
                      "By delaying block production.",
                      "By deleting historical blocks."], 0),
                    ("In Solana's account model, what is the key distinction between programs and data accounts?",
                     ["Programs (code) are marked as executable and are stateless; all state is stored separately in data accounts.",
                      "Programs store all variables inside their own code.",
                      "Data accounts can execute instructions directly.",
                      "There is no distinction between code and data."], 0),
                    ("What is Rent in the Solana account model?",
                     ["A storage fee deducted from accounts unless they maintain a minimum SOL balance to be 'Rent Exempt'.",
                      "A monthly fee paid to cloud servers.",
                      "Transaction fee paid to validators.",
                      "Gas cost for compilation."], 0),
                    ("What is Gulf Stream in Solana network engineering?",
                     ["A mempool-less transaction forwarding protocol that pushes transactions to upcoming leaders before block generation.",
                      "A cross-chain bridge to Ethereum.",
                      "An ocean current monitoring system.",
                      "A cold storage hardware wallet."], 0),
                    ("What prevents state corruption during concurrent parallel execution on Solana?",
                     ["Transactions must explicitly declare all accounts they intend to read and write in advance.",
                      "Transactions are paused when two users click send.",
                      "Global locks on the entire blockchain state.",
                      "Transactions run only at midnight."], 0)
                ]
            },
            {
                "title": "Solana Toolchain, Anchor Framework & Local Validator",
                "desc": "Configure Solana CLI, Anchor framework, Anchor.toml, solana-test-validator, and Devnet airdrop funding.",
                "keywords": ["Anchor", "SolanaCLI"],
                "questions": [
                    ("Which framework is the industry standard for writing secure, idiomatic Solana smart contracts in Rust?",
                     ["Anchor Framework",
                      "Hardhat",
                      "Foundry",
                      "Truffle"], 0),
                    ("Which command compiles an Anchor project and generates the Interface Definition Language (IDL)?",
                     ["anchor build",
                      "cargo run",
                      "solana build",
                      "npm run compile"], 0),
                    ("What is the purpose of the Anchor IDL (Interface Definition Language) JSON file?",
                     ["It describes all instructions, accounts, types, and errors, allowing client SDKs to generate typed bindings automatically.",
                      "It stores private keys.",
                      "It formats CSS stylesheets.",
                      "It calculates validator rewards."], 0),
                    ("Which command starts a fast local Solana test validator on your development machine?",
                     ["solana-test-validator",
                      "solana start",
                      "anchor localnode",
                      "docker solana up"], 0),
                    ("How do you request 2 free SOL on Solana Devnet for contract deployment testing?",
                     ["solana airdrop 2 --url devnet",
                      "solana buy 2 devnet",
                      "solana mine devnet",
                      "solana faucet get 2"], 0),
                    ("What file in an Anchor project configures cluster URLs, program IDs, and test scripts?",
                     ["Anchor.toml",
                      "package.json",
                      "Cargo.toml",
                      "solana.json"], 0)
                ]
            },
            {
                "title": "Anchor Smart Contracts: Accounts, PDAs & Instructions",
                "desc": "Implement Anchor programs with #[derive(Accounts)], Program Derived Addresses (PDAs), and account validation constraints.",
                "keywords": ["PDA", "AnchorProgram"],
                "questions": [
                    ("What is a Program Derived Address (PDA) in Solana?",
                     ["An account address deterministically derived from program ID and seed bytes that has no private key, controlled solely by the program.",
                      "A standard user wallet address.",
                      "A random number generated by miners.",
                      "A temporary session token."], 0),
                    ("What macro in Anchor validates and deserializes accounts before executing instruction logic?",
                     ["#[derive(Accounts)]",
                      "#[storage]",
                      "#[payable]",
                      "#[contract]"], 0),
                    ("Why must accounts initialized with `#[account(init, payer = signer, space = 8 + ...)]` allocate space?",
                     ["To allocate memory on-chain, including the 8-byte Anchor discriminator and serialized data field sizes.",
                      "To reserve bandwidth on RPC nodes.",
                      "To pay validator tips.",
                      "To speed up compiler execution."], 0),
                    ("What is a Cross-Program Invocation (CPI) on Solana?",
                     ["A direct on-chain call from one Solana program to another (e.g. calling the SPL Token program to transfer tokens).",
                      "An API call from frontend to backend.",
                      "A database query.",
                      "An off-chain bridge."], 0),
                    ("How does Anchor protect against account substitution and missing signer vulnerabilities?",
                     ["Through declarative account constraints like `#[account(signer)]` and `#[account(mut, has_one = authority)]`.",
                      "By disabling multi-user transactions.",
                      "By encrypting all account data with passwords.",
                      "By running contracts in read-only mode."], 0),
                    ("What standard token library is used for fungible and non-fungible tokens on Solana?",
                     ["SPL Token (Solana Program Library) and Token-2022 Extensions.",
                      "ERC-20 standard.",
                      "Move Coin module.",
                      "Cairo token component."], 0)
                ]
            },
            {
                "title": "Full-Stack Solana DApps & @solana/web3.js Integration",
                "desc": "Build responsive Solana DApps with @solana/web3.js, @coral-xyz/anchor, Phantom wallet adapter, and versioned transactions.",
                "keywords": ["SolanaWeb3", "Phantom"],
                "questions": [
                    ("Which JavaScript libraries are used to build interactive full-stack Solana web applications?",
                     ["@solana/web3.js, @coral-xyz/anchor, and @solana/wallet-adapter-react",
                      "web3.py",
                      "ethers v5",
                      "starknet.js"], 0),
                    ("What are Versioned Transactions (v0) and Address Lookup Tables (ALTs) on Solana?",
                     ["They compress large transaction payloads by referencing 256 accounts in an on-chain table, bypassing the 1232-byte limit.",
                      "They increase transaction fees.",
                      "They disable transaction signatures.",
                      "They convert SOL to ETH."], 0),
                    ("How do you initialize a typed Anchor Program client in TypeScript?",
                     ["const program = new Program(IDL, programId, provider);",
                      "const program = new Contract(abi, address);",
                      "const program = loadProgram('solana');",
                      "const program = fetchProgram(rpc);"], 0),
                    ("What method listens to real-time account state updates via Solana WebSocket RPC connections?",
                     ["connection.onAccountChange(publicKey, callback)",
                      "connection.poll()",
                      "window.addEventListener('block')",
                      "document.onchange()"], 0),
                    ("Which popular browser extension wallets are standard across the Solana ecosystem?",
                     ["Phantom and Solflare",
                      "ArgentX only",
                      "SubWallet only",
                      "MetaMask only"], 0),
                    ("How does a frontend handle RPC rate limits when querying Solana cluster state?",
                     ["Using dedicated RPC providers (Helius, Triton, QuickNode) and implementing retry backoffs.",
                      "By closing the user's browser.",
                      "By removing wallet connections.",
                      "By deploying private testnets."], 0)
                ]
            },
            {
                "title": "Solana Devnet Deployment Challenge & Verification",
                "desc": "Hands-on Deployment Challenge: Build your Anchor program, deploy bytecode to Solana Devnet, publish IDL, and verify on Solscan.",
                "keywords": ["solana", "deploy", "devnet", "verify"],
                "questions": [
                    ("Which command deploys a compiled Solana program binary to Devnet?",
                     ["solana program deploy target/deploy/my_program.so --url devnet",
                      "solana upload contract",
                      "anchor publish",
                      "npm run deploy:devnet"], 0),
                    ("How do developers publish their Anchor IDL directly on-chain for public explorer verification?",
                     ["anchor idl init --filepath target/idl/my_program.json <PROGRAM_ID> --provider.cluster devnet",
                      "solana idl push",
                      "git commit idl.json",
                      "npm publish idl"], 0),
                    ("Where can developers, users, and grant committees inspect verified Solana Devnet programs?",
                     ["Solscan Devnet (solscan.io/?cluster=devnet) or Solana Explorer (explorer.solana.com/?cluster=devnet).",
                      "Etherscan.",
                      "Starkscan.",
                      "Subscan."], 0),
                    ("What keypair authority is required to execute future program upgrades on Solana?",
                     ["The Upgrade Authority keypair configured during initial program deployment.",
                      "Any random user wallet.",
                      "The validator leader.",
                      "A cloud API token."], 0),
                    ("What on-chain artifacts prove successful completion of the Solana Deployment Challenge?",
                     ["A live Program ID on Solana Devnet, initialized PDA data accounts, and confirmed transaction signatures.",
                      "A screenshot of VS Code.",
                      "A text file on your desktop.",
                      "A GitHub pull request with no deployment."], 0),
                    ("Why do Solana Foundation and Superteam grant reviewers evaluate live Devnet deployments?",
                     ["It demonstrates working technical mastery of Anchor, account space allocation, PDA security, and true builder readiness.",
                      "It replaces pitch decks completely.",
                      "It automatically guarantees venture capital funding.",
                      "It gives unlimited free SOL."], 0)
                ]
            }
        ]
    },
    "polkadot": {
        "name": "Polkadot",
        "currency": "DOT",
        "lang": "Rust & ink!",
        "vm": "Wasm & pallet-contracts",
        "framework": "cargo-contract, Substrate & Swanky",
        "testnet": "Westend / Rococo / Substrate Node",
        "explorer": "Subscan / Polkadot.js Apps",
        "repo1": "https://github.com/paritytech/polkadot-sdk",
        "repo2": "https://github.com/use-ink/ink",
        "modules": [
            {
                "title": "Polkadot Architecture, Shared Security & XCM Cross-Chain Protocol",
                "desc": "Understand Polkadot Relay Chain & Parachains, Nominated Proof of Stake (NPoS), Shared Security, and Cross-Consensus Messaging (XCM).",
                "keywords": ["Substrate", "Polkadot"],
                "questions": [
                    ("What is the primary role of the Polkadot Relay Chain in the multi-chain ecosystem?",
                     ["It coordinates shared security, consensus, and trust-free cross-chain messaging (XCM) across all connected parachains.",
                      "It executes individual smart contracts directly on the relay chain.",
                      "It hosts user frontends on decentralized servers.",
                      "It mines Bitcoin blocks."], 0),
                    ("What is the consensus mechanism utilized by Polkadot for network security and block finality?",
                     ["Nominated Proof-of-Stake (NPoS) paired with BABE block authoring and GRANDPA deterministic finality gadget.",
                      "Proof of Work SHA-256 mining.",
                      "Proof of Elapsed Time.",
                      "Single-node centralized validation."], 0),
                    ("What is XCM (Cross-Consensus Messaging) in Polkadot?",
                     ["A standardized, language-agnostic message format for trust-free interoperability between parachains, smart contracts, and relay chains.",
                      "An email newsletter for token holders.",
                      "A WebSocket protocol for browser notifications.",
                      "A compiler optimizer for C++."], 0),
                    ("What is the core advantage of Shared Security for parachain developers?",
                     ["New parachains inherit the economic security of the entire Polkadot validator pool from day one without bootstrapping their own validators.",
                      "Parachains never pay transaction fees.",
                      "Parachains do not require code auditing.",
                      "Parachains run without internet connections."], 0),
                    ("What is Agile Coretime in the Polkadot 2.0 architecture?",
                     ["A dynamic, flexible market for purchasing computing power and blockspace on-demand (bulk or instant) instead of multi-year slot auctions.",
                      "A system clock for CPU cooling.",
                      "A manual miner scheduling tool.",
                      "A monthly token subscription."], 0),
                    ("What is the Substrate framework in Polkadot ecosystem development?",
                     ["A modular, extensible Rust framework for building custom, sovereign blockchains and execution runtimes (FRAME pallets).",
                      "A React CSS framework.",
                      "A hardware wallet manufacturing kit.",
                      "A database query language."], 0)
                ]
            },
            {
                "title": "Substrate & ink! Toolchain: cargo-contract & Swanky Suite",
                "desc": "Set up cargo-contract, WebAssembly (Wasm) target toolchains, Substrate Contracts Node, and Polkadot.js Apps developer interface.",
                "keywords": ["cargoContract", "ink"],
                "questions": [
                    ("Which CLI tool is the official compiler and packaging suite for ink! WebAssembly smart contracts?",
                     ["cargo-contract",
                      "anchor-cli",
                      "scarb",
                      "truffle"], 0),
                    ("What file bundle is generated by `cargo contract build --release` for deployment?",
                     ["A `.contract` bundle containing compiled WebAssembly bytecode and metadata.json ABI.",
                      "A `.sol` text file.",
                      "A `.wasm` file only without metadata.",
                      "A `.zip` image archive."], 0),
                    ("Which local node environment is specifically designed for testing ink! contracts locally?",
                     ["Substrate Contracts Node (`substrate-contracts-node`)",
                      "Hardhat Network",
                      "Anvil",
                      "Geth node"], 0),
                    ("What is Swanky Suite in the Polkadot developer ecosystem?",
                     ["An integrated CLI and developer toolkit for creating, compiling, deploying, and testing ink! Wasm smart contracts.",
                      "A DEX trading bot.",
                      "A wallet extension for Chrome.",
                      "A Discord community bot."], 0),
                    ("Which web interface allows developers to inspect extrinsics, upload code, and interact with parachain nodes?",
                     ["Polkadot.js Apps (polkadot.js.org/apps)",
                      "Remix IDE",
                      "Solscan",
                      "Etherscan"], 0),
                    ("Which testnets are standard for deploying and testing Substrate and ink! contracts before mainnet?",
                     ["Westend (Relay Chain testnet), Rococo (Parachain testnet), and Paseo testnet.",
                      "Sepolia EVM testnet.",
                      "Solana Devnet.",
                      "Bitcoin Regtest."], 0)
                ]
            },
            {
                "title": "ink! Smart Contracts: Messages, Storage & Events",
                "desc": "Write idiomatic Rust ink! contracts: #[ink(storage)], ink::storage::Mapping, payable messages, and custom error types.",
                "keywords": ["inkContract", "storage"],
                "questions": [
                    ("What is ink! in the Polkadot / Substrate ecosystem?",
                     ["An embedded domain-specific language (eDSL) based on Rust that compiles smart contracts to WebAssembly for `pallet-contracts`.",
                      "A visual drag-and-drop programming language.",
                      "A private sidechain.",
                      "A graphic design tool."], 0),
                    ("Which attribute macro marks the root persistent storage struct in an ink! contract?",
                     ["#[ink(storage)]",
                      "#[storage]",
                      "#[state]",
                      "#[derive(Accounts)]"], 0),
                    ("Which storage data structure provides gas-efficient key-value mappings in ink! 4/5?",
                     ["ink::storage::Mapping<K, V>",
                      "std::collections::HashMap<K, V>",
                      "Vec<K, V>",
                      "Array<K, V>"], 0),
                    ("What is the difference between `#[ink(constructor)]` and `#[ink(message)]` in ink!?",
                     ["`constructor` initializes contract state at instantiation, while `message` defines callable external methods.",
                      "`constructor` executes on every transaction.",
                      "`message` only runs during compilation.",
                      "Both macros are identical."], 0),
                    ("How are value-receiving functions marked in ink! smart contracts?",
                     ["#[ink(message, payable)]",
                      "#[payable]",
                      "#[receive_tokens]",
                      "#[msg_value]"], 0),
                    ("What return type is recommended for fallible ink! messages to return clean error diagnostics to callers?",
                     ["Result<T, Error> with custom enum error variants.",
                      "Boolean true/false only.",
                      "Null pointers.",
                      "Void with panic!()."], 0)
                ]
            },
            {
                "title": "Full-Stack Polkadot DApps & Polkadot.js API Integration",
                "desc": "Build responsive Web3 frontends with @polkadot/api, @polkadot/api-contract, SubWallet/Talisman, and Weight V2 gas estimation.",
                "keywords": ["PolkadotAPI", "SubWallet"],
                "questions": [
                    ("Which JavaScript/TypeScript API libraries connect frontends to Polkadot parachains and ink! contracts?",
                     ["@polkadot/api and @polkadot/api-contract",
                      "ethers.js v6",
                      "web3.py",
                      "starknet.js"], 0),
                    ("What are the two components of Weight V2 in Substrate gas metering?",
                     ["`ref_time` (CPU execution time in picoseconds) and `proof_size` (storage proof size in bytes).",
                      "Gas price and gas limit.",
                      "Memory and disk space only.",
                      "Network latency and ping."], 0),
                    ("Which multi-chain browser wallets provide native support for Polkadot, Kusama, and ink! parachains?",
                     ["SubWallet, Talisman, and Polkadot.js extension",
                      "MetaMask only",
                      "Phantom only",
                      "Coinbase Wallet only"], 0),
                    ("How do developers instantiate a typed contract instance using @polkadot/api-contract?",
                     ["const contract = new ContractPromise(api, metadataAbi, contractAddress);",
                      "const contract = new Web3Contract(abi);",
                      "const contract = loadContract();",
                      "const contract = api.get();"], 0),
                    ("What event callback confirms that a Substrate transaction has achieved deterministic finality?",
                     ["`status.isFinalized` in the extrinsic subscription stream.",
                      "`status.isInBlock` only.",
                      "`status.isBroadcast` only.",
                      "`window.onload`."], 0),
                    ("How does a frontend DApp estimate gas/weight before executing an ink! state-modifying message?",
                     ["By performing a dry-run via `contract.query.<method>()` to obtain the predicted gasRequired and storageDeposit.",
                      "By asking the user to type a random number.",
                      "By guessing 100,000 gas.",
                      "By submitting an unmetered transaction."], 0)
                ]
            },
            {
                "title": "Polkadot / Substrate Deployment Challenge & Verification",
                "desc": "Hands-on Deployment Challenge: Compile your ink! contract to Wasm, instantiate on Polkadot testnet / Substrate Contracts Node, and verify on Subscan.",
                "keywords": ["polkadot", "deploy", "substrate", "verify"],
                "questions": [
                    ("Which command compiles an ink! contract into optimized release WebAssembly bytecode?",
                     ["cargo contract build --release",
                      "cargo build",
                      "npm run build",
                      "solc --release"], 0),
                    ("What is the difference between code upload (`upload_code`) and contract instantiation (`instantiate_with_code`) in `pallet-contracts`?",
                     ["`upload_code` stores the Wasm bytecode once and returns a CodeHash, allowing multiple contract instances to share the same code cheaply.",
                      "`upload_code` executes all functions immediately.",
                      "`instantiate` deletes the bytecode after deployment.",
                      "There is no difference."], 0),
                    ("What is the purpose of the `salt` parameter during ink! contract instantiation?",
                     ["It ensures unique, deterministic contract address generation even when instantiating the same CodeHash multiple times.",
                      "It encrypts the contract bytecode.",
                      "It sets the admin password.",
                      "It calculates validator tips."], 0),
                    ("Where can developers and Web3 Foundation grant evaluators inspect verified Polkadot/Kusama contract deployments?",
                     ["Subscan (subscan.io) or Polkadot.js Apps Contract tab.",
                      "Etherscan.",
                      "Solscan.",
                      "Basescan."], 0),
                    ("What verified artifact proves successful completion of the Polkadot / Substrate Deployment Challenge?",
                     ["A confirmed Extrinsic Block Hash, deployed Contract Account Address, and verified Wasm metadata on-chain.",
                      "A text file on your computer.",
                      "A printed PDF with no blockchain hash.",
                      "A screenshot of a local folder."], 0),
                    ("Why do Web3 Foundation and Decentralized Futures grant committees prioritize live testnet deployments?",
                      ["It provides immutable on-chain proof of working Rust Wasm smart contracts, technical proficiency, and ecosystem impact.",
                       "It automatically guarantees token allocations.",
                       "It eliminates the need for software engineering.",
                       "It waives all future blockchain transactions."], 0)
                ]
            }
        ]
    },
    "fullstack": {
        "name": "Full Stack Blockchain Developer",
        "currency": "ETH / MULTI",
        "lang": "TypeScript & Solidity",
        "vm": "EVM & Node/Browser Web3 Engine",
        "framework": "Next.js 14, Viem, Wagmi v2, Ethers.js & Foundry",
        "testnet": "Arbitrum Sepolia, Base Sepolia & OP Sepolia",
        "explorer": "Arbiscan / BaseScan / Etherscan",
        "repo1": "https://github.com/scaffold-eth/scaffold-eth-2",
        "repo2": "https://github.com/wevm/wagmi",
        "modules": [
            {
                "title": "Full-Stack Web3 Architecture & RPC Provider Topologies",
                "desc": "Master end-to-end decentralized application architecture: client-side wallet connections (EIP-1193), JSON-RPC node infrastructure (Alchemy/Infura/QuickNode), multi-chain fallback providers, and CORS/WebSocket rate limiting.",
                "keywords": ["provider", "rpc"],
                "questions": [
                    ("What is the primary role of an RPC provider (like Infura or Alchemy) in full-stack Web3 architecture?",
                     ["To serve as a JSON-RPC gateway allowing web frontends to read blockchain state and broadcast signed transactions without running local archive nodes.",
                      "To custody user private keys on centralized servers.",
                      "To compile TypeScript code into WebAssembly.",
                      "To replace decentralized consensus with SQL queries."], 0),
                    ("What standard interface defines how browser wallet extensions (like MetaMask) communicate with Web3 frontends?",
                     ["EIP-1193 JavaScript Ethereum Provider API (`window.ethereum`).",
                      "OAuth 2.0 PKCE protocol.",
                      "GraphQL Schema Definition.",
                      "FTP byte-stream protocol."], 0),
                    ("Why should full-stack DApps configure fallback RPC transports instead of relying on a single endpoint?",
                     ["To prevent single points of failure, mitigate rate limits (HTTP 429), and automatically failover during network congestion.",
                      "To bypass blockchain gas fees entirely.",
                      "To make transactions irreversible without confirmations.",
                      "To disable smart contract security checks."], 0),
                    ("What security measure prevents malicious websites from spoofing transactions through wallet providers?",
                     ["Cryptographic transaction signing where private keys never leave the secure enclave or extension sandbox.",
                      "Plaintext passwords stored in browser cookies.",
                      "IP address whitelisting on smart contracts.",
                      "HTML input sanitization."], 0),
                    ("How do Web3 frontends handle real-time smart contract events (e.g. Transfers, Mints)?",
                     ["Via WebSocket (WSS) JSON-RPC subscriptions or HTTP polling mechanisms listening to contract logs.",
                      "By continuously refreshing the entire webpage every second.",
                      "By reading browser LocalStorage directly.",
                      "By sending emails to node operators."], 0)
                ]
            },
            {
                "title": "Smart Contract Interaction Hooks with Viem, Wagmi v2 & React Query",
                "desc": "Build reactive Web3 interfaces with Wagmi v2 and Viem: type-safe contract reads, write simulation (`simulateContract`), TanStack React Query cache invalidation, and custom hooks.",
                "keywords": ["wagmi", "viem"],
                "questions": [
                    ("What makes Viem more performant and developer-friendly than legacy Web3 libraries?",
                     ["It is modular, lightweight, tree-shakeable, and provides end-to-end TypeScript type inference directly from Contract ABIs.",
                      "It eliminates the need for Solidity compilation.",
                      "It runs contracts entirely inside SQLite.",
                      "It does not require network connections."], 0),
                    ("Why is `simulateContract` (dry-running) recommended before broadcasting a write transaction in Wagmi/Viem?",
                     ["It executes the call locally on the node to catch reverts and calculate accurate gas estimates before the user pays gas fees.",
                      "It deposits free tokens into the caller's wallet.",
                      "It permanently records the state change without a transaction.",
                      "It deletes all contract warnings."], 0),
                    ("How does Wagmi v2 integrate with TanStack React Query?",
                     ["It leverages Query and Mutation hooks (`useReadContract`, `useWriteContract`) for automatic caching, refetching, and window focus synchronization.",
                      "It replaces React component lifecycle with WebSockets.",
                      "It forces all state to be stored in URL parameters.",
                      "It requires global Redux stores."], 0),
                    ("What is an ABI (Application Binary Interface) in frontend contract integration?",
                     ["A JSON schema specifying functions, inputs, outputs, and event signatures necessary for encoding calls and decoding receipts.",
                      "A CSS stylesheet defining button layouts.",
                      "A node server configuration file.",
                      "A binary executable that runs the EVM."], 0),
                    ("How do you handle pending transaction states and receipt confirmations in a React DApp?",
                     ["Using `useWaitForTransactionReceipt` with the transaction hash to track confirmation status and show loaders.",
                      "By assuming the transaction succeeds immediately when the wallet popup appears.",
                      "By disabling user clicks for a hardcoded 5 minutes.",
                      "By checking backend database rows."], 0)
                ]
            },
            {
                "title": "Decentralized Indexing & Storage: The Graph, Subgraphs & IPFS",
                "desc": "Architect scalable decentralized backends: writing AssemblyScript mappings for The Graph subgraphs, querying indexed blockchain entities via GraphQL, and pinning decentralized metadata with IPFS / Filecoin.",
                "keywords": ["subgraph", "ipfs"],
                "questions": [
                    ("Why are indexing protocols like The Graph necessary for production full-stack Web3 applications?",
                     ["Standard RPC nodes only support basic key-value lookups; subgraphs index event logs into relational GraphQL databases for complex queries and filtering.",
                      "Because blockchains cannot execute smart contracts without subgraphs.",
                      "To replace all frontend React components with server-rendered HTML.",
                      "To encrypt all user wallet balances."], 0),
                    ("What language is used to write event handlers and mappings inside a Subgraph manifest?",
                     ["AssemblyScript (a TypeScript-like language compiled to WebAssembly).",
                      "Python Django.",
                      "PHP 8.2.",
                      "C# .NET."], 0),
                    ("What is the primary characteristic of IPFS (InterPlanetary File System) storage?",
                     ["Content-addressable storage where data is referenced by its cryptographic hash (CID) rather than a location URL.",
                      "A centralized Amazon S3 bucket managed by node validators.",
                      "A relational PostgreSQL table stored in browser memory.",
                      "A temporary caching proxy."], 0),
                    ("What is 'IPFS Pinning' and why is it essential for production DApp assets?",
                     ["Ensuring that specific IPFS nodes persistently store and serve content so it does not get garbage-collected from the P2P network.",
                      "Locking files with a four-digit PIN code.",
                      "Compressing images into zip archives.",
                      "Encrypting HTML tags with SHA-256."], 0),
                    ("How does a frontend DApp efficiently query an indexed Subgraph?",
                     ["By sending standard GraphQL queries via Apollo Client or Urql to The Graph decentralized network or hosted service.",
                      "By connecting directly via SSH to Ethereum miners.",
                      "By scraping block explorer HTML pages.",
                      "By downloading the entire Ethereum blockchain locally."], 0)
                ]
            },
            {
                "title": "Modern Account Abstraction: ERC-4337, Paymasters & Smart Sessions",
                "desc": "Implement next-generation Web3 UX: UserOperations, Bundlers, EntryPoint contract architecture, Gasless Paymasters (sponsoring transactions), and passkey/session-key authentication with Coinbase Smart Wallet / Biconomy.",
                "keywords": ["ERC4337", "paymaster"],
                "questions": [
                    ("What is the primary breakthrough of ERC-4337 Account Abstraction?",
                     ["It enables smart contract wallets with custom verification logic, gas sponsorship, and batching without requiring Ethereum protocol consensus changes.",
                      "It removes private key cryptography from Web3 entirely.",
                      "It replaces gas fees with monthly credit card subscriptions.",
                      "It turns all smart contracts into ERC-20 tokens."], 0),
                    ("What is a 'UserOperation' in the ERC-4337 architecture?",
                     ["A pseudo-transaction object describing an execution request sent to an alternative mempool, later bundled into an on-chain transaction by a Bundler.",
                      "A standard browser mouse click event.",
                      "A user password change request.",
                      "A compiler optimization warning."], 0),
                    ("What role does a Paymaster contract fulfill in Account Abstraction?",
                     ["It inspects UserOperations and sponsors gas fees (gasless transactions) or allows users to pay gas in ERC-20 tokens like USDC.",
                      "It acts as a decentralized bank granting loans.",
                      "It stores smart contract compiler binaries.",
                      "It prints NFT artwork."], 0),
                    ("How do Session Keys improve Web3 gaming and DeFi user experience?",
                     ["They allow pre-approved smart contract interactions within specific parameters and time windows without prompt popups for every action.",
                      "They delete all user session cookies when the tab closes.",
                      "They store private keys in plaintext in local storage.",
                      "They grant permanent administrator ownership to dapps."], 0),
                    ("What contract acts as the universal singleton orchestrator for all ERC-4337 UserOperations?",
                     ["The EntryPoint contract (e.g. 0x0000000071727De22E5E9d8BAf0edAc6f37da032).",
                      "The UniswapV2Factory contract.",
                      "The ERC-20 token wrapper.",
                      "The Hardhat local node."], 0)
                ]
            },
            {
                "title": "Full-Stack DApp Production Deployment & Multi-Chain Verification Challenge",
                "desc": "Hands-on Deployment Challenge: Compile your full-stack DApp smart contracts, deploy to Arbitrum/Base/OP Sepolia testnets, integrate frontend ABI & Wagmi provider configuration, and verify on-chain artifacts.",
                "keywords": ["fullstack", "deploy", "testnet", "verify"],
                "questions": [
                    ("What critical files must be synchronized between the smart contract repository and the frontend DApp during deployment?",
                     ["The deployed contract addresses for each target network and the compiled ABI JSON artifacts.",
                      "The `.env` file containing deployer private keys.",
                      "The compiler source code of solc.",
                      "The local Hardhat cache directory."], 0),
                    ("What environment variable configuration is required for multi-chain testnet deployment scripts?",
                     ["Testnet RPC URLs, deployer private key (via secure secrets/keystore), and block explorer API verification keys.",
                      "Hardcoded plaintext passwords committed to git.",
                      "Root administrative system passwords.",
                      "Default localhost ports."], 0),
                    ("Why should frontend DApps deploy smart contracts to Layer-2 testnets (Arbitrum/Base/OP) in addition to Ethereum Sepolia?",
                     ["To deliver sub-second transaction latency, reduce user gas costs by 95%+, and provide scalable Superchain/Rollup interoperability.",
                      "Because Layer-2 networks do not support Solidity.",
                      "Because Ethereum testnets do not allow token transfers.",
                      "To avoid having to write frontend tests."], 0),
                    ("What verified artifact proves successful completion of the Full Stack Deployment Challenge?",
                     ["A live deployed contract address on an EVM testnet with verified source code and an interactive frontend interface.",
                      "A screenshot of a local terminal with no testnet broadcast.",
                      "An empty GitHub repository.",
                      "A mockup image in Figma."], 0),
                    ("Why do Web3 institutional grant reviewers value live full-stack testnet deployments over pure theory?",
                     ["It demonstrates proven execution capability, end-to-end technical competency, verified user UX, and real multi-chain ecosystem impact.",
                      "It guarantees immediate mainnet token listings.",
                      "It replaces the need for open-source code licenses.",
                      "It prevents future code modifications."], 0)
                ]
            }
        ]
    }
}

# Alias substrate to polkadot metadata
CHAIN_METADATA["substrate"] = CHAIN_METADATA["polkadot"]

def get_track_lessons(track_id: str) -> List[Lesson]:
    """Retrieve full curriculum for a track. Defaults to Ethereum/EVM fundamentals if track is unspecified."""
    t_id = track_id.lower().strip()
    if t_id in ("fundamentals", "ethereum"):
        return list(LESSONS_DB.values())
    if t_id not in CHAIN_METADATA:
        return list(LESSONS_DB.values())
    meta = CHAIN_METADATA[t_id]
    chain_name = meta["name"]
    modules_data = meta["modules"]
    
    lessons: List[Lesson] = []
    
    for idx, mod in enumerate(modules_data):
        mod_num = idx + 1
        lesson_id = f"{t_id}-{mod_num}"
        
        # Build 5-6 rich quiz questions with randomized/shuffled option positions
        quiz_raw: List[QuizQuestion] = []
        for q_text, q_opts, q_correct in mod["questions"]:
            quiz_raw.append(
                QuizQuestion(
                    question=q_text,
                    options=q_opts,
                    correct_idx=q_correct
                )
            )
        quiz_objs = _shuffle_quiz_questions(quiz_raw, f"{t_id}-{mod_num}")
            
        # Is this Module 5 (Deployment Challenge)?
        if mod_num == 5:
            exercise_obj = CodingExercise(
                instruction=f"Complete the {chain_name} Testnet Deployment Challenge! Write a deployment configuration and verification snippet containing '{t_id}', 'deploy', 'testnet', and 'verify'.",
                template=f"// ─── {chain_name} Testnet Deployment & Verification ───\n// Target: {meta['testnet']}\n// Network Explorer: {meta['explorer']}\n\n// Complete deployment declaration below:\n",
                required_keywords=[t_id, "deploy", "testnet", "verify"]
            )
        else:
            exercise_obj = CodingExercise(
                instruction=f"Write a {meta['lang']} code snippet for Module {mod_num}. The code must contain the keywords '{mod['keywords'][0]}' and '{mod['keywords'][1]}'.",
                template=f"// {chain_name} Module {mod_num}: {mod['title']}\n// Language: {meta['lang']}\n// Write implementation below:\n",
                required_keywords=mod['keywords']
            )
            
        lessons.append(
            Lesson(
                id=lesson_id,
                level_id=mod_num,
                title=f"Module {mod_num}: {mod['title']}",
                duration=f"{12 + mod_num * 3} mins",
                xp=100 + mod_num * 50,
                content=f"""# Module {mod_num}: {mod['title']}
### {chain_name} Ecosystem Track | Developer Academy

{mod['desc']}

---

### Core Learning Objectives:
1. **Architectural Deep-Dive**: Understand the execution engine, consensus constraints, and security assumptions of {chain_name}.
2. **Toolchain Proficiency**: Master {meta['framework']} for compiling, building, testing, and debugging.
3. **Smart Contract / Program Mastery**: Write idiomatic {meta['lang']} code on {meta['vm']} adhering to security best practices.
4. **On-Chain Deployment**: Broadcast real transactions to **{meta['testnet']}** and verify artifacts on **{meta['explorer']}**.

---

### Key Developer Resources:
- **Primary GitHub Repository**: [{meta['repo1']}]({meta['repo1']})
- **Ecosystem Starter Templates**: [{meta['repo2']}]({meta['repo2']})
- **Block Explorer & State Verifier**: **{meta['explorer']}**
- **Native Testnet Environment**: **{meta['testnet']}**

---

### AI Mentor Workspace:
Stuck on syntax, compiler errors, or testnet deployment? Switch to **OpenClaw** (Education Mentor) or **Hermes** (Engineering Compiler & Code Reviewer) in the AI panel above for instant assistance!
""",
                quiz=quiz_objs,
                exercise=exercise_obj
            )
        )
        
    return lessons

def get_courses_list(track: str = "fundamentals") -> List[Course]:
    """Compile courses list separating universal fundamentals/ethereum tracks from chain-specific tracks."""
    t_id = track.lower().strip()
    if t_id in ("fundamentals", "ethereum") or t_id not in CHAIN_METADATA:
        levels_meta = [
            {"id": 1, "title": "Blockchain Fundamentals & Web3 Core"},
            {"id": 2, "title": "Smart Contract Architecture"},
            {"id": 3, "title": "Token Standards & ERCs"},
            {"id": 4, "title": "Protocol Security & Auditing"},
            {"id": 5, "title": "EVM Testnet Deployment Challenge"},
            {"id": 6, "title": "MOR Finance Protocols & AI Agents"},
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
        chain_meta = CHAIN_METADATA[t_id]
        chain_name = chain_meta["name"]
        t_lessons = get_track_lessons(t_id)
        
        courses = []
        for idx, lesson in enumerate(t_lessons):
            lvl_id = idx + 1
            courses.append(
                Course(
                    level_id=lvl_id,
                    title=f"Level {lvl_id}: {lesson.title.replace(f'Module {lvl_id}: ', '')}",
                    total_lessons=1,
                    lessons=[lesson]
                )
            )
        return courses
