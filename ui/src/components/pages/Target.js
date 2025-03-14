import React, { useState, useEffect } from "react";
import targetService from "../../services/target.service";
import ethersService from "../../services/ethers.service";

const Target = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentValue, setCurrentValue] = useState("0");
  const [newValue, setNewValue] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [owner, setOwner] = useState("");
  const [userAccount, setUserAccount] = useState("");
  const [updateHistory, setUpdateHistory] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Initialize target service
        if (!targetService.initialized) {
          await targetService.initialize();
        }

        // Get current value
        const valueResult = await targetService.getValue();
        if (valueResult.success) {
          setCurrentValue(valueResult.value);
        } else {
          setError("Failed to get current value");
        }

        // Get owner
        const ownerResult = await targetService.getOwner();
        if (ownerResult.success) {
          setOwner(ownerResult.owner);
        }

        // Get user account
        const account = await ethersService.getAccount();
        setUserAccount(account);

        // Mock update history - in a real app, you would fetch this from events
        setUpdateHistory([
          {
            id: "1",
            oldValue: "0",
            newValue: "42",
            updater: "0x1234...5678",
            timestamp: "2023-07-15 14:30"
          },
          {
            id: "2",
            oldValue: "42",
            newValue: "100",
            updater: "0x8765...4321",
            timestamp: "2023-07-10 09:15"
          }
        ]);

      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!newValue.trim()) {
      setError("Please enter a value");
      return;
    }
    
    try {
      setIsUpdating(true);
      
      const result = await targetService.updateValue(newValue);
      
      if (result.success) {
        // Refresh current value
        const valueResult = await targetService.getValue();
        if (valueResult.success) {
          setCurrentValue(valueResult.value);
        }
        setNewValue(""); // Clear input field
      } else {
        setError(result.error || "Failed to update value");
      }
    } catch (error) {
      console.error("Error updating value:", error);
      setError("Transaction failed");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">Loading target data...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Target Contract</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Current Value</h2>
        <div className="bg-blue-50 p-4 rounded mb-4">
          <p className="text-gray-700 mb-1">Stored Value</p>
          <p className="text-3xl font-bold">{currentValue}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded mb-4">
          <p className="text-sm text-gray-600">
            Contract Owner: <span className="font-mono">{owner}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-4">
          <h3 className="text-lg font-medium mb-2">Update Value</h3>
          <div className="flex items-center">
            <input
              type="number"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="Enter new value"
              className="border rounded py-2 px-3 mr-2 flex-grow"
            />
            <button
              type="submit"
              disabled={isUpdating}
              className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-blue-300"
            >
              {isUpdating ? "Updating..." : "Update"}
            </button>
          </div>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Update History</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="py-2 px-4 text-left">Old Value</th>
                <th className="py-2 px-4 text-left">New Value</th>
                <th className="py-2 px-4 text-left">Updater</th>
                <th className="py-2 px-4 text-left">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {updateHistory.map((update) => (
                <tr key={update.id} className="border-b">
                  <td className="py-3 px-4">{update.oldValue}</td>
                  <td className="py-3 px-4">{update.newValue}</td>
                  <td className="py-3 px-4 font-mono text-sm">
                    {update.updater}
                  </td>
                  <td className="py-3 px-4">{update.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Target;
