import React, { useState } from "react";

const ProfileButton = ({ onConnect }) => {
  const [account, setAccount] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        setIsConnecting(true);
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setAccount(accounts[0]);
        if (onConnect) {
          onConnect(true);
        }
      } catch (error) {
        console.error("Error connecting wallet:", error);
      } finally {
        setIsConnecting(false);
      }
    } else {
      alert(
        "MetaMask is not installed. Please install MetaMask to use this feature."
      );
    }
  };

  return (
    <button
      onClick={connectWallet}
      disabled={isConnecting}
      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
    >
      {isConnecting
        ? "Connecting..."
        : account
        ? `Connected: ${account.substring(0, 6)}...${account.substring(
            account.length - 4
          )}`
        : "Connect Wallet"}
    </button>
  );
};

export default ProfileButton;
