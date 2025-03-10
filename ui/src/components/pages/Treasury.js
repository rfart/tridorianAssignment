import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Treasury = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [treasuryData, setTreasuryData] = useState(null);

  useEffect(() => {
    const fetchTreasuryData = async () => {
      try {
        // This is mock data - in a real app you would fetch from your backend or blockchain
        const mockData = {
          balance: "3500.0",
          recentTransactions: [
            {
              id: "1",
              type: "Deposit",
              amount: "500.0 ETH",
              date: "2023-07-15",
              from: "0x1234...5678",
            },
            {
              id: "2",
              type: "Withdrawal",
              amount: "50.0 ETH",
              date: "2023-07-10",
              to: "0x8765...4321",
            },
            {
              id: "3",
              type: "Deposit",
              amount: "100.0 ETH",
              date: "2023-07-05",
              from: "0x2468...1357",
            },
          ],
        };

        setTreasuryData(mockData);
      } catch (error) {
        console.error("Error fetching treasury data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTreasuryData();
  }, []);

  if (isLoading) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">Loading treasury data...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Treasury</h1>
        <Link
          to="/proposals"
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Propose Treasury Action
        </Link>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Treasury Overview</h2>
        <div className="bg-blue-50 p-4 rounded mb-4">
          <p className="text-gray-700 mb-1">Total Balance</p>
          <p className="text-3xl font-bold">{treasuryData.balance} ETH</p>
        </div>

        <div className="bg-gray-50 p-4 rounded">
          <p className="text-sm text-gray-600">
            This treasury accepts ETH deposits from anyone. Withdrawals can only
            be executed through governance proposals approved by token holders.
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="py-2 px-4 text-left">Type</th>
                <th className="py-2 px-4 text-left">Amount</th>
                <th className="py-2 px-4 text-left">Date</th>
                <th className="py-2 px-4 text-left">From/To</th>
              </tr>
            </thead>
            <tbody>
              {treasuryData.recentTransactions.map((tx) => (
                <tr key={tx.id} className="border-b">
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        tx.type === "Deposit"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {tx.type}
                    </span>
                  </td>
                  <td className="py-3 px-4">{tx.amount}</td>
                  <td className="py-3 px-4">{tx.date}</td>
                  <td className="py-3 px-4 font-mono text-sm">
                    {tx.from || tx.to}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Treasury;
