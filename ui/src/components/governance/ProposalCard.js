import React, { useState, useEffect } from "react";
import VoteOnProposal from "./VoteOnProposal";
import governanceService from "../../services/governance.service";

const ProposalCard = ({ proposal, refreshProposals }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showVoting, setShowVoting] = useState(false);

  useEffect(() => {
    // Reset UI state when proposal changes
    setResult(null);
    setShowVoting(false);
  }, [proposal.id]);

  const handleQueue = async () => {
    setIsLoading(true);
    try {
      const descriptionHash = governanceService.hashProposalDescription(
        proposal.description
      );

      const response = await governanceService.queueProposal(
        proposal.targets[0],
        proposal.values[0],
        proposal.calldatas[0],
        descriptionHash
      );

      setResult({
        success: response.success,
        message: response.success
          ? `Proposal queued successfully! Tx: ${response.hash}`
          : `Error: ${response.error}`,
      });

      if (response.success && refreshProposals) {
        refreshProposals();
      }
    } catch (error) {
      setResult({
        success: false,
        message: `Error: ${error.message}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecute = async () => {
    setIsLoading(true);
    try {
      const descriptionHash = governanceService.hashProposalDescription(
        proposal.description
      );

      const response = await governanceService.executeProposal(
        proposal.targets[0],
        proposal.values[0],
        proposal.calldatas[0],
        descriptionHash
      );

      setResult({
        success: response.success,
        message: response.success
          ? `Proposal executed successfully! Tx: ${response.hash}`
          : `Error: ${response.error}`,
      });

      if (response.success && refreshProposals) {
        refreshProposals();
      }
    } catch (error) {
      setResult({
        success: false,
        message: `Error: ${error.message}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStateColor = () => {
    switch (proposal.state) {
      case "Active":
        return "bg-blue-100 text-blue-800";
      case "Succeeded":
        return "bg-green-100 text-green-800";
      case "Defeated":
        return "bg-red-100 text-red-800";
      case "Queued":
        return "bg-yellow-100 text-yellow-800";
      case "Executed":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-semibold">
          {proposal.title || "Proposal"}
        </h3>
        <span className={`px-2 py-1 rounded text-sm ${getStateColor()}`}>
          {proposal.state}
        </span>
      </div>

      <p className="mb-3 text-gray-700">{proposal.description}</p>

      <div className="mb-4">
        <div className="font-semibold text-sm text-gray-500 mb-1">Target</div>
        <div className="font-mono text-sm">{proposal.targets[0]}</div>
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        {proposal.state === "Active" && (
          <button
            onClick={() => setShowVoting(!showVoting)}
            className="bg-blue-600 text-white py-1 px-3 rounded hover:bg-blue-700"
          >
            {showVoting ? "Hide Voting" : "Vote"}
          </button>
        )}

        {proposal.state === "Succeeded" && (
          <button
            onClick={handleQueue}
            disabled={isLoading}
            className="bg-yellow-500 text-white py-1 px-3 rounded hover:bg-yellow-600 disabled:bg-yellow-300"
          >
            {isLoading ? "Processing..." : "Queue Proposal"}
          </button>
        )}

        {proposal.state === "Queued" && (
          <button
            onClick={handleExecute}
            disabled={isLoading}
            className="bg-green-600 text-white py-1 px-3 rounded hover:bg-green-700 disabled:bg-green-300"
          >
            {isLoading ? "Processing..." : "Execute Proposal"}
          </button>
        )}
      </div>

      {showVoting && (
        <div className="mt-4">
          <VoteOnProposal
            proposalId={proposal.id}
            onVoteComplete={() => {
              setShowVoting(false);
              if (refreshProposals) refreshProposals();
            }}
          />
        </div>
      )}

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

export default ProposalCard;
