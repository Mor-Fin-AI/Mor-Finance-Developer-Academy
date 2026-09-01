# Web3 Grant Reviewer Security Checklist

This document acts as an explicit internal auditing standard for the `morfinance.ai` core engineering team. Grant committees at Solana, Gitcoin, Starknet, Aptos, and Polygon prioritize protocol security above all else. Use this guide to audit your repositories before submitting your grant applications.

---

## 🛡️ 1. Smart Contract Vulnerability Protections

### EVM / Polygon (Solidity)
- [ ] **Reentrancy Guards:** Every state-changing external asset transfer utilizes `ReentrancyGuard` modifiers from OpenZeppelin.
- [ ] **Safe Transfers:** All native or token transfers rely on `safeTransfer` / `safeTransferFrom` variants instead of basic `.transfer()`.
- [ ] **Overflow / Underflow:** Compiled exclusively with Solidity `0.8.x` or higher to inherit built-in compiler overflow checks.
- [ ] **Access Control Rules:** Critical admin operations (`withdraw`, `setCompilerConfig`) are strictly locked behind `Ownable2Step` or `AccessControl`.

### Solana (Rust / Anchor)
- [ ] **Account Ownership Checks:** All incoming accounts explicitly declare constraint syntax (`#[account(mut)]` or `has_one`) to block malicious account injections.
- [ ] **Signer Validation:** Crucial instructions verify account signers natively using Anchor's `signer` constraint.
- [ ] **Data Serialization:** Strictly avoids raw borsh deserialization errors by forcing type checks natively through anchor programmatic constraints.

### Starknet (Cairo) & Aptos (Move)
- [ ] **Storage Collisions:** Contract upgrade architectures utilize validated proxy hashes to circumvent colliding namespace storage layouts.
- [ ] **Resource Ownership (Move):** Resource capabilities are non-copiable and explicitly held by the designated account address to block infinite mint patterns.

---

## 🤖 2. AI & Off-Chain Runtime Infrastructure (Hermes & OpenClaw)

- [ ] **Sandbox Isolation:** The OpenClaw compiler runs arbitrary user code inside completely isolated, resource-constrained Docker containers to isolate host execution loops.
- [ ] **Prompt Injection Controls:** System inputs fed to Hermes AI Mentors undergo strict preprocessing and sanitization to filter prompt exploitation efforts.
- [ ] **API Access Controls:** Multi-chain gateway routing relies on rate-limiting layers to defend backend LLM infrastructure against Denial-of-Service (DoS) vectors.
- [ ] **Secret Management Verification:** Zero API keys, environment configuration templates, or raw server secrets are tracked within GitHub commits (`.gitignore` confirmed).

---

## 📈 3. Testing, Coverage, & Automation Commitments

- [ ] **Test Coverage Minimums:** Publicly tracking code test coverage metrics, targeting a baseline threshold above 80%.
- [ ] **Fuzz Testing Implementations:** Core asset engines execute fuzz/invariant test parameters (via Foundry or Anchor invariant tools) to stress test edge cases.
- [ ] **CI/CD Security Static Analysis:** Integration pipelines run static analysis sweeps on every pull request:
  - **Solidity:** Slither or Mythril analysis
  - **Rust / Cairo:** Cargo clippy and cargo audit pipelines
- [ ] **Deterministic Test Environment:** Mock providers simulate real-world web3 RPC states, eliminating reliance on active public mainnet endpoint uptimes during testing.