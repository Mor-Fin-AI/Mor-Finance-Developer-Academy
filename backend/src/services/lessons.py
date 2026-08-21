"""
Curriculum and Lessons Database for the Developer Academy.
Contains rich educational Markdown text, multi-choice quizzes (25–30 questions per chain),
and hands-on smart contract deployment challenges.
"""
from typing import Dict, List, Any, Optional
from src.models.lesson import QuizQuestion, CodingExercise, Lesson, Course

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

# ─── MULTI-CHAIN TRACK CURRICULUM GENERATOR ────────────────────────────────────
# Generates 5 Comprehensive Modules with 25–30 Quiz Questions + 1 Deployment Challenge per Chain

CHAIN_METADATA: Dict[str, Dict[str, Any]] = {
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
    }
}

# Alias substrate to polkadot metadata
CHAIN_METADATA["substrate"] = CHAIN_METADATA["polkadot"]

def get_track_lessons(track_id: str) -> List[Lesson]:
    """Retrieve full 5-module curriculum with 25–30 quiz questions & deployment challenge for a track."""
    t_id = track_id.lower().strip()
    meta = CHAIN_METADATA.get(t_id, CHAIN_METADATA["aptos"])
    chain_name = meta["name"]
    modules_data = meta["modules"]
    
    lessons: List[Lesson] = []
    
    for idx, mod in enumerate(modules_data):
        mod_num = idx + 1
        lesson_id = f"{t_id}-{mod_num}"
        
        # Build 5-6 rich quiz questions
        quiz_objs: List[QuizQuestion] = []
        for q_text, q_opts, q_correct in mod["questions"]:
            quiz_objs.append(
                QuizQuestion(
                    question=q_text,
                    options=q_opts,
                    correct_idx=q_correct
                )
            )
            
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
    """Compile courses list separating universal fundamentals track from chain-specific tracks."""
    t_id = track.lower().strip()
    if t_id == "fundamentals":
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
        chain_meta = CHAIN_METADATA.get(t_id, CHAIN_METADATA["aptos"])
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
