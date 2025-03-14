import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import ethersService from "../services/ethers.service";

const Navigation = () => {
  const [account, setAccount] = useState("");
  const location = useLocation();

  useEffect(() => {
    const getAccount = async () => {
      try {
        if (!ethersService.initialized) {
          await ethersService.initialize();
        }
        const userAccount = await ethersService.getAccount();
        setAccount(userAccount);
      } catch (error) {
        console.error("Error getting account:", error);
      }
    };

    getAccount();
  }, []);

  // Format address for display
  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  return (
    <nav className="bg-white shadow-md p-4">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center mb-4 md:mb-0">
          <h1 className="text-2xl font-bold text-blue-600">DAO Governance</h1>
        </div>

        <div className="flex flex-col md:flex-row items-center md:space-x-4">
          <ul className="flex space-x-4 mb-4 md:mb-0">
            <li>
              <Link
                to="/"
                className={`px-3 py-2 rounded-md ${
                  location.pathname === "/"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                to="/vote"
                className={`px-3 py-2 rounded-md ${
                  location.pathname === "/vote"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Vote
              </Link>
            </li>
            <li>
              <Link
                to="/proposal-management"
                className={`px-3 py-2 rounded-md ${
                  location.pathname === "/proposal-management"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Proposal Management
              </Link>
            </li>
            <li>
              <Link
                to="/target"
                className={`px-3 py-2 rounded-md ${
                  location.pathname === "/target"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Target
              </Link>
            </li>
          </ul>

          <div className="bg-gray-100 py-1 px-3 rounded-full flex items-center">
            <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
            <span className="font-mono text-sm">{formatAddress(account)}</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
