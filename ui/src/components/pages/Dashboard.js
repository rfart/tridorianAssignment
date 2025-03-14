import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ethersService from "../../services/ethers.service";
import governanceService from "../../services/governance.service";
import targetService from "../../services/target.service";

const Dashboard = () => {
  const [userAccount, setUserAccount] = useState("");
  const [tokenBalance, setTokenBalance] = useState("0");
  const [votingPower, setVotingPower] = useState("0");
  const [isLoading, setIsLoading] = useState(true);
  const [activeProposalCount, setActiveProposalCount] = useState(0);

  // Add loading states for individual data points
  const [loadingTokenBalance, setLoadingTokenBalance] = useState(false);
  const [loadingVotingPower, setLoadingVotingPower] = useState(false);
  const [loadingProposals, setLoadingProposals] = useState(false);
  const [targetValue, setTargetValue] = useState("0");
  const [loadingTargetValue, setLoadingTargetValue] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        if (!ethersService.initialized) {
          await ethersService.initialize();
        }

        const account = await ethersService.getAccount();
        setUserAccount(account);

        // Try to fetch all data initially
        try {
          setLoadingTokenBalance(true);
          const balance = await ethersService.getTokenBalance(account);
          setTokenBalance(balance || "0");
        } catch (error) {
          console.error("Error fetching initial token balance:", error);
          // Keep default "0" if fails
        } finally {
          setLoadingTokenBalance(false);
        }

        try {
          setLoadingVotingPower(true);
          const result = await governanceService.getVotingPower(account);
          if (result.success) {
            const decimals = await ethersService.tokenContract.decimals();
            setVotingPower((result.votingPower / Math.pow(10, decimals)).toFixed(2));
          } else {
            console.error("Error in getVotingPower:", result.error);
            setVotingPower("0.00");
          }
        } catch (error) {
          console.error("Error fetching initial voting power:", error);
          setVotingPower("0.00");
        } finally {
          setLoadingVotingPower(false);
        }

        try {
          setLoadingProposals(true);
          const result = await governanceService.getActiveProposalsLength();
          if (result.success) {
            setActiveProposalCount(result.count);
          } else {
            console.error("Error in getActiveProposalsLength:", result.error);
            setActiveProposalCount(0);
          }
        } catch (error) {
          console.error("Error fetching initial active proposals:", error);
          setActiveProposalCount(0);
        } finally {
          setLoadingProposals(false);
        }

        // Fetch target value
        try {
          setLoadingTargetValue(true);
          const result = await targetService.getValue();
          if (result.success) {
            setTargetValue(result.value);
          } else {
            console.error("Error in getValue:", result.error);
            setTargetValue("0");
          }
        } catch (error) {
          console.error("Error fetching target value:", error);
          setTargetValue("0");
        } finally {
          setLoadingTargetValue(false);
        }
      } catch (error) {
        console.error("Error fetching user account:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const fetchTokenBalance = async () => {
    try {
      setLoadingTokenBalance(true);
      // Replace with actual contract call to get token balance
      const balance = await ethersService.getTokenBalance(userAccount);
      setTokenBalance(balance || "0");
    } catch (error) {
      console.error("Error fetching token balance:", error);
      setTokenBalance("0");
    } finally {
      setLoadingTokenBalance(false);
    }
  };

  const fetchVotingPower = async () => {
    try {
      setLoadingVotingPower(true);
      const result = await governanceService.getVotingPower(userAccount);
      if (result.success) {
        const decimals = await ethersService.tokenContract.decimals();
        setVotingPower((result.votingPower / Math.pow(10, decimals)).toFixed(2));
      } else {
        console.error("Error in getVotingPower:", result.error);
        setVotingPower("0.00");
      }
    } catch (error) {
      console.error("Error fetching voting power:", error);
      setVotingPower("0.00");
    } finally {
      setLoadingVotingPower(false);
    }
  };

  const fetchActiveProposals = async () => {
    try {
      setLoadingProposals(true);
      const result = await governanceService.getActiveProposalsLength();
      if (result.success) {
        setActiveProposalCount(result.count);
      } else {
        console.error("Error in getActiveProposalsLength:", result.error);
        setActiveProposalCount(0);
      }
    } catch (error) {
      console.error("Error fetching active proposals:", error);
      setActiveProposalCount(0);
    } finally {
      setLoadingProposals(false);
    }
  };

  const fetchTargetValue = async () => {
    try {
      setLoadingTargetValue(true);
      const result = await targetService.getValue();
      if (result.success) {
        setTargetValue(result.value);
      } else {
        console.error("Error in getValue:", result.error);
        setTargetValue("0");
      }
    } catch (error) {
      console.error("Error fetching target value:", error);
      setTargetValue("0");
    } finally {
      setLoadingTargetValue(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">DAO Dashboard</h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Your Account</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-gray-500 text-sm">Connected Address</p>
            <p className="font-mono text-sm overflow-hidden overflow-ellipsis">
              {userAccount}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-gray-500 text-sm">Token Balance</p>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">{tokenBalance}</p>
              <button
                onClick={fetchTokenBalance}
                disabled={loadingTokenBalance}
                className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
              >
                {loadingTokenBalance ? "Loading..." : "Refresh"}
              </button>
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-gray-500 text-sm">Voting Power</p>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">{votingPower}</p>
              <button
                onClick={fetchVotingPower}
                disabled={loadingVotingPower}
                className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
              >
                {loadingVotingPower ? "Loading..." : "Refresh"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Governance</h2>
          <div className="mb-4">
            <p className="text-gray-500 mb-1">Active Proposals</p>
            <div className="flex items-center">
              <p className="text-2xl font-bold">{activeProposalCount}</p>
              <button
                onClick={fetchActiveProposals}
                disabled={loadingProposals}
                className="ml-4 bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
              >
                {loadingProposals ? "Loading..." : "Refresh"}
              </button>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <Link
              to="/proposals"
              className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              View Proposals
            </Link>
            <Link to="/proposals" className="text-blue-600 hover:text-blue-800">
              Delegate Voting Power →
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Target Contract</h2>
          <div className="mb-4">
            <p className="text-gray-500 mb-1">Current Value</p>
            <div className="flex items-center">
              <p className="text-2xl font-bold">{targetValue}</p>
              <button
                onClick={fetchTargetValue}
                disabled={loadingTargetValue}
                className="ml-4 bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
              >
                {loadingTargetValue ? "Loading..." : "Refresh"}
              </button>
            </div>
          </div>
          <Link
            to="/target"
            className="bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700"
          >
            View Target
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
