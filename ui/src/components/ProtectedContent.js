import React from "react";
import { useMetaMask } from "../metamask";

/**
 * ProtectedContent component
 * Wraps content that requires a connected MetaMask wallet
 * Shows a connection prompt if wallet is not connected
 */
const ProtectedContent = ({ children }) => {
  const { connected, connecting, account, connect, isSDKInitialized, error } =
    useMetaMask();

  // Check if SDK is initialized
  if (!isSDKInitialized) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 text-center">
        <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
          Initializing MetaMask
        </h2>
        <p className="mt-4 text-lg text-gray-500">
          Please wait while we connect to MetaMask...
        </p>
        <div className="mt-8">
          <div className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-gray-500 bg-gray-100">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Loading...
          </div>
        </div>
      </div>
    );
  }

  // Check if wallet is connected
  if (!connected) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 text-center">
        <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
          Connect your wallet
        </h2>
        <p className="mt-4 text-lg text-gray-500">
          Please connect your MetaMask wallet to access this content.
        </p>
        <div className="mt-8">
          <button
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
            onClick={connect}
            disabled={connecting}
          >
            {connecting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Connecting...
              </>
            ) : (
              "Connect Wallet"
            )}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>
    );
  }

  // If wallet is connected, render the children components
  return (
    <>
      <div className="fixed bottom-0 right-0 bg-green-100 text-green-800 text-xs m-4 p-2 rounded z-50 opacity-75">
        Connected: {account?.substring(0, 6)}...{account?.substring(38)}
      </div>
      {children}
    </>
  );
};

export default ProtectedContent;
