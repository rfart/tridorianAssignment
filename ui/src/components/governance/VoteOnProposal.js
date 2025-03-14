import React, { useState, useEffect } from "react";
import governanceService from "../../services/governance.service";

const VoteOnProposal = ({ proposalId, onVoteComplete }) => {
  const [selectedVote, setSelectedVote] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    const checkVotingStatus = async () => {
      try {
        setCheckingStatus(true);
        const response = await governanceService.hasVotedOnProposal(proposalId);
        if (response.success) {
          setHasVoted(response.hasVoted);
        }
      } catch (error) {
        console.error("Failed to check voting status:", error);
      } finally {
        setCheckingStatus(false);
      }
    };

    if (proposalId) {
      checkVotingStatus();
    }
  }, [proposalId]);

  const handleVote = async (e) => {
    e.preventDefault();
    if (selectedVote === null) return;

    setIsLoading(true);
    try {
      const response = await governanceService.castVote(
        proposalId,
        selectedVote
      );
      setResult({
        success: response.success,
        message: response.success
          ? `Vote cast successfully! Tx: ${response.hash}`
          : `Error: ${response.error}`,
      });

      if (response.success && onVoteComplete) {
        onVoteComplete();
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

  if (checkingStatus) {
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <p className="text-gray-500">Checking voting status...</p>
      </div>
    );
  }

  if (hasVoted) {
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-3">You've Already Voted</h3>
        <p className="text-gray-700">You have already cast your vote on this proposal.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-3">Cast Your Vote</h3>
      <form onSubmit={handleVote}>
        <div className="space-y-2 mb-4">
          <div className="flex items-center">
            <input
              type="radio"
              id="vote-for"
              name="vote"
              value="1"
              checked={selectedVote === 1}
              onChange={() => setSelectedVote(1)}
              className="mr-2"
            />
            <label htmlFor="vote-for">For ✅</label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              id="vote-against"
              name="vote"
              value="0"
              checked={selectedVote === 0}
              onChange={() => setSelectedVote(0)}
              className="mr-2"
            />
            <label htmlFor="vote-against">Against ❌</label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              id="vote-abstain"
              name="vote"
              value="2"
              checked={selectedVote === 2}
              onChange={() => setSelectedVote(2)}
              className="mr-2"
            />
            <label htmlFor="vote-abstain">Abstain 🤷</label>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || selectedVote === null}
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-blue-300"
        >
          {isLoading ? "Voting..." : "Submit Vote"}
        </button>
      </form>

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

export default VoteOnProposal;
