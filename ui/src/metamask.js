import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext,
} from "react";

// Create context for MetaMask
export const MetaMaskContext = createContext({
  account: null,
  chainId: null,
  connecting: false,
  connected: false,
  connectMetaMask: () => {},
  disconnectMetaMask: () => {},
  error: null,
  isSDKInitialized: false,
});

// Custom hook to use the MetaMask context
export const useMetaMask = () => {
  const context = useContext(MetaMaskContext);
  if (context === undefined) {
    throw new Error("useMetaMask must be used within a MetaMaskProvider");
  }
  return {
    ...context,
    // Alias for backward compatibility with existing components
    connect: context.connectMetaMask,
    disconnect: context.disconnectMetaMask,
  };
};

export const MetaMaskProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const [isSDKInitialized, setIsSDKInitialized] = useState(false);

  // Check if MetaMask is installed
  const checkIfMetaMaskInstalled = () => {
    return window.ethereum !== undefined;
  };

  // Handle account changes
  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      // User disconnected their wallet
      setAccount(null);
      setConnected(false);
    } else {
      setAccount(accounts[0]);
      setConnected(true);
    }
  };

  // Handle chain changes
  const handleChainChanged = (newChainId) => {
    setChainId(parseInt(newChainId, 16));
  };

  // Connect to MetaMask
  const connectMetaMask = useCallback(async () => {
    if (!checkIfMetaMaskInstalled()) {
      setError("MetaMask is not installed! Please install MetaMask first.");
      return;
    }

    try {
      setConnecting(true);
      setError(null);

      // Request accounts access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      // Get the current chain ID
      const chainId = await window.ethereum.request({
        method: "eth_chainId",
      });

      handleAccountsChanged(accounts);
      handleChainChanged(chainId);
    } catch (error) {
      console.error("Error connecting to MetaMask:", error);
      setError(error.message || "Failed to connect to MetaMask");
    } finally {
      setConnecting(false);
    }
  }, []);

  // Disconnect from MetaMask
  const disconnectMetaMask = useCallback(() => {
    setAccount(null);
    setConnected(false);
  }, []);

  // Initialize and set up event listeners
  useEffect(() => {
    const initialize = async () => {
      if (checkIfMetaMaskInstalled()) {
        // Check if already connected
        try {
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });
          if (accounts.length > 0) {
            const chainId = await window.ethereum.request({
              method: "eth_chainId",
            });
            handleAccountsChanged(accounts);
            handleChainChanged(chainId);
          }
        } catch (error) {
          console.error("Error checking MetaMask connection:", error);
        } finally {
          setIsSDKInitialized(true);
        }

        // Listen for account changes
        window.ethereum.on("accountsChanged", handleAccountsChanged);

        // Listen for chain changes
        window.ethereum.on("chainChanged", handleChainChanged);
      } else {
        setIsSDKInitialized(true);
      }
    };

    initialize();

    // Clean up event listeners
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, []);

  return (
    <MetaMaskContext.Provider
      value={{
        account,
        chainId,
        connecting,
        connected,
        connectMetaMask,
        disconnectMetaMask,
        error,
        isSDKInitialized,
      }}
    >
      {children}
    </MetaMaskContext.Provider>
  );
};
