import React, { useState } from "react";
import { ethers } from "ethers";
import governanceService from "../../services/governance.service";

const CreateProposal = () => {
  const [formData, setFormData] = useState({
    targetContract: "",
    value: "0",
    functionName: "",
    parameters: [],
    parameterTypes: [],
    description: "",
  });
  const [paramCount, setParamCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleParamChange = (index, field, value) => {
    const updatedArray = [...formData[field]];
    updatedArray[index] = value;

    setFormData({
      ...formData,
      [field]: updatedArray,
    });
  };

  const addParameter = () => {
    setFormData({
      ...formData,
      parameters: [...formData.parameters, ""],
      parameterTypes: [...formData.parameterTypes, "uint256"],
    });
    setParamCount(paramCount + 1);
  };

  const removeParameter = (index) => {
    const updatedParams = [...formData.parameters];
    const updatedTypes = [...formData.parameterTypes];

    updatedParams.splice(index, 1);
    updatedTypes.splice(index, 1);

    setFormData({
      ...formData,
      parameters: updatedParams,
      parameterTypes: updatedTypes,
    });
    setParamCount(paramCount - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Encode function call
      const iface = new ethers.utils.Interface([
        `function ${formData.functionName}(${formData.parameterTypes.join(
          ","
        )}) external`,
      ]);

      const calldata = iface.encodeFunctionData(
        formData.functionName,
        formData.parameters
      );

      // Create proposal
      const response = await governanceService.createProposal(
        formData.targetContract,
        ethers.utils.parseEther(formData.value || "0"),
        calldata,
        formData.description
      );

      setResult({
        success: response.success,
        message: response.success
          ? `Proposal created successfully! Proposal ID: ${response.proposalId}`
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
      <h2 className="text-2xl font-bold mb-4">Create Governance Proposal</h2>
      <p className="mb-4">
        Create a new proposal for the DAO to vote on. You need to have enough
        tokens to meet the proposal threshold.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Target Contract:</label>
          <input
            type="text"
            name="targetContract"
            value={formData.targetContract}
            onChange={handleInputChange}
            placeholder="0x..."
            className="w-full border rounded p-2"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">
            ETH Value (optional):
          </label>
          <input
            type="text"
            name="value"
            value={formData.value}
            onChange={handleInputChange}
            placeholder="0"
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Function Name:</label>
          <input
            type="text"
            name="functionName"
            value={formData.functionName}
            onChange={handleInputChange}
            placeholder="transfer"
            className="w-full border rounded p-2"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Function Parameters:</label>
          {formData.parameters.map((param, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <select
                value={formData.parameterTypes[index]}
                onChange={(e) =>
                  handleParamChange(index, "parameterTypes", e.target.value)
                }
                className="border rounded p-2"
              >
                <option value="uint256">uint256</option>
                <option value="string">string</option>
                <option value="bool">bool</option>
                <option value="address">address</option>
              </select>
              <input
                type="text"
                value={param}
                onChange={(e) =>
                  handleParamChange(index, "parameters", e.target.value)
                }
                className="flex-grow border rounded p-2"
                placeholder="Parameter value"
                required
              />
              <button
                type="button"
                onClick={() => removeParameter(index)}
                className="bg-red-500 text-white p-2 rounded"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addParameter}
            className="bg-gray-200 py-1 px-3 rounded"
          >
            + Add Parameter
          </button>
        </div>

        <div>
          <label className="block mb-1 font-medium">
            Proposal Description:
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="w-full border rounded p-2 min-h-[100px]"
            placeholder="Describe your proposal..."
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-blue-300"
        >
          {isLoading ? "Creating Proposal..." : "Submit Proposal"}
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

export default CreateProposal;
