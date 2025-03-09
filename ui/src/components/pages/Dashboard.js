import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ethersService from "../../services/ethers.service";

const Dashboard = () => {
  const [userAccount, setUserAccount] = useState("");
  const [tokenBalance, setTokenBalance] = useState("0");
  const [votingPower, setVotingPower] = useState("0");
  const [isLoading, setIsLoading] = useState(true);
  const [activeProposalCount, setActiveProposalCount] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (!ethersService.initialized) {
          await ethersService.initialize();
        }

        const account = await ethersService.getAccount();
        setUserAccount(account);

        // These are placeholders - in a real app, you would get actual data from contracts
        setTokenBalance("1000.0");
        setVotingPower("1000.0");
        setActiveProposalCount(2);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
            <p className="text-2xl font-bold">{tokenBalance}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-gray-500 text-sm">Voting Power</p>
            <p className="text-2xl font-bold">{votingPower}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Governance</h2>
          <div className="mb-4">
            <p className="text-gray-500 mb-1">Active Proposals</p>
            <p className="text-2xl font-bold">{activeProposalCount}</p>
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
          <h2 className="text-xl font-semibold mb-4">Treasury</h2>
          <div className="mb-4">
            <p className="text-gray-500 mb-1">Treasury Balance</p>
            <p className="text-2xl font-bold">5,000 ETH</p>
          </div>
          <Link
            to="/treasury"
            className="bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700"
          >
            View Treasury
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
