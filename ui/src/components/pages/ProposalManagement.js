import React, { useState, useEffect } from "react";
import governanceService from "../../services/governance.service";
import CreateProposal from "../governance/CreateProposal";

const ProposalManagement = () => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState("");
  const [formValues, setFormValues] = useState({
    proposalId: "",
    payableAmount: "0", // Changed from 'value' to 'payableAmount'
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      const activeProposalsCount =
        await governanceService.getActiveProposalsLength();

      if (activeProposalsCount.success && activeProposalsCount.count > 0) {
        const activeProposals = await governanceService.getActiveProposals();

        const detailedProposals = await Promise.all(
          activeProposals.map((proposalId) =>
            governanceService.getProposalDetails(proposalId)
          )
        );

        setProposals(detailedProposals);
      }
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch proposals:", error);
      setMessage({ type: "error", text: "Failed to fetch proposals" });
      setLoading(false);
    }
  };

  const openModal = async (type, proposal) => {
    setSelectedProposal(proposal);
    setModalType(type);
    setModalVisible(true);

    if (proposal) {
      // Set default form values
      let paymentAmount = "0";
      
      // If execute action, fetch the required payment amount
      if (type === "execute") {
        try {
          const paymentDetails = await governanceService.getProposalRequiredPayment(proposal.id);
          if (paymentDetails.success) {
            paymentAmount = paymentDetails.formattedAmount;
          }
        } catch (error) {
          console.error("Failed to fetch required payment amount:", error);
        }
      }
      
      setFormValues({
        proposalId: proposal.id,
        payableAmount: paymentAmount, // Set to fetched amount
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      let result;
      switch (modalType) {
        case "execute":
          result = await governanceService.executeProposal(
            formValues.proposalId,
            formValues.payableAmount
          );
          break;
        case "queue":
          result = await governanceService.queueProposal(formValues.proposalId);
          break;
        case "cancel":
          result = await governanceService.cancelProposal(
            formValues.proposalId
          );
          break;
        default:
          break;
      }

      if (result && result.success) {
        setMessage({
          type: "success",
          text: `Proposal ${modalType}d successfully!`,
        });
        setModalVisible(false);
        fetchProposals(); // Refresh the list
      } else {
        setMessage({
          type: "error",
          text: `Failed to ${modalType} proposal: ${
            result?.error || "Unknown error"
          }`,
        });
      }
    } catch (error) {
      console.error(`Error when ${modalType}ing proposal:`, error);
      setMessage({ type: "error", text: `Failed to ${modalType} proposal` });
    } finally {
      setLoading(false);
    }
  };

  const getStateColor = (state) => {
    switch (state) {
      case "Active":
        return "text-blue-600";
      case "Succeeded":
        return "text-green-600";
      case "Defeated":
        return "text-red-600";
      case "Queued":
        return "text-orange-500";
      case "Executed":
        return "text-purple-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Proposal Management</h2>

      <div className="flex justify-between items-center mb-6">
        <div className="space-x-2">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            {showCreateForm ? "Cancel" : "Create Proposal"}
          </button>
        </div>
      </div>

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

      {message.text && (
        <div
          className={`p-4 mb-4 rounded ${
            message.type === "error"
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mb-4"
          onClick={fetchProposals}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh Proposals"}
        </button>

        {loading ? (
          <div className="text-center py-8">Loading proposals...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    State
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {proposals.length > 0 ? (
                  proposals.map((proposal) => (
                    <tr key={proposal.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <a
                          href="#"
                          className="text-blue-600 hover:text-blue-900"
                        >
                          {proposal.id.substring(0, 10)}...
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {proposal.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`${getStateColor(proposal.stateLabel)}`}
                        >
                          {proposal.stateLabel}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {proposal.stateLabel === "Succeeded" && (
                          <button
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 mr-2"
                            onClick={() => openModal("queue", proposal)}
                          >
                            Queue
                          </button>
                        )}
                        {proposal.stateLabel === "Queued" && (
                          <button
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 mr-2"
                            onClick={() => openModal("execute", proposal)}
                          >
                            Execute
                          </button>
                        )}
                        {(proposal.stateLabel === "Pending" ||
                          proposal.stateLabel === "Active") && (
                          <button
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                            onClick={() => openModal("cancel", proposal)}
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center">
                      No active proposals found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium mb-4">
              {modalType.charAt(0).toUpperCase() + modalType.slice(1)} Proposal
            </h3>
            <form onSubmit={handleModalSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Proposal ID
                </label>
                <input
                  type="text"
                  name="proposalId"
                  value={formValues.proposalId}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                />
              </div>

              {modalType === "execute" && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Required Payment Amount (ETH)
                  </label>
                  <input
                    type="text"
                    name="payableAmount"
                    value={formValues.payableAmount}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    This amount is required by the proposal and cannot be modified.
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setModalVisible(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {loading ? "Processing..." : "Confirm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProposalManagement;
