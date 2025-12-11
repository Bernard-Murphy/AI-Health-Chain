import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

export const useWeb3 = () => {
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);

  useEffect(() => {
    // Check if MetaMask is installed
    if (typeof window.ethereum !== 'undefined') {
      // Check if already connected
      window.ethereum.request({ method: 'eth_accounts' })
        .then(accounts => {
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            setIsConnected(true);
            initializeProvider();
          }
        });

      // Listen for account changes
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
          initializeProvider();
        } else {
          setAccount(null);
          setIsConnected(false);
          setProvider(null);
          setSigner(null);
        }
      });

      // Listen for chain changes
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
  }, []);

  const initializeProvider = () => {
    if (window.ethereum) {
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(web3Provider);
      web3Provider.getSigner().then(s => setSigner(s));
    }
  };

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum === 'undefined') {
        alert('Please install MetaMask to use this application');
        return;
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
        initializeProvider();
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet. Please try again.');
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setIsConnected(false);
    setProvider(null);
    setSigner(null);
  };

  const signMessage = async (message) => {
    if (!signer) {
      throw new Error('Wallet not connected');
    }
    return await signer.signMessage(message);
  };

  return {
    account,
    isConnected,
    provider,
    signer,
    connectWallet,
    disconnectWallet,
    signMessage,
  };
};


