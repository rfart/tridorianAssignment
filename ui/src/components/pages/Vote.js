import React, { useState, useEffect } from "react";
import SelectedProposalDetails from "../governance/SelectedProposalDetails";
import governanceService from "../../services/governance.service";
import DelegateVoting from "../governance/DelegateVoting";

const Vote = () => {
  const [activeProposalIds, setActiveProposalIds] = useState([]);
  const [proposalDetails, setProposalDetails] = useState({});
  const [selectedProposalId, setSelectedProposalId] = useState(null);
  const [error, setError] = useState(null);
  const [fetchingProposals, setFetchingProposals] = useState(false);
  const [fetchingDetails, setFetchingDetails] = useState(false);
  const [showDelegateForm, setShowDelegateForm] = useState(false);

  // Add initial data fetch on component mount
  useEffect(() => {
    fetchActiveProposals();
  }, []);

  const fetchActiveProposals = async () => {
    setFetchingProposals(true);
    try {
      // Fetch active proposals from the governance contract
      const ids = await governanceService.getActiveProposals();

      // Convert BigNumber array to string array if needed
      const activeProposalIds = ids.map((id) => id.toString());

      setActiveProposalIds(activeProposalIds);
      setError(null);
    } catch (err) {
      console.error("Error fetching active proposals:", err);
      setError(
        "Failed to load active proposals. Please check your connection to the blockchain."
      );
      setActiveProposalIds([]);
    } finally {
      setFetchingProposals(false);
    }
  };

  const fetchProposalDetails = async (proposalId) => {
    setFetchingDetails(true);
    setSelectedProposalId(proposalId);

    try {
      // Check if we already have the details cached
      if (proposalDetails[proposalId]) {
        setFetchingDetails(false);
        return;
      }

      // Fetch proposal details from the governance contract
      const details = await governanceService.getProposalDetails(proposalId);
      console.dir(details);

      // Update the proposal details cache with complete data
      setProposalDetails((prevDetails) => ({
        ...prevDetails,
        [proposalId]: details,
      }));
    } catch (err) {
      console.error(`Error fetching details for proposal ${proposalId}:`, err);
      setError(
        `Failed to load details for proposal ${proposalId}. Please check your connection to the blockchain.`
      );
    } finally {
      setFetchingDetails(false);
    }
  };

  const clearSelectedProposal = () => {
    setSelectedProposalId(null);
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
        </div>
      </div>

      {showDelegateForm && (
        <div className="mb-6">
          <DelegateVoting />
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Active Proposals</h2>
        <button
          onClick={fetchActiveProposals}
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
          <p className="text-gray-500">Loading active proposals...</p>
        </div>
      ) : activeProposalIds.length === 0 ? (
        <div className="bg-gray-50 p-10 text-center rounded">
          <p className="text-gray-500">
            No active proposals found. Click "Refresh Proposals" to try again.
          </p>
        </div>
      ) : (
        <div>
          {/* List of proposal IDs with Details button */}
          <div className="space-y-3 mb-8">
            {activeProposalIds.map((proposalId) => (
              <div
                key={proposalId}
                className="border p-4 rounded-md bg-gray-50 flex justify-between items-center"
              >
                <div>
                  <h3 className="text-lg font-medium">
                    Proposal ID: {proposalId}
                  </h3>
                </div>
                <button
                  onClick={() => fetchProposalDetails(proposalId)}
                  className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>

          {/* Selected proposal details using new component */}
          {selectedProposalId && (
            <SelectedProposalDetails
              proposal={proposalDetails[selectedProposalId]}
              refreshProposals={fetchActiveProposals}
              onClose={clearSelectedProposal}
              isLoading={fetchingDetails}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Vote;