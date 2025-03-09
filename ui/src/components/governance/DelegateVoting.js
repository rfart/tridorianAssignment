import React, { useState } from "react";
import governanceService from "../../services/governance.service";

const DelegateVoting = () => {
  const [delegatee, setDelegatee] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleDelegateToSelf = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await governanceService.delegateVotingPower();
      setResult({
        success: response.success,
        message: response.success
          ? `Successfully delegated to yourself! Tx: ${response.hash}`
          : `Error: ${response.error}`,
      });
    } catch (error) {
      setResult({
        success: false,
        message: `Error: ${error.message}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelegateToAddress = async (e) => {
    e.preventDefault();
    if (!delegatee) return;

    setIsLoading(true);
    try {
      const response = await governanceService.delegateVotingPower(delegatee);
      setResult({
        success: response.success,
        message: response.success
          ? `Successfully delegated to ${delegatee}! Tx: ${response.hash}`
          : `Error: ${response.error}`,
      });
    } catch (error) {
      setResult({
        success: false,
        message: `Error: ${error.message}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Delegate Voting Power</h2>
      <p className="mb-4">
        Before you can vote on proposals, you must delegate your voting power.
        You can either delegate to yourself or to another address.
      </p>

      <div className="mb-6">
        <button
          onClick={handleDelegateToSelf}
          disabled={isLoading}
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-blue-300"
        >
          {isLoading ? "Processing..." : "Delegate to Myself"}
        </button>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">
          Or delegate to another address:
        </h3>
        <form onSubmit={handleDelegateToAddress} className="flex gap-2">
          <input
            type="text"
            value={delegatee}
            onChange={(e) => setDelegatee(e.target.value)}
            placeholder="Address (0x...)"
            className="border rounded p-2 flex-grow"
          />
          <button
            type="submit"
            disabled={isLoading || !delegatee}
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-blue-300"
          >
            {isLoading ? "Processing..." : "Delegate"}
          </button>
        </form>
      </div>

      {result && (
        <div
          className={`mt-4 p-3 rounded ${
            result.success ? "bg-green-100" : "bg-red-100"
          }`}
        >
          {result.message}
        </div>
      )}
    </div>
  );
};

export default DelegateVoting;
