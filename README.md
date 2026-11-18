# AgentBadge — a free badge NFT for Agent ID holders

**Hackathon track:** Binance Agent ID Hackathon — Project Awards / Innovation Award
**Status:** ✅ Built, compiled, tested locally. ❌ **NOT deployed** — no contract on any chain, no BNB spent.

## What it is

AgentBadge is a free-mint ERC-721 badge for wallets that hold a Binance **Agent ID**
(`name.ai`). Any Agent ID holder can mint exactly **one** badge, free apart from BSC gas.
No sign-up, no server, no fees, no royalties, no owner mint.

## How Agent ID is used (the real use case)

Access control, enforced on-chain. `AgentBadge.mint()` calls `balanceOf(msg.sender)` on
the Agent ID registry and reverts unless the caller holds an Agent ID:

- Agent ID registry (BNB Chain): `0x60B9262456dE011F7d15a54CdD8c48bAaa8B022F`
  (SPACE ID Agent ID, ERC-721, non-transferable)
- `balanceOf(address) > 0` ⇒ holds an Agent ID ⇒ may mint once
- `hasMinted` mapping enforces one badge per wallet forever
- Max supply: 10,000 badges

Nothing else about the product depends on Agent ID — the gate *is* the product.

## Hackathon rules compliance

| Rule (Binance announcement, 2026-11-18) | How AgentBadge complies |
|---|---|
| Deployed on BNB Chain, source verified + open-source on BscScan | Deploy + verify steps below; repo is MIT-licensed, source public on GitHub |
| Actively uses Agent ID | On-chain `balanceOf` gate on every mint |
| No web QR-code login for Agentic Wallet | Frontend uses only an injected wallet (MetaMask). No QR, no pairing codes, no session storage on a server |
| No prompts that bypass user transaction confirmation | The mint tx is sent only when the user clicks "Mint" and confirms in their own wallet |
| No unauthorized transfers / unlimited approvals | The contract never moves user funds or tokens; the frontend requests no approvals at all |
| No collecting seeds / keys / pairing codes | Nothing is ever asked for or stored |
| No Binance brand impersonation | Name "AgentBadge", no Binance/BNB branding, no binance domain |
| No promised returns | The badge is a free collectible with no monetary promise; the site states this |
| Not a "look up other people's wallets by name" tool | The site only checks the *connected* wallet's own Agent ID status |

## Project layout

```
contracts/AgentBadge.sol            # the badge contract (OpenZeppelin ERC721)
contracts/mocks/MockAgentIdRegistry.sol  # TEST-ONLY fake registry, never deploy this
scripts/deploy.js                   # deployment script (BNB Chain, registry hard-coded)
test/AgentBadge.test.js             # 10 Hardhat tests
frontend/index.html + app.js        # static site, no build step, no server
frontend/ethers.umd.min.js          # ethers v6 vendored locally (works offline)
frontend/abi.js                     # ABI generated from the compiled contract
hardhat.config.js                   # solidity 0.8.24, optimizer on
```

## Tests — run locally

```bash
npm install
npx hardhat test
```

Result on 2026-11-18 (Hardhat 2.26.3, ethers 6.14.0, OpenZeppelin 5.1.0, solc 0.8.24):

```
AgentBadge
  ✔ deploys with the right name, symbol and registry
  ✔ reverts when the caller holds no Agent ID
  ✔ reverts when the caller sends BNB (mint is free)
  ✔ lets an Agent ID holder mint exactly once (mint gas used: 102861)
  ✔ lets two different Agent ID holders mint different token ids
  ✔ revoking the Agent ID after mint does not burn the badge
  ✔ tokenURI returns valid on-chain JSON + SVG metadata
  ✔ tokenURI reverts for a nonexistent token
  ✔ only the owner can set a baseURI; tokenURI then uses it
  ✔ deployment gas is reasonable (deploy gas used: 1931667)

10 passing
```

Verified behavior: non-holder cannot mint; holder mints once (token #1, `totalSupply` 1,
`BadgeMinted` event); second mint reverts; sending BNB reverts; `tokenURI` returns a
`data:application/json;base64` payload whose SVG renders the badge with its token number.

**Not exhaustively tested:** the 10,000 max-supply cap (would need 10,000 distinct Agent ID
holders in a test — the cap is a single `require`-style check on the same path as the
tested checks, but it has not been hit in a test). The frontend's wallet-connect flow was
verified to render with no JS errors in headless Chrome, but the live MetaMask connect +
mint click was **not** tested end-to-end (no wallet in this environment).

