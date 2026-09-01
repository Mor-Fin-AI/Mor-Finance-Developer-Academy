# MOR Developer Academy

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Built for Web3](https://img.shields.io/badge/Web3-Multichain-brightgreen.svg)](#-architecture--supported-ecosystems)

The underlying core infrastructure for [morfinance.ai](https://morfinance.ai/). MOR Developer Academy is an AI-powered, multi-chain development and compilation platform. It empowers developers to build, test, and deploy decentralized applications (dApps) across diverse blockchain ecosystems using integrated smart mentors (**Hermes AI**) and automated toolings (**OpenClaw**).

---

## 🏗️ Architecture & Supported Ecosystems

The platform relies on a modular layout connecting frontend interfaces, specialized AI execution loops, and ecosystem-agnostic compiler pipelines.

```
       +---------------------------------------------+
       |             morfinance.ai UI                |
       +---------------------------------------------+
                              |
               +--------------+--------------+
               |                             |
               v                             v
    +--------------------+        +--------------------+
    |  Hermes AI Mentor  |        |  OpenClaw Compiler |
    +--------------------+        +--------------------+
               |                             |
               +--------------+--------------+
                              |
                              v
    +-------------------------------------------------+
    |  Multi-Chain Deployment Engine                  |
    |  - Polygon (Solidity)   - Solana (Rust/Anchor)  |
    |  - Starknet (Cairo)     - Aptos (Move)          |
    +-------------------------------------------------+
```

### Tech Stack Breakdown
* **Frontend / Interface:** Next.js, TailwindCSS, RainbowKit, ethers.js / viem
* **AI Engine (Hermes):** Python, LangChain, vector embeddings tuned for smart contract auditing
* **Compilation Environment (OpenClaw):** Dockerized multi-compiler runtime supporting:
  * **Solidity:** Solc / Hardhat / Foundry (Polygon, Arbitrum)
  * **Rust / Anchor:** Solana CLI suite
  * **Cairo:** Scarb / Starknet-foundry (Starknet)
  * **Move:** Aptos CLI (Aptos)

---

## ⚡ Getting Started (Local Setup)

### Prerequisites
Ensure your local development environment has the following prerequisites configured:
* **Node.js**: v18.x or higher
* **Docker**: Required for sandbox compilation runtime (OpenClaw)
* **Rust / Cargo**: Required for local Solana/Starknet workspace tests

### Installation Steps

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/morfinance/mor-academy-core.git
   cd mor-academy-core
   ```

2. **Configure Environment Variables:**
   Duplicate the example environment file and update your variables:
   ```bash
   cp .env.example .env
   ```
   *Ensure you define your RPC endpoints (`POLYGON_RPC_URL`, `SOLANA_RPC_URL`) and your AI Gateway API keys.*

3. **Install Dependencies:**
   ```bash
   npm install
   ```

4. **Spin Up OpenClaw Docker Sandbox:**
   ```bash
   docker-compose up -d openclaw-compiler
   ```

5. **Launch the Local Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) inside your browser to view the application.

---

## 🧪 Testing Suites & Validation

Ecosystem reviewers require explicit execution test suites. Run tests natively based on the module you are modifying:

### Smart Contract Integration Tests
* **EVM / Polygon (Foundry):**
  ```bash
  forge test
  ```
* **Solana (Anchor):**
  ```bash
  cd anchor/ && anchor test
  ```
* **Starknet (Starknet-Foundry):**
  ```bash
  cd cairo/ && snforge test
  ```

### AI Framework Tests
* Run unit checks on Hermes vector index logic:
  ```bash
  npm run test:ai
  ```

---

## 🗺️ Roadmap & Grant Milestones

* **Milestone 1 (Q3 2026) - Multi-Chain Framework Foundations [Current]**
  * Core UI release for `morfinance.ai`.
  * Integration of Dockerized compilation tools via OpenClaw for EVM chains.
* **Milestone 2 (Q4 2026) - AI Integrations & Non-EVM Support**
  * Full integration of Hermes AI Mentor vector pipelines.
  * Native Anchor (Solana) and Move (Aptos) execution support inside compilers.
* **Milestone 3 (Q1 2027) - Mainnet Verification Loops**
  * Automated block explorer verification across all target chains.
  * Public release of Developer Incentive Registry.

---

## 📄 License

Distributed under the Apache License 2.0. See `LICENSE` for more information.