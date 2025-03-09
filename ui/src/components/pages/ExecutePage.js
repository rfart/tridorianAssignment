import React from "react";

const ExecutePage = () => {
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Queue & Execute Proposals</h2>
      <div className="space-y-6">
        {[1, 2].map((proposal) => (
          <div key={proposal} className="border rounded-lg p-4">
            <h3 className="font-semibold">Proposal #{proposal}</h3>
            <p className="text-gray-600 mt-2">Waiting for timelock period...</p>
            <div className="mt-4">
              <div className="h-2 bg-gray-200 rounded-full">
                <div className="h-full w-1/3 bg-blue-600 rounded-full"></div>
              </div>
              <div className="mt-4 flex space-x-2">
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                  Queue
                </button>
                <button
                  className="bg-gray-400 text-white px-6 py-2 rounded-lg cursor-not-allowed"
                  disabled
                >
                  Execute (Available in 47h 59m)
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExecutePage;
