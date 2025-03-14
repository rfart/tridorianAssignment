import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import ConnectPrompt from "./components/ConnectPrompt";
import Dashboard from "./components/pages/Dashboard";
import Vote from "./components/pages/Vote";
import Target from "./components/pages/Target";
import ProposalManagement from "./components/pages/ProposalManagement";
import Navigation from "./components/Navigation";
import "./App.css";

const App = () => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });
          setIsConnected(accounts.length > 0);
        } catch (error) {
          console.error("Error checking connection:", error);
        }
      }
    };

    checkConnection();

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        setIsConnected(accounts.length > 0);
      });
    }
  }, []);

  const updateConnectionStatus = (status) => {
    setIsConnected(status);
  };

  return (
    <Router>
      {isConnected ? (
        <div className="app-container">
          <Navigation />
          <main className="content-container p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/vote" element={<Vote />} />
              <Route
                path="/proposal-management"
                element={<ProposalManagement />}
              />
              <Route path="/target" element={<Target />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      ) : (
        <ConnectPrompt onConnect={updateConnectionStatus} />
      )}
    </Router>
  );
};

export default App;
