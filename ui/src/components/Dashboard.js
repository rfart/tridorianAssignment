import React from "react";
import { useMetaMask } from "../metamask";
import ConnectButton from "./ConnectButton";

function Dashboard() {
  const { connected, account, chainId } = useMetaMask();

  return (
    <div className="dashboard">
      <h1>Tridonan Governor App</h1>

      <ConnectButton />

      {connected && (
        <div className="account-info">
          <h2>Connected Account</h2>
          <p>Address: {account}</p>
          <p>Chain ID: {chainId}</p>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
