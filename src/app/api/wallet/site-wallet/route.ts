import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Wallet, JsonRpcProvider, Contract, formatUnits, parseUnits } from 'ethers';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ENCRYPTION_KEY = (process.env.JWT_SECRET || 'default_key_32chars_placeholder!').slice(0, 32).padEnd(32, '0');
const WSR_CONTRACT = process.env.NEXT_PUBLIC_WSR_CONTRACT || '';
const RPC_URL = process.env.POLYGON_RPC_URL || 'https://rpc-amoy.polygon.technology';

function encrypt(text: string): string {
  const iv = randomBytes(16);
  const cipher = createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(text: string): string {
  const [ivHex, encrypted] = text.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// GET: Get or create site wallet for current user
export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: {
        id: true,
        siteWalletAddress: true,
        siteWalletKey: true,
        walletAddress: true,
        unclaimedWSR: true,
        totalClaimedWSR: true,
        xp: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let siteWalletAddress = user.siteWalletAddress;

    // Auto-generate site wallet if not exists
    if (!siteWalletAddress) {
      const newWallet = Wallet.createRandom();
      const encryptedKey = encrypt(newWallet.privateKey);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          siteWalletAddress: newWallet.address,
          siteWalletKey: encryptedKey,
        },
      });

      siteWalletAddress = newWallet.address;
    }

    // Get on-chain WSR balance of site wallet
    let siteWalletWSR = '0';
    if (siteWalletAddress && WSR_CONTRACT) {
      try {
        const provider = new JsonRpcProvider(RPC_URL);
        const contract = new Contract(WSR_CONTRACT, ['function balanceOf(address) view returns (uint256)'], provider);
        const bal = await contract.balanceOf(siteWalletAddress);
        siteWalletWSR = formatUnits(bal, 18);
      } catch {}
    }

    return NextResponse.json({
      siteWalletAddress,
      siteWalletWSR,
      metamaskAddress: user.walletAddress,
      unclaimedWSR: user.unclaimedWSR || 0,
      totalClaimedWSR: user.totalClaimedWSR || 0,
      xp: user.xp || 0,
    });
  } catch (error: any) {
    console.error('Site wallet error:', error);
    return NextResponse.json({ error: 'Failed to get site wallet' }, { status: 500 });
  }
}

// POST: Import on-chain WSR from site wallet into unclaimedWSR balance
export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: {
        id: true,
        siteWalletAddress: true,
        siteWalletKey: true,
        unclaimedWSR: true,
      },
    });

    if (!user || !user.siteWalletAddress || !user.siteWalletKey) {
      return NextResponse.json({ error: 'Site wallet not found' }, { status: 400 });
    }

    if (!WSR_CONTRACT) {
      return NextResponse.json({ error: 'WSR contract not configured' }, { status: 503 });
    }

    // Check on-chain balance of site wallet
    const provider = new JsonRpcProvider(RPC_URL);
    const contract = new Contract(WSR_CONTRACT, [
      'function balanceOf(address) view returns (uint256)',
      'function transfer(address to, uint256 amount) returns (bool)',
    ], provider);

    const onChainBal = await contract.balanceOf(user.siteWalletAddress);
    const onChainWSR = Number(formatUnits(onChainBal, 18));

    if (onChainWSR <= 0) {
      return NextResponse.json({ error: 'No WSR found in your site wallet' }, { status: 400 });
    }

    // Transfer WSR from site wallet to pool wallet (consolidate funds)
    const POOL_WALLET = '0xDB44F5cFEB7D04afC516BDF99C3721f39f4cF119';
    const siteWalletPrivateKey = decrypt(user.siteWalletKey);
    const siteWalletSigner = new Wallet(siteWalletPrivateKey, provider);

    // Check if site wallet has gas for the transfer
    const gasBalance = await provider.getBalance(user.siteWalletAddress);
    if (gasBalance === BigInt(0)) {
      // Send a tiny bit of POL from deployer to site wallet for gas
      const deployerKey = process.env.WSR_DISTRIBUTOR_PRIVATE_KEY;
      if (deployerKey) {
        const deployer = new Wallet(deployerKey, provider);
        const gasTx = await deployer.sendTransaction({
          to: user.siteWalletAddress,
          value: parseUnits('0.01', 18), // 0.01 POL for gas
        });
        await gasTx.wait();
      } else {
        return NextResponse.json({ error: 'Site wallet has no gas. Contact admin.' }, { status: 503 });
      }
    }

    // Transfer all WSR from site wallet to pool wallet
    const wsrWithSigner = new Contract(WSR_CONTRACT, [
      'function transfer(address to, uint256 amount) returns (bool)',
    ], siteWalletSigner);

    const tx = await wsrWithSigner.transfer(POOL_WALLET, onChainBal);
    const receipt = await tx.wait();

    if (!receipt || receipt.status !== 1) {
      return NextResponse.json({ error: 'On-chain transfer failed' }, { status: 500 });
    }

    // Credit unclaimedWSR in DB
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { unclaimedWSR: { increment: onChainWSR } },
      }),
      prisma.tokenTransaction.create({
        data: {
          userId: user.id,
          type: 'onchain_deposit',
          amount: onChainWSR,
          txHash: receipt.hash,
          description: `Imported ${onChainWSR} WSR from site wallet`,
          status: 'completed',
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      amount: onChainWSR,
      txHash: receipt.hash,
      newUnclaimedWSR: (user.unclaimedWSR || 0) + onChainWSR,
      message: `${onChainWSR.toLocaleString()} WSR imported to your account!`,
    });
  } catch (error: any) {
    console.error('Site wallet import error:', error);
    return NextResponse.json({ error: 'Import failed: ' + (error.message || 'Unknown error') }, { status: 500 });
  }
}
