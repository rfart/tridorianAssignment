import React, { useState, useEffect } from "react";
import DelegateVoting from "../governance/DelegateVoting";
import CreateProposal from "../governance/CreateProposal";
import ProposalCard from "../governance/ProposalCard";
import governanceService from "../../services/governance.service";

const Proposals = () => {
  const [proposals, setProposals] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showDelegateForm, setShowDelegateForm] = useState(false);
  const [fetchingProposals, setFetchingProposals] = useState(false);

  // Add initial data fetch on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setFetchingProposals(true);
        // In a real application, this would be replaced with a call to governanceService
        // For example: const fetchedProposals = await governanceService.getProposals();

        // Simulating network request with a delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const fetchedProposals = [
          {
            id: "123456789",
            title: "Increase Treasury Allocation",
            description: "Increase monthly allocation to treasury by 10%",
            targets: ["0x1234567890123456789012345678901234567890"],
            values: ["0"],
            calldatas: ["0x123456"],
            state: "Active",
            forVotes: "100000000000000000000", // 100 tokens
            againstVotes: "50000000000000000000", // 50 tokens
            abstainVotes: "10000000000000000000", // 10 tokens
          },
          {
            id: "987654321",
            title: "Update Protocol Parameters",
            description: "Change the protocol fee from 0.3% to 0.25%",
            targets: ["0x1234567890123456789012345678901234567890"],
            values: ["0"],
            calldatas: ["0x654321"],
            state: "Succeeded",
            forVotes: "200000000000000000000", // 200 tokens
            againstVotes: "30000000000000000000", // 30 tokens
            abstainVotes: "20000000000000000000", // 20 tokens
          },
          {
            id: "456789123",
            title: "Add New Supported Asset",
            description: "Add support for the XYZ token in the protocol",
            targets: ["0x1234567890123456789012345678901234567890"],
            values: ["0"],
            calldatas: ["0x789123"],
            state: "Queued",
            forVotes: "300000000000000000000", // 300 tokens
            againstVotes: "100000000000000000000", // 100 tokens
            abstainVotes: "50000000000000000000", // 50 tokens
          },
        ];

        setProposals(fetchedProposals);
        setError(null);
      } catch (err) {
        console.error("Error fetching initial proposals:", err);
        setError(
          "Failed to load proposals initially. Please try the refresh button."
        );
        // Keep the default empty array if fails
      } finally {
        setFetchingProposals(false);
      }
    };

    fetchInitialData();
  }, []);

  const fetchProposals = async () => {
    setFetchingProposals(true);
    try {
      // In a real application, this would be replaced with a call to governanceService
      // For example: const fetchedProposals = await governanceService.getProposals();

      // Simulating network request with a delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const fetchedProposals = [
        {
          id: "123456789",
          title: "Increase Treasury Allocation",
          description: "Increase monthly allocation to treasury by 10%",
          targets: ["0x1234567890123456789012345678901234567890"],
          values: ["0"],
          calldatas: ["0x123456"],
          state: "Active",
          forVotes: "100000000000000000000", // 100 tokens
          againstVotes: "50000000000000000000", // 50 tokens
          abstainVotes: "10000000000000000000", // 10 tokens
        },
        {
          id: "987654321",
          title: "Update Protocol Parameters",
          description: "Change the protocol fee from 0.3% to 0.25%",
          targets: ["0x1234567890123456789012345678901234567890"],
          values: ["0"],
          calldatas: ["0x654321"],
          state: "Succeeded",
          forVotes: "200000000000000000000", // 200 tokens
          againstVotes: "30000000000000000000", // 30 tokens
          abstainVotes: "20000000000000000000", // 20 tokens
        },
        {
          id: "456789123",
          title: "Add New Supported Asset",
          description: "Add support for the XYZ token in the protocol",
          targets: ["0x1234567890123456789012345678901234567890"],
          values: ["0"],
          calldatas: ["0x789123"],
          state: "Queued",
          forVotes: "300000000000000000000", // 300 tokens
          againstVotes: "100000000000000000000", // 100 tokens
          abstainVotes: "50000000000000000000", // 50 tokens
        },
      ];

      setProposals(fetchedProposals);
      setError(null);
    } catch (err) {
      console.error("Error fetching proposals:", err);
      setError("Failed to load proposals");
    } finally {
      setFetchingProposals(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Governance Proposals</h1>
        <div className="space-x-2">
          <button
            onClick={() => setShowDelegateForm(!showDelegateForm)}
            className="bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700"
          >
            {showDelegateForm ? "Hide Delegation" : "Delegate Voting Power"}
          </button>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            {showCreateForm ? "Cancel" : "Create Proposal"}
          </button>
        </div>
      </div>

      {showDelegateForm && (
        <div className="mb-6">
          <DelegateVoting />
        </div>
      )}

      {showCreateForm && (
        <div className="mb-6">
          <CreateProposal
            onProposalCreated={() => {
              setShowCreateForm(false);
              fetchProposals();
            }}
          />
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Proposal List</h2>
        <button
          onClick={fetchProposals}
          disabled={fetchingProposals}
          className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
        >
          {fetchingProposals ? "Loading..." : "Refresh Proposals"}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 p-4 rounded mb-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {fetchingProposals ? (
        <div className="text-center py-10">
          <p className="text-gray-500">Loading proposals...</p>
        </div>
      ) : proposals.length === 0 ? (
        <div className="bg-gray-50 p-10 text-center rounded">
          <p className="text-gray-500">
            No proposals found. Click "Refresh Proposals" to try again or create
            a new one.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {proposals.map((proposal) => (
            <ProposalCard
              key={proposal.id}
              proposal={proposal}
              refreshProposals={fetchProposals}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Proposals;
