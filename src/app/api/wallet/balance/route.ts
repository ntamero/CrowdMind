import { NextRequest, NextResponse } from 'next/server';
import { JsonRpcProvider, Contract, formatUnits } from 'ethers';

const WSR_CONTRACT = process.env.NEXT_PUBLIC_WSR_CONTRACT || '';
const RPC_URL = process.env.POLYGON_RPC_URL || 'https://rpc-amoy.polygon.technology';
const WSR_ABI = ['function balanceOf(address) view returns (uint256)'];

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get('address');
  if (!address || !WSR_CONTRACT) {
    return NextResponse.json({ wsrBalance: '0', polBalance: '0' });
  }

  try {
    const provider = new JsonRpcProvider(RPC_URL);
    const contract = new Contract(WSR_CONTRACT, WSR_ABI, provider);

    const [wsrBal, polBal] = await Promise.all([
      contract.balanceOf(address),
      provider.getBalance(address),
    ]);

    return NextResponse.json({
      wsrBalance: formatUnits(wsrBal, 18),
      polBalance: formatUnits(polBal, 18),
    });
  } catch (err: any) {
    console.error('[Balance API] Error:', err.message);
    return NextResponse.json({ wsrBalance: '0', polBalance: '0' });
  }
}
