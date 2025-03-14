import React, { useEffect, useState } from "react";
import ProposalCard from "./ProposalCard";
import VoteOnProposal from "./VoteOnProposal";
import governanceService from "../../services/governance.service";
import { ethers } from "ethers";

const SelectedProposalDetails = ({
  proposal,
  refreshProposals,
  onClose,
  isLoading,
}) => {
  const [votes, setVotes] = useState({
    forVotes: "0",
    againstVotes: "0",
    abstainVotes: "0",
  });

  useEffect(() => {
    if (proposal) {
      governanceService.getProposalVotes(proposal.id).then((result) => {
        if (result.success) {
          // Parse the vote values as decimals using ethers.utils.formatUnits
          // Assuming the votes are returned in wei format (18 decimals)
          setVotes({
            forVotes: ethers.utils.formatUnits(result.forVotes, 18),
            againstVotes: ethers.utils.formatUnits(result.againstVotes, 18),
            abstainVotes: ethers.utils.formatUnits(result.abstainVotes, 18),
          });
        }
      });
    }
  }, [proposal]);

  if (isLoading) {
    return (
      <div className="text-center py-10 border rounded-md">
        <p className="text-gray-500">Loading proposal details...</p>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="bg-gray-50 p-6 text-center rounded-md">
        <p className="text-gray-500">
          Failed to load details for this proposal.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-xl font-bold">Proposal Details</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          Close Details
        </button>
      </div>

      <ProposalCard proposal={proposal} refreshProposals={refreshProposals} />

      {/* Add voting component for active proposals */}
      {proposal.state === 1 && (
        <div className="mt-4 mb-6">
          <VoteOnProposal
            proposalId={proposal.id}
            onVoteComplete={refreshProposals}
          />
        </div>
      )}

      {/* Additional details section to display all data */}
      <div className="mt-6 bg-gray-50 p-6 rounded-lg">
        <h4 className="text-lg font-medium mb-4">
          Complete Proposal Information
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded shadow-sm">
            <h5 className="font-medium text-gray-800">Basic Information</h5>
            <div className="mt-2 space-y-2">
              <p>
                <span className="text-gray-600">ID:</span>{" "}
                <span className="break-all font-mono text-sm">
                  {proposal.id}
                </span>
              </p>
              <p>
                <span className="text-gray-600">Title:</span> {proposal.title}
              </p>
              <p>
                <span className="text-gray-600">Proposer:</span>{" "}
                <span className="break-all font-mono text-sm">
                  {proposal.proposer || "Unknown"}
                </span>
              </p>
              <p>
                <span className="text-gray-600">Status:</span>{" "}
                <span
                  className={`px-2 py-1 rounded ${getStateColor(
                    proposal.state
                  )}`}
                >
                  {proposal.stateLabel}
                </span>
              </p>
              <p>
                <span className="text-gray-600">Snapshot:</span> Block #
                {proposal.snapshot}
              </p>
              <p>
                <span className="text-gray-600">Deadline:</span> Block #
                {proposal.deadline}
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded shadow-sm">
            <h5 className="font-medium text-gray-800">Voting Information</h5>
            <div className="mt-2 space-y-2">
              <p>
                <span className="text-gray-600">For Votes:</span>{" "}
                {votes.forVotes}
              </p>
              <p>
                <span className="text-gray-600">Against Votes:</span>{" "}
                {votes.againstVotes}
              </p>
              <p>
                <span className="text-gray-600">Abstain Votes:</span>{" "}
                {votes.abstainVotes}
              </p>
              {getVotingProgressBar(votes)}
            </div>
          </div>

          <div className="col-span-1 md:col-span-2 bg-white p-4 rounded shadow-sm">
            <h5 className="font-medium text-gray-800">Target Contracts</h5>
            <div className="mt-2">
              {proposal.targets && proposal.targets.length > 0 ? (
                <ul className="list-disc pl-5">
                  {proposal.targets.map((target, index) => (
                    <li key={index} className="mb-2">
                      <p>
                        <span className="font-mono text-sm">{target}</span>
                      </p>
                      <p className="text-sm text-gray-600">
                        Value:{" "}
                        {proposal.values ? proposal.values[index] || "0" : "0"}
                      </p>
                      <p className="text-sm text-gray-600">
                        Calldata size:{" "}
                        {proposal.calldatas
                          ? `${proposal.calldatas[index]?.length || 0} bytes`
                          : "0 bytes"}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No target contracts specified</p>
              )}
            </div>
          </div>

          <div className="col-span-1 md:col-span-2 bg-white p-4 rounded shadow-sm">
            <h5 className="font-medium text-gray-800">Technical Details</h5>
            <div className="mt-2 space-y-2">
              <p>
                <span className="text-gray-600">Description Hash:</span>{" "}
                <span className="font-mono text-xs break-all">
                  {proposal.descriptionHash}
                </span>
              </p>
              <p>
                <span className="text-gray-600">Description:</span>{" "}
                {proposal.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper functions
const getStateColor = (state) => {
  const colors = {
    0: "bg-yellow-100 text-yellow-800", // Pending
    1: "bg-blue-100 text-blue-800", // Active
    2: "bg-red-100 text-red-800", // Canceled
    3: "bg-red-100 text-red-800", // Defeated
    4: "bg-green-100 text-green-800", // Succeeded
    5: "bg-purple-100 text-purple-800", // Queued
    6: "bg-gray-100 text-gray-800", // Expired
    7: "bg-green-100 text-green-800", // Executed
  };
  return colors[state] || "bg-gray-100 text-gray-800";
};

const getVotingProgressBar = (votes) => {
  // Ensure proper conversion of vote values to numbers
  const forVotes = parseInt(votes.forVotes) || 0;
  const againstVotes = parseInt(votes.againstVotes) || 0;
  const abstainVotes = parseInt(votes.abstainVotes) || 0;

  const total = forVotes + againstVotes + abstainVotes;

  if (total === 0) return <p className="text-gray-500">No votes cast yet</p>;

  const forPercentage = Math.round((forVotes / total) * 100);
  const againstPercentage = Math.round((againstVotes / total) * 100);
  const abstainPercentage = 100 - forPercentage - againstPercentage;

  return (
    <div className="mt-2">
      <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full flex">
          <div
            className="bg-green-500"
            style={{ width: `${forPercentage}%` }}
            title={`For: ${forPercentage}%`}
          />
          <div
            className="bg-red-500"
            style={{ width: `${againstPercentage}%` }}
            title={`Against: ${againstPercentage}%`}
          />
          <div
            className="bg-gray-400"
            style={{ width: `${abstainPercentage}%` }}
            title={`Abstain: ${abstainPercentage}%`}
          />
        </div>
      </div>
      <div className="flex justify-between text-xs mt-1">
        <span className="text-green-600">For: {forPercentage}%</span>
        <span className="text-red-600">Against: {againstPercentage}%</span>
        <span className="text-gray-600">Abstain: {abstainPercentage}%</span>
      </div>
    </div>
  );
};

export default SelectedProposalDetails;
