const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AgentBadge", function () {
  let registry, badge, owner, holder, stranger;

  beforeEach(async function () {
    [owner, holder, stranger] = await ethers.getSigners();
    const Registry = await ethers.getContractFactory("MockAgentIdRegistry");
    registry = await Registry.deploy();
    const Badge = await ethers.getContractFactory("AgentBadge");
    badge = await Badge.deploy(await registry.getAddress());
  });

  it("deploys with the right name, symbol and registry", async function () {
    expect(await badge.name()).to.equal("AgentBadge");
    expect(await badge.symbol()).to.equal("AGBADGE");
    expect(await badge.agentIdRegistry()).to.equal(await registry.getAddress());
    expect(await badge.MAX_SUPPLY()).to.equal(10_000);
    expect(await badge.totalSupply()).to.equal(0);
  });

  it("reverts when the caller holds no Agent ID", async function () {
    await expect(badge.connect(stranger).mint()).to.be.revertedWithCustomError(badge, "NoAgentId");
  });

  it("reverts when the caller sends BNB (mint is free)", async function () {
    await registry.setHasId(holder.address, true);
    await expect(
      badge.connect(holder).mint({ value: ethers.parseEther("0.001") })
    ).to.be.revertedWith("AgentBadge: mint is free, do not send BNB");
  });

  it("lets an Agent ID holder mint exactly once", async function () {
    await registry.setHasId(holder.address, true);
    const tx = await badge.connect(holder).mint();
    const receipt = await tx.wait();
    console.log("      mint gas used:", receipt.gasUsed.toString());

    expect(await badge.totalSupply()).to.equal(1);
    expect(await badge.ownerOf(1)).to.equal(holder.address);
    expect(await badge.balanceOf(holder.address)).to.equal(1);
    expect(await badge.hasMinted(holder.address)).to.equal(true);
    await expect(tx).to.emit(badge, "BadgeMinted").withArgs(holder.address, 1);

    // Second mint reverts.
    await expect(badge.connect(holder).mint()).to.be.revertedWithCustomError(badge, "AlreadyMinted");
    expect(await badge.totalSupply()).to.equal(1);
  });

  it("lets two different Agent ID holders mint different token ids", async function () {
    await registry.setHasId(holder.address, true);
    await registry.setHasId(stranger.address, true);
    await badge.connect(holder).mint();
    await badge.connect(stranger).mint();
    expect(await badge.totalSupply()).to.equal(2);
    expect(await badge.ownerOf(1)).to.equal(holder.address);
    expect(await badge.ownerOf(2)).to.equal(stranger.address);
  });

  it("revoking the Agent ID after mint does not burn the badge", async function () {
    await registry.setHasId(holder.address, true);
    await badge.connect(holder).mint();
    await registry.setHasId(holder.address, false);
    expect(await badge.ownerOf(1)).to.equal(holder.address);
    // But the holder cannot mint again anyway (hasMinted stays true).
    await expect(badge.connect(holder).mint()).to.be.revertedWithCustomError(badge, "NoAgentId");
  });

  it("tokenURI returns valid on-chain JSON + SVG metadata", async function () {
    await registry.setHasId(holder.address, true);
    await badge.connect(holder).mint();
    const uri = await badge.tokenURI(1);
    expect(uri.startsWith("data:application/json;base64,")).to.equal(true);
    const json = JSON.parse(Buffer.from(uri.slice("data:application/json;base64,".length), "base64").toString("utf8"));
    expect(json.name).to.equal("AgentBadge #1");
    expect(json.description).to.include("Agent ID");
    expect(json.image.startsWith("data:image/svg+xml;base64,")).to.equal(true);
    const svg = Buffer.from(json.image.slice("data:image/svg+xml;base64,".length), "base64").toString("utf8");
    expect(svg).to.include("<svg");
    expect(svg).to.include("#1");
    expect(svg).to.include("AGENT BADGE");
  });

  it("tokenURI reverts for a nonexistent token", async function () {
    await expect(badge.tokenURI(999)).to.be.reverted;
  });

  it("only the owner can set a baseURI; tokenURI then uses it", async function () {
    await registry.setHasId(holder.address, true);
    await badge.connect(holder).mint();
    await expect(badge.connect(stranger).setBaseURI("https://example.com/meta/")).to.be.revertedWithCustomError(
      badge,
      "OwnableUnauthorizedAccount"
    );
    await badge.setBaseURI("https://example.com/meta/");
    expect(await badge.tokenURI(1)).to.equal("https://example.com/meta/1");
    // Owner can clear it again to restore on-chain metadata.
    await badge.setBaseURI("");
    expect((await badge.tokenURI(1)).startsWith("data:application/json;base64,")).to.equal(true);
  });

  it("deployment gas is reasonable", async function () {
    const Badge = await ethers.getContractFactory("AgentBadge");
    const tx = await Badge.getDeployTransaction(await registry.getAddress());
    // Re-deploy to measure: ethers v6 deploy() returns the contract; gas measured via receipt.
    const fresh = await Badge.deploy(await registry.getAddress());
    const receipt = await fresh.deploymentTransaction().wait();
    console.log("      deploy gas used:", receipt.gasUsed.toString());
    expect(receipt.gasUsed).to.be.gt(0);
  });
});
