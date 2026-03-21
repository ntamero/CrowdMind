import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Wallet, JsonRpcProvider, Contract, formatUnits } from 'ethers';
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
