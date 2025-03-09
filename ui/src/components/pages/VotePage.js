import React from "react";

const VotePage = () => {
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Vote on Proposals</h2>
      <div className="space-y-6">
        {[1, 2, 3].map((proposal) => (
          <div key={proposal} className="border rounded-lg p-4">
            <h3 className="font-semibold">Proposal #{proposal}</h3>
            <p className="text-gray-600 mt-2">Sample proposal description...</p>
            <div className="mt-4 flex space-x-2">
              <button className="bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200">
                For ✅
              </button>
              <button className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200">
                Against ❌
              </button>
              <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">
                Abstain 🤷
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VotePage;
