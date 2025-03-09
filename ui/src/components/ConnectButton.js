import React from "react";
import { useMetaMask } from "../metamask";

function ConnectButton() {
  const { connect, connected, connecting, account, error, isSDKInitialized } =
    useMetaMask();

  const handleConnect = async () => {
    await connect();
  };

  if (!isSDKInitialized) {
    return <button disabled>Loading MetaMask...</button>;
  }

  if (connected) {
    return (
      <button disabled>
        Connected: {account.substring(0, 6)}...
        {account.substring(account.length - 4)}
      </button>
    );
  }

  return (
    <div>
      <button onClick={handleConnect} disabled={connecting}>
        {connecting ? "Connecting..." : "Connect MetaMask"}
      </button>
      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default ConnectButton;
