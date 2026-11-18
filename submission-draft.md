# AgentBadge — hackathon project submission draft

Draft answers for the Agent ID Hackathon project submission form (the form is in
Chinese; answers below are in English). **DO NOT SUBMIT YET** — items marked TODO
need the deployment first.

## Form fields

### 1. 项目名称 (Project name)

```
AgentBadge
```

### 2. 项目简介 (Project description — 1–3 sentences)

```
AgentBadge is a free-mint badge NFT for Binance Agent ID holders: any wallet holding
an Agent ID can mint exactly one badge, gas only, with ownership checked on-chain
against the Agent ID registry. It turns Agent ID into a real access-control credential
— proof of membership in the agent ecosystem — with no fees, no sign-up, and no server.
```

### 3. 项目合约地址 (Project contract address — BscScan link, source verified & open-source)

```
TODO — NOT DEPLOYED YET.
After deployment, paste the BscScan link, e.g.:
https://bscscan.com/address/0x...#code
(Source must show verified ✓ on BscScan before submitting.)
```

### 4. 项目官网 / 产品入口 (Project website / product entry)

```
TODO — NOT DEPLOYED YET.
After deployment, paste the live site URL, e.g.:
https://<user>.github.io/agentbadge/
```

### 5. 项目社交媒体链接 (X) (Project social media link — X)

```
TODO — ask the user for the project's X post/account link.
(Existing related post by @nimonana21 about AGENTONE is a different project and
must NOT be used here: https://x.com/nimonana21/status/2123016785767333893)
```

## Additional materials the announcement asks for

- **Agent ID usage description:** `AgentBadge.mint()` calls `balanceOf(msg.sender)` on
  the Agent ID registry (`0x60B9262456dE011F7d15a54CdD8c48bAaa8B022F`) and reverts
  unless the caller holds an Agent ID. One badge per wallet, enforced by the
  `hasMinted` mapping. This is access control / identity — the badge is proof of
  Agent ID ownership.
- **Contract addresses:** AgentBadge (TODO) + Agent ID registry
  `0x60B9262456dE011F7d15a54CdD8c48bAaa8B022F` (existing, not ours).
- **Open-source repo:** TODO — create the public GitHub repo first (see README.md
  "Open-source" section), then paste its URL here.
- **Reward receiving address:** TODO — ask the user which wallet should receive any
  prize (do not assume; the Makefun payout wallet is a different program).

## Pre-submit checklist

- [ ] Contract deployed on BNB Chain (mainnet, chain 56)
- [ ] Source verified on BscScan (green ✓) and repo public on GitHub
- [ ] Frontend live at the submitted URL, mint works with a real Agent ID wallet
- [ ] ≥30 Agent ID addresses have minted (Innovation Award eligibility) — needs
      promotion during the submission period; not achievable by the deploy alone
- [ ] All TODOs above filled in
- [ ] Submitted before 2026-12-09 08:00 UTC
