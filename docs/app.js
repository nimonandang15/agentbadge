/* AgentBadge frontend — static, no build step, no server.
 * The user connects their own wallet (MetaMask / injected provider) and confirms
 * the mint transaction themselves. This page NEVER auto-signs, NEVER asks for
 * token approvals, and NEVER collects keys or seeds.
 */

// TODO (after deployment): paste the deployed AgentBadge contract address here.
const CONTRACT_ADDRESS = "0xa38AB0b176b03B9520dBeE096094D99e4D018FB5";

// Binance Agent ID registry on BNB Chain (SPACE ID Agent ID, ERC-721, non-transferable).
const AGENT_ID_REGISTRY = "0x60B9262456dE011F7d15a54CdD8c48bAaa8B022F";
const REGISTRY_ABI = ["function balanceOf(address owner) view returns (uint256)"];

const BSC_CHAIN_ID = 56;
const BSC_PARAMS = {
  chainId: "0x38",
  chainName: "BNB Smart Chain",
  nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
  rpcUrls: ["https://bsc-dataseed1.binance.org"],
  blockExplorerUrls: ["https://bscscan.com"],
};

const $ = (id) => document.getElementById(id);
let provider = null;
let signer = null;
let badge = null;
let account = null;

function setStatus(html) { $("status").innerHTML = html; }
function short(addr) { return addr ? addr.slice(0, 6) + "…" + addr.slice(-4) : "—"; }

async function ensureBsc() {
  const net = await provider.getNetwork();
  if (Number(net.chainId) === BSC_CHAIN_ID) return true;
  try {
    await window.ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: BSC_PARAMS.chainId }] });
    return true;
  } catch (e) {
    if (e.code === 4902) {
      await window.ethereum.request({ method: "wallet_addEthereumChain", params: [BSC_PARAMS] });
      return true;
    }
    throw e;
  }
}

async function refresh() {
  const registry = new ethers.Contract(AGENT_ID_REGISTRY, REGISTRY_ABI, provider);
  const holds = await registry.balanceOf(account);
  const hasId = holds > 0n;
  $("agentId").innerHTML = hasId
    ? '<span class="ok">Yes ✓</span>'
    : '<span class="bad">No — this wallet holds no Agent ID</span>';

  if (badge) {
    const minted = await badge.hasMinted(account);
    const supply = await badge.totalSupply();
    $("minted").innerHTML = minted ? '<span class="ok">Yes ✓</span>' : "Not yet";
    $("supply").textContent = supply.toString();
    $("mintBtn").disabled = !(hasId && !minted);
    $("mintBtn").textContent = !hasId
      ? "Need an Agent ID to mint"
      : minted ? "Badge already minted ✓" : "Mint my free badge";
    if (minted) {
      const nextId = await badge.nextTokenId();
      const tokenId = nextId - 1n; // the last minted id is this wallet's (1 badge per wallet)
      try {
        const uri = await badge.tokenURI(tokenId);
        const json = JSON.parse(atob(uri.split(",")[1]));
        $("badgeImg").src = json.image;
        $("badgeImg").style.display = "block";
      } catch (e) { /* metadata display is best-effort */ }
    }
  } else {
    $("minted").textContent = "—";
    $("supply").textContent = "—";
    $("mintBtn").disabled = true;
    $("mintBtn").textContent = "Contract not deployed yet";
  }
}

$("connectBtn").addEventListener("click", async () => {
  try {
    if (!window.ethereum) { setStatus("No wallet found. Install MetaMask or open this page in a wallet browser."); return; }
    if (typeof ethers === "undefined") { setStatus("ethers.js failed to load (offline?). Check your connection and reload."); return; }
    provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = await provider.getSigner();
    account = await signer.getAddress();
    $("wallet").textContent = short(account);
    await ensureBsc();
    const net = await provider.getNetwork();
    $("network").textContent = Number(net.chainId) === BSC_CHAIN_ID ? "BNB Smart Chain" : "Chain " + net.chainId + " (switch to BSC)";
    $("connectBtn").textContent = "Connected ✓";
    $("connectBtn").disabled = true;
    if (CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000") {
      badge = new ethers.Contract(CONTRACT_ADDRESS, window.AGENT_BADGE_ABI, signer);
    }
    await refresh();
    setStatus("");
  } catch (e) {
    setStatus("Connection failed: " + (e?.message || e));
  }
});

$("mintBtn").addEventListener("click", async () => {
  try {
    setStatus("Waiting for you to confirm the mint in your wallet…");
    const tx = await badge.mint(); // user confirms in their wallet; value is 0 (free apart from gas)
    setStatus("Mint sent: <a target=\"_blank\" href=\"https://bscscan.com/tx/" + tx.hash + "\">" + tx.hash + "</a> — waiting for confirmation…");
    await tx.wait();
    setStatus("Badge minted! 🎉 Tx: <a target=\"_blank\" href=\"https://bscscan.com/tx/" + tx.hash + "\">" + tx.hash + "</a>");
    await refresh();
  } catch (e) {
    setStatus("Mint failed or rejected: " + (e?.reason || e?.message || e));
  }
});

if (window.ethereum) {
  window.ethereum.on("accountsChanged", () => window.location.reload());
  window.ethereum.on("chainChanged", () => window.location.reload());
}

if (CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
  $("deployNotice").style.display = "block";
}
