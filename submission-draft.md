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
https://bscscan.com/address/0xa38AB0b176b03B9520dBeE096094D99e4D018FB5#code
Contract: AgentBadge (0xa38AB0b176b03B9520dBeE096094D99e4D018FB5), BNB Chain mainnet.
Live on-chain: name AgentBadge, symbol AGBADGE, totalSupply 3 (verified 2026-11-18),
registry 0x60B9262456dE011F7d15a54CdD8c48bAaa8B022F.
⚠️ Source verification on BscScan is NOT DONE YET — it needs the BscScan web form
(single-file flattened source, solc 0.8.24, optimizer on, runs 200, constructor arg
0x00000000000000000000000060b9262456de011f7d15a54cdd8c48baaa8b022f).
Do NOT submit the form until the BscScan page shows "Contract Source Code Verified" ✓.
Open-source repo: https://github.com/nimonandang15/agentbadge (public).
```

### 4. 项目官网 / 产品入口 (Project website / product entry)

```
https://nimonandang15.github.io/agentbadge/
(Live, HTTP 200, renders with no JS errors; contract address wired in.)
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
- **Contract addresses:** AgentBadge
  `0xa38AB0b176b03B9520dBeE096094D99e4D018FB5` + Agent ID registry
  `0x60B9262456dE011F7d15a54CdD8c48bAaa8B022F` (existing, not ours).
- **Open-source repo:** https://github.com/nimonandang15/agentbadge (public).
- **Reward receiving address:** TODO — ask the user which wallet should receive any
  prize (do not assume; the Makefun payout wallet is a different program).

## Pre-submit checklist

- [x] Contract deployed on BNB Chain (mainnet, chain 56) —
  `0xa38AB0b176b03B9520dBeE096094D99e4D018FB5`, totalSupply 3
- [ ] Source verified on BscScan (green ✓) and repo public on GitHub
- [x] Frontend live at the submitted URL (HTTP 200, renders with no JS errors)
- [ ] Live mint tested end-to-end with a real Agent ID wallet (not tested — no wallet
  in this environment; needs a user with an Agent ID to try it)
- [ ] ≥30 Agent ID addresses have minted (Innovation Award eligibility) — needs
      promotion during the submission period; not achievable by the deploy alone
- [ ] All TODOs above filled in
- [ ] Submitted before 2026-12-09 08:00 UTC
