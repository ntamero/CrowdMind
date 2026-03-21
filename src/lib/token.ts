import { Contract, BrowserProvider, JsonRpcProvider, Wallet, formatUnits, parseUnits } from 'ethers';

// WSR Token Contract ABI — v1 (standard ERC-20)
// Deployed contract is basic ERC-20 with transfer + setDistributor
const WSR_ABI = [
  // Read
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  // Write
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  // Events
  'event Transfer(address indexed from, address indexed to, uint256 value)',
];

const WSR_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_WSR_CONTRACT || '';

// ═══════════ CLIENT-SIDE (Browser/MetaMask) ═══════════

export function getWSRContract(provider: BrowserProvider) {
  if (!WSR_CONTRACT_ADDRESS) return null;
  return new Contract(WSR_CONTRACT_ADDRESS, WSR_ABI, provider);
}

export async function getWSRBalance(provider: BrowserProvider, address: string): Promise<string> {
  const contract = getWSRContract(provider);
  if (!contract) return '0';
  try {
    const balance = await contract.balanceOf(address);
    return formatUnits(balance, 18);
  } catch {
    return '0';
  }
}

export async function getWSRInfo(provider: BrowserProvider) {
  const contract = getWSRContract(provider);
  if (!contract) return null;
  try {
    const [totalSupply] = await Promise.all([
      contract.totalSupply(),
    ]);
    return {
      name: 'Wisery',
      symbol: 'WSR',
      totalSupply: formatUnits(totalSupply, 18),
      contractAddress: WSR_CONTRACT_ADDRESS,
    };
  } catch {
    return null;
  }
}

// ═══════════ SERVER-SIDE (Backend distribution via transfer) ═══════════

const POLYGON_AMOY_RPC = process.env.POLYGON_RPC_URL || 'https://rpc-amoy.polygon.technology';
const DISTRIBUTOR_PRIVATE_KEY = process.env.WSR_DISTRIBUTOR_PRIVATE_KEY || '';

/**
 * Get server-side signer wallet for token transfers.
 * The deployer wallet holds all tokens and transfers directly to users.
 */
function getServerSigner() {
  if (!DISTRIBUTOR_PRIVATE_KEY) return null;
  const provider = new JsonRpcProvider(POLYGON_AMOY_RPC);
  return new Wallet(DISTRIBUTOR_PRIVATE_KEY, provider);
}

function getServerWSRContract() {
  if (!WSR_CONTRACT_ADDRESS) return null;
  const signer = getServerSigner();
  if (!signer) return null;
  return new Contract(WSR_CONTRACT_ADDRESS, WSR_ABI, signer);
}

/**
 * Distribute WSR to a user via standard ERC-20 transfer().
 * All tokens are held by the deployer wallet — we transfer directly.
 */
export async function distributeWSR(
  toAddress: string,
  amount: number,
  reason: string
): Promise<{ txHash: string } | { error: string }> {
  const contract = getServerWSRContract();
  if (!contract) {
    return { error: 'Distribution not configured (missing contract address or private key)' };
  }

  try {
    const amountWei = parseUnits(amount.toString(), 18);

    // Check deployer balance first
    const signer = getServerSigner()!;
    const balance = await contract.balanceOf(signer.address);
    if (balance < amountWei) {
      return { error: `Insufficient WSR balance. Have: ${formatUnits(balance, 18)}, Need: ${amount}` };
    }

    console.log(`[WSR] Distributing ${amount} WSR to ${toAddress} — ${reason}`);
    const tx = await contract.transfer(toAddress, amountWei);
    const receipt = await tx.wait();
    console.log(`[WSR] Success! TX: ${receipt.hash}`);
    return { txHash: receipt.hash };
  } catch (err: any) {
    console.error('[WSR] Distribution failed:', err.message);
    if (err.message?.includes('insufficient funds')) {
      return { error: 'Insufficient POL for gas fees.' };
    }
    return { error: `Transfer failed: ${err.message?.slice(0, 150)}` };
  }
}

/**
 * Batch distribute WSR to multiple users via individual transfers.
 * v1 contract doesn't have batch function, so we loop.
 */
export async function batchDistributeWSR(
  recipients: string[],
  amounts: number[],
  reason: string
): Promise<{ txHash: string; results: { address: string; amount: number; txHash?: string; error?: string }[] } | { error: string }> {
  const contract = getServerWSRContract();
  if (!contract) {
    return { error: 'Distribution not configured' };
  }

  const results: { address: string; amount: number; txHash?: string; error?: string }[] = [];
  let lastTxHash = '';

  for (let i = 0; i < recipients.length; i++) {
    const result = await distributeWSR(recipients[i], amounts[i], reason);
    if ('txHash' in result) {
      lastTxHash = result.txHash;
      results.push({ address: recipients[i], amount: amounts[i], txHash: result.txHash });
    } else {
      results.push({ address: recipients[i], amount: amounts[i], error: result.error });
    }
  }

  return { txHash: lastTxHash || 'batch', results };
}

/**
 * Check deployer's WSR balance (acts as "reward pool").
 */
export async function getRewardPoolBalance(): Promise<string> {
  if (!WSR_CONTRACT_ADDRESS) return '0';
  try {
    const provider = new JsonRpcProvider(POLYGON_AMOY_RPC);
    const contract = new Contract(WSR_CONTRACT_ADDRESS, WSR_ABI, provider);

    // Reward pool = deployer wallet balance (all tokens are there)
    if (DISTRIBUTOR_PRIVATE_KEY) {
      const wallet = new Wallet(DISTRIBUTOR_PRIVATE_KEY, provider);
      const balance = await contract.balanceOf(wallet.address);
      return formatUnits(balance, 18);
    }

    // Fallback: total supply as estimate
    const supply = await contract.totalSupply();
    return formatUnits(supply, 18);
  } catch {
    return '0';
  }
}

/**
 * Get deployer wallet's POL balance (for gas).
 */
export async function getGasBalance(): Promise<string> {
  try {
    const signer = getServerSigner();
    if (!signer) return '0';
    const balance = await signer.provider!.getBalance(signer.address);
    return formatUnits(balance, 18);
  } catch {
    return '0';
  }
}
