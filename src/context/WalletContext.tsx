'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { BrowserProvider, Contract, formatEther, formatUnits } from 'ethers';

const WSR_CONTRACT = process.env.NEXT_PUBLIC_WSR_CONTRACT || '';
const WSR_ABI = ['function balanceOf(address) view returns (uint256)'];

interface WalletState {
  address: string | null;
  chainId: number | null;
  chainName: string | null;
  balance: string | null;
  wsrBalance: string | null;
  isConnecting: boolean;
  isConnected: boolean;
  error: string | null;
}

interface WalletContextType extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => void;
  switchToPolygon: () => Promise<void>;
  refreshWsrBalance: () => Promise<void>;
}

const POLYGON_CHAIN_ID = 137;
const POLYGON_TESTNET_CHAIN_ID = 80002; // Amoy

const CHAIN_NAMES: Record<number, string> = {
  1: 'Ethereum',
  137: 'Polygon',
  80002: 'Polygon Amoy',
  43114: 'Avalanche',
  56: 'BSC',
  42161: 'Arbitrum',
};

const WalletContext = createContext<WalletContextType>({
  address: null,
  chainId: null,
  chainName: null,
  balance: null,
  wsrBalance: null,
  isConnecting: false,
  isConnected: false,
  error: null,
  connect: async () => {},
  disconnect: () => {},
  switchToPolygon: async () => {},
  refreshWsrBalance: async () => {},
});

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>({
    address: null,
    chainId: null,
    chainName: null,
    balance: null,
    wsrBalance: null,
    isConnecting: false,
    isConnected: false,
    error: null,
  });

  const getProvider = () => {
    if (typeof window === 'undefined') return null;
    const eth = (window as any).ethereum;
    if (!eth) return null;
    return new BrowserProvider(eth);
  };

  const updateBalance = useCallback(async (address: string) => {
    const provider = getProvider();
    if (!provider) return;
    try {
      const balance = await provider.getBalance(address);
      setState(prev => ({ ...prev, balance: formatEther(balance) }));
    } catch {}
    // Also fetch WSR balance
    if (WSR_CONTRACT && provider) {
      try {
        const contract = new Contract(WSR_CONTRACT, WSR_ABI, provider);
        const wsrBal = await contract.balanceOf(address);
        setState(prev => ({ ...prev, wsrBalance: formatUnits(wsrBal, 18) }));
      } catch {}
    }
  }, []);

  // Sign a verification message with MetaMask (SIWE)
  const signVerificationMessage = async (provider: BrowserProvider, address: string): Promise<{ message: string; signature: string }> => {
    const nonce = Math.random().toString(36).substring(2, 15);
    const timestamp = new Date().toISOString();
    const message = `Wisery Wallet Verification\n\nI confirm that I own this wallet address.\n\nAddress: ${address}\nNonce: ${nonce}\nTimestamp: ${timestamp}\n\nThis signature does not authorize any transactions.`;

    const signer = await provider.getSigner();
    const signature = await signer.signMessage(message);

    return { message, signature };
  };

  const connect = useCallback(async () => {
    // Check if user is authenticated first
    try {
      const authRes = await fetch('/api/auth/me');
      if (!authRes.ok) {
        setState(prev => ({ ...prev, error: 'Please sign in first before connecting wallet.' }));
        window.location.href = '/auth';
        return;
      }
      const authData = await authRes.json();
      if (!authData.user?.emailVerified) {
        setState(prev => ({ ...prev, error: 'Please verify your email before connecting wallet.' }));
        window.location.href = '/auth';
        return;
      }
    } catch {
      setState(prev => ({ ...prev, error: 'Please sign in first.' }));
      window.location.href = '/auth';
      return;
    }

    const eth = (window as any).ethereum;
    if (!eth) {
      setState(prev => ({ ...prev, error: 'MetaMask not found. Please install MetaMask.' }));
      return;
    }

    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      const provider = new BrowserProvider(eth);
      const accounts = await provider.send('eth_requestAccounts', []);
      const address = accounts[0];
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);
      const balance = await provider.getBalance(address);

      // Sign verification message (SIWE)
      const { message, signature } = await signVerificationMessage(provider, address);

      // Save wallet connection with signature to backend
      const connectRes = await fetch('/api/wallet/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          chain: CHAIN_NAMES[chainId] || 'unknown',
          signature,
          message,
        }),
      });

      if (!connectRes.ok) {
        const data = await connectRes.json();
        setState(prev => ({
          ...prev,
          isConnecting: false,
          error: data.error || 'Failed to verify wallet',
        }));
        return;
      }

      // Fetch WSR balance
      let wsrBal: string | null = null;
      if (WSR_CONTRACT) {
        try {
          const contract = new Contract(WSR_CONTRACT, WSR_ABI, provider);
          const bal = await contract.balanceOf(address);
          wsrBal = formatUnits(bal, 18);
        } catch {}
      }

      setState({
        address,
        chainId,
        chainName: CHAIN_NAMES[chainId] || `Chain ${chainId}`,
        balance: formatEther(balance),
        wsrBalance: wsrBal,
        isConnecting: false,
        isConnected: true,
        error: null,
      });
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: err.code === 4001 ? 'Connection rejected by user'
          : err.code === 'ACTION_REJECTED' ? 'Signature rejected by user'
          : 'Failed to connect wallet',
      }));
    }
  }, []);

  const disconnect = useCallback(() => {
    setState({
      address: null,
      chainId: null,
      chainName: null,
      balance: null,
      wsrBalance: null,
      isConnecting: false,
      isConnected: false,
      error: null,
    });
  }, []);

  const refreshWsrBalance = useCallback(async () => {
    if (!state.address) return;
    const provider = getProvider();
    if (!provider || !WSR_CONTRACT) return;
    try {
      const contract = new Contract(WSR_CONTRACT, WSR_ABI, provider);
      const bal = await contract.balanceOf(state.address);
      setState(prev => ({ ...prev, wsrBalance: formatUnits(bal, 18) }));
    } catch {}
  }, [state.address]);

  const switchToPolygon = useCallback(async () => {
    const eth = (window as any).ethereum;
    if (!eth) return;

    // Use Amoy testnet for now (switch to mainnet 0x89 for production)
    const targetChainId = '0x13882'; // 80002 = Polygon Amoy Testnet

    try {
      await eth.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: targetChainId }],
      });
    } catch (err: any) {
      // Chain not added, add it
      if (err.code === 4902) {
        await eth.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: targetChainId,
            chainName: 'Polygon Amoy Testnet',
            nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 },
            rpcUrls: ['https://rpc-amoy.polygon.technology'],
            blockExplorerUrls: ['https://amoy.polygonscan.com'],
          }],
        });
      }
    }
  }, []);

  // Listen for account/chain changes
  useEffect(() => {
    const eth = (window as any)?.ethereum;
    if (!eth) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else if (state.isConnected) {
        setState(prev => ({ ...prev, address: accounts[0] }));
        updateBalance(accounts[0]);
      }
    };

    const handleChainChanged = (chainIdHex: string) => {
      const chainId = parseInt(chainIdHex, 16);
      setState(prev => ({
        ...prev,
        chainId,
        chainName: CHAIN_NAMES[chainId] || `Chain ${chainId}`,
      }));
      if (state.address) updateBalance(state.address);
    };

    eth.on('accountsChanged', handleAccountsChanged);
    eth.on('chainChanged', handleChainChanged);

    // Auto-reconnect only if user has auth cookie and wallet already linked
    fetch('/api/auth/me').then(async (res) => {
      if (!res.ok) return;
      const data = await res.json();
      if (!data.user?.walletAddress) return;

      eth.request({ method: 'eth_accounts' }).then(async (accounts: string[]) => {
        if (accounts.length > 0 && !state.isConnected) {
          // Only auto-reconnect if the connected account matches the linked wallet
          const linkedWallet = data.user.walletAddress.toLowerCase();
          const currentAccount = accounts[0].toLowerCase();
          if (linkedWallet !== currentAccount) return;

          try {
            const provider = new BrowserProvider(eth);
            const network = await provider.getNetwork();
            const chainId = Number(network.chainId);
            const balance = await provider.getBalance(accounts[0]);
            let wsrBal: string | null = null;
            if (WSR_CONTRACT) {
              try {
                const contract = new Contract(WSR_CONTRACT, WSR_ABI, provider);
                const bal = await contract.balanceOf(accounts[0]);
                wsrBal = formatUnits(bal, 18);
              } catch {}
            }
            setState({
              address: accounts[0],
              chainId,
              chainName: CHAIN_NAMES[chainId] || `Chain ${chainId}`,
              balance: formatEther(balance),
              wsrBalance: wsrBal,
              isConnecting: false,
              isConnected: true,
              error: null,
            });
          } catch {}
        }
      }).catch(() => {});
    }).catch(() => {});

    return () => {
      eth.removeListener('accountsChanged', handleAccountsChanged);
      eth.removeListener('chainChanged', handleChainChanged);
    };
  }, []);

  return (
    <WalletContext.Provider value={{ ...state, connect, disconnect, switchToPolygon, refreshWsrBalance }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
