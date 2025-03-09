import React, { useState } from "react";
import ethersService from "../services/ethers.service";

const ConnectPrompt = ({ onConnect }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState("");

  const handleConnect = async () => {
    setIsConnecting(true);
    setError("");

    try {
      const success = await ethersService.initialize();
      if (success) {
        onConnect(true);
      } else {
        setError("Failed to connect wallet. Please try again.");
      }
    } catch (error) {
      console.error("Connection error:", error);
      setError("Error connecting: " + error.message);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">
            DAO Governance
          </h1>
          <p className="text-gray-600">
            Connect your wallet to participate in governance
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 flex justify-center items-center"
        >
          {isConnecting ? (
            <span>Connecting...</span>
          ) : (
            <span>Connect MetaMask</span>
          )}
        </button>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>You need MetaMask to use this application.</p>
          <a
            href="https://metamask.io/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700"
          >
            Download MetaMask
          </a>
        </div>
      </div>
    </div>
  );
};

export default ConnectPrompt;
