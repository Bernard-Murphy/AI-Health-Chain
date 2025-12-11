import React from 'react';
import './WalletConnection.css';
import AnimatedButton from './AnimatedButton';

const WalletConnection = ({ account, isConnected, onConnect, onDisconnect }) => {
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="wallet-connection">
      {isConnected ? (
        <div className="wallet-info">
          <div className="wallet-address">
            <span className="wallet-icon">🔗</span>
            <span className="address-text">{formatAddress(account)}</span>
          </div>
          <AnimatedButton className="disconnect-btn" onClick={onDisconnect}>
            Disconnect
          </AnimatedButton>
        </div>
      ) : (
        <AnimatedButton className="connect-btn" onClick={onConnect}>
          Connect MetaMask
        </AnimatedButton>
      )}
    </div>
  );
};

export default WalletConnection;


