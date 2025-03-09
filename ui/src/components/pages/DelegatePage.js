import React from "react";

const DelegatePage = () => {
  const handleDelegate = () => {
    // Handle delegation logic
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Delegate Voting Power</h2>
      <div className="space-y-4">
        <p className="text-gray-600">
          Before participating in governance, you need to delegate your voting
          power. You can delegate to yourself or another address.
        </p>
        <div className="space-y-4">
          <button
            onClick={handleDelegate}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Delegate to Myself
          </button>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">
              Or delegate to address:
            </label>
            <div className="mt-1 flex space-x-2">
              <input
                type="text"
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter address (0x...)"
              />
              <button className="bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200">
                Delegate
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DelegatePage;