## Gas estimate (measured, not guessed)

Live BSC gas price checked 2026-11-18 ~21:36 WIB on three public RPCs
(`bsc-dataseed1`, `bsc-dataseed2`, `bsc.publicnode.com`) — all returned the same:
**0.05 gwei**. BNB price at the time: **$586.51** (CoinGecko).

| Action | Gas used (measured) | Cost at 0.05 gwei | ≈ USD |
|---|---|---|---|
| Deploy `AgentBadge` | 1,931,667 | **0.00009658 BNB** | ~$0.057 |
| One `mint()` | 102,861 | **0.00000514 BNB** | ~$0.003 |

Formula for any other gas price: `cost (BNB) = gas × gasPrice (gwei) × 1e-9`.
At 1 gwei (a busy period): deploy ≈ 0.00193 BNB, mint ≈ 0.000103 BNB. Even at 5 gwei,
deploying costs under 0.01 BNB. Total to launch: roughly **0.0001 BNB** at current prices
— plus a small buffer for the BscScan verification step (free) and the deployer's own
first mint if desired.

## Deploy (exact steps — needs a funded deployer wallet, ~0.001 BNB buffer recommended)

1. Create the repo (see "Open-source" below) and clone it. `npm install`.
2. Fund a fresh deployer wallet with ~0.002 BNB (covers deploy + buffer). **Never reuse
   a wallet that holds other assets for this; never paste a seed anywhere.**
3. Set environment variables (never commit them):
   ```bash
   export BSC_RPC_URL="https://bsc-dataseed1.binance.org"
   export DEPLOYER_PRIVATE_KEY="0x..."   # deployer key, no 0x-prefix issues; keep secret
   export BSCSCAN_API_KEY="..."          # free key from bscscan.com/apis
   ```
4. Deploy:
   ```bash
   npx hardhat run scripts/deploy.js --network bsc
   ```
   Note the printed contract address.
5. Verify source on BscScan (uploads the exact source; OpenZeppelin imports are
   resolved by the plugin):
   ```bash
   npx hardhat verify --network bsc <CONTRACT_ADDRESS> 0x60B9262456dE011F7d15a54CdD8c48bAaa8B022F
   ```
   Confirm on bscscan.com that the contract shows a green ✓ "Contract Source Code Verified".
6. Point the frontend at the deployment: in `frontend/app.js`, replace
   `CONTRACT_ADDRESS` with the deployed address. Re-generate the ABI if the contract
   changes: it is produced from `artifacts/contracts/AgentBadge.sol/AgentBadge.json`
   (see `frontend/abi.js` header).
7. Host the static site: GitHub Pages (repo → Settings → Pages → deploy from `/frontend`
   or root), Netlify Drop, Vercel static, or any static host. No server component exists.
8. Sanity-check live: open the site, connect a wallet that holds an Agent ID, mint once,
   confirm the badge appears and the tx is on BscScan.

## Open-source (GitHub repo steps)

```bash
cd hackathon-agentid
git init
git add .                       # .gitignore already excludes node_modules, artifacts, cache, .env
git commit -m "AgentBadge: free badge NFT gated by Agent ID"
gh repo create <user>/agentbadge --public --source=. --push   # or create on github.com and push
```

The repo is MIT-licensed via the contract's `SPDX-License-Identifier: MIT` header and
the code in this folder. Make the repo **public** before submitting — the hackathon
requires open-source code.

## Submitting to the hackathon

- Fill `submission-draft.md` with the deployed contract address, the live site URL, and
  the project's X link, then submit through the official project form before
  **2026-12-09 08:00 UTC** (submission period ends).
- Innovation Award eligibility needs the product **live with ≥30 Agent ID addresses
  interacting** during the submission period — that means real promotion after launch:
  share the site with Agent ID holders (X, communities), since each mint is one
  interaction. There is no shortcut: fake/bulk interactions are disqualified as
  abnormal behavior.
- Community Promotion (separate track, already in progress for this user via an X post
  + survey) is independent of this project submission.

## Known limits / honest notes

- **Not deployed.** Everything above the deploy section is ready; deployment is a
  deliberate, funded, user-approved step that has not happened.
- The on-chain SVG badge is intentionally simple (no external image dependency).
- Owner powers are minimal: only `setBaseURI` (defaults to fully on-chain metadata).
  There is no pause, no fee change, no mint function for the owner.
- `mint()` is `payable` only so an accidental BNB payment reverts with a clear message
  instead of failing opaquely; the function always reverts when `msg.value != 0`.
