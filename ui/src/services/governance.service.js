import { ethers } from "ethers";
import ethersService from "./ethers.service";

class GovernanceService {
  async delegateVotingPower(delegatee = null) {
    try {
      if (!ethersService.initialized) await ethersService.initialize();

      // If no delegatee provided, delegate to self
      const delegateeAddress = delegatee || (await ethersService.getAccount());

      // Call delegate function on token contract
      const tx = await ethersService.tokenContract.delegate(delegateeAddress);
      await tx.wait();

      return {
        success: true,
        hash: tx.hash,
      };
    } catch (error) {
      console.error("Error delegating voting power:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async createProposal(targetContract, value, calldata, description) {
    try {
      if (!ethersService.initialized) await ethersService.initialize();

      // Create proposal using Governor contract
      const tx = await ethersService.governorContract.propose(
        [targetContract],
        [value || 0],
        [calldata],
        description
      );
      const receipt = await tx.wait();

      // Extract proposal ID from events
      const proposalId = this.extractProposalId(receipt);

      return {
        success: true,
        hash: tx.hash,
        proposalId,
      };
    } catch (error) {
      console.error("Error creating proposal:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async castVote(proposalId, support) {
    try {
      if (!ethersService.initialized) await ethersService.initialize();

      // Cast vote (0=Against, 1=For, 2=Abstain)
      const tx = await ethersService.governorContract.castVote(
        proposalId,
        support
      );
      await tx.wait();

      return {
        success: true,
        hash: tx.hash,
      };
    } catch (error) {
      console.error("Error casting vote:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async queueProposal(proposalId) {
    try {
      if (!ethersService.initialized) await ethersService.initialize();

      const tx = await ethersService.queueContract.queue(proposalId);
      await tx.wait();

      return {
        success: true,
        hash: tx.hash,
      };
    } catch (error) {
      console.error("Error queueing proposal:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async executeProposal(proposalId, payableAmount) {
    try {
      if (!ethersService.initialized) await ethersService.initialize();

      // Check proposal state first to give better error messages
      const stateResult = await this.getProposalState(proposalId);
      if (stateResult.state !== 5) { // 5 is "Queued" state
        return {
          success: false,
          error: `Proposal must be in Queued state to execute (current state: ${stateResult.stateLabel})`
        };
      }

      // Get the required payment amount to verify we're sending the correct value
      const paymentInfo = await this.getProposalRequiredPayment(proposalId);
      
      // Convert user-provided payableAmount to BigNumber for comparison
      const providedAmount = payableAmount ? 
        ethers.utils.parseEther(payableAmount) : 
        ethers.BigNumber.from(0);
        
      // Verify the provided amount matches the required amount
      if (!providedAmount.eq(paymentInfo.requiredAmount)) {
        return {
          success: false,
          error: `Incorrect payment amount. Required: ${paymentInfo.formattedAmount} ETH`,
        };
      }

      // Try to execute with both contracts just in case the implementation differs
      let tx;
      try {
        // First try with queueContract
        tx = await ethersService.queueContract.execute(proposalId, {
          value: providedAmount,
          gasLimit: 600000, // Increased gas limit
        });
      } catch (innerError) {
        console.log("Failed to execute with queueContract, trying governorContract instead:", innerError);
        
        // If that fails, try with governorContract
        // Note: Some governor implementations have execute on the governor contract itself
        const proposalData = await ethersService.governorContract.proposalDetails(proposalId);
        
        tx = await ethersService.governorContract.execute(
          proposalData.targets,
          proposalData.values,
          proposalData.calldatas,
          ethers.utils.id(proposalData.descriptionHash),
          {
            value: providedAmount,
            gasLimit: 600000, // Increased gas limit
          }
        );
      }
      
      await tx.wait();

      return {
        success: true,
        hash: tx.hash,
      };
    } catch (error) {
      console.error("Error executing proposal:", error);
      
      // Provide more specific error messages
      let errorMessage = error.message || "Unknown execution error";
      
      if (errorMessage.includes("CALL_EXCEPTION")) {
        errorMessage = "Transaction failed on the blockchain. This might be due to:";
        errorMessage += "\n- The proposal is not ready for execution yet";
        errorMessage += "\n- The caller doesn't have permission to execute";
        errorMessage += "\n- The proposal execution itself is failing";
      } else if (errorMessage.includes("execution reverted")) {
        if (errorMessage.includes("TimelockController: operation is not ready")) {
          errorMessage = "Proposal execution timelock has not expired yet";
        } else if (errorMessage.includes("Governor: proposal not successful")) {
          errorMessage = "Proposal was not successful and cannot be executed";
        } else if (errorMessage.includes("not queued")) {
          errorMessage = "This proposal has not been queued for execution";
        }
      }
      
      return {
        success: false,
        error: errorMessage,
        originalError: error.message
      };
    }
  }

  async cancelProposal(proposalId) {
    try {
      if (!ethersService.initialized) await ethersService.initialize();

      const tx = await ethersService.governorContract.cancel(proposalId);
      await tx.wait();

      return {
        success: true,
        hash: tx.hash,
      };
    } catch (error) {
      console.error("Error cancelling proposal:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getProposalState(proposalId) {
    try {
      if (!ethersService.initialized) await ethersService.initialize();

      const state = await ethersService.governorContract.state(proposalId);
      // Convert numeric state to string representation
      const stateLabels = [
        "Pending",
        "Active",
        "Canceled",
        "Defeated",
        "Succeeded",
        "Queued",
        "Expired",
        "Executed",
      ];

      return {
        success: true,
        state: Number(state),
        stateLabel: stateLabels[state] || "Unknown",
      };
    } catch (error) {
      console.error("Error getting proposal state:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getActiveProposals() {
    try {
      if (!ethersService.initialized) await ethersService.initialize();

      // Call the getActiveProposals function on the governor contract
      const activeProposals =
        await ethersService.governorContract.getActiveProposals();
      return activeProposals;
    } catch (error) {
      console.error("Error fetching active proposals:", error);
      throw error;
    }
  }

  async getActiveProposalsLength() {
    try {
      if (!ethersService.initialized) await ethersService.initialize();

      // Call the getActiveProposalsLength function on the governor contract
      const count =
        await ethersService.governorContract.activeProposalsLength();
      return {
        success: true,
        count: count.toNumber(),
      };
    } catch (error) {
      console.error("Error fetching active proposals length:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getProposalVotes(proposalId) {
    try {
      if (!ethersService.initialized) await ethersService.initialize();
      // Get proposal votes - handle potential errors for non-existent proposals
      let forVotes = "0";
      let againstVotes = "0";
      let abstainVotes = "0";
      try {
        const votes = await ethersService.governorContract.proposalVotes(
          proposalId
        );

        console.log("Proposal votes:", votes);

        // Ensure we're getting valid BigNumber values and convert to string
        againstVotes = votes[0] ? votes[0].toString() : "0";
        forVotes = votes[1] ? votes[1].toString() : "0";
        abstainVotes = votes[2] ? votes[2].toString() : "0";
      } catch (error) {
        console.warn(`Could not get votes for proposal ${proposalId}:`, error);
      }

      return {
        success: true,
        forVotes,
        againstVotes,
        abstainVotes,
      };
    } catch (error) {
      console.error("Error fetching proposal votes:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getProposalDetails(proposalId) {
    try {
      if (!ethersService.initialized) await ethersService.initialize();

      // Get proposal state
      const stateResult = await this.getProposalState(proposalId);

      console.log("Proposal state:", stateResult);

      // Get proposal votes - handle potential errors for non-existent proposals
      let forVotes;
      let againstVotes;
      let abstainVotes;
      try {
        const votes = await ethersService.governorContract.proposalVotes(
          proposalId
        );

        console.log("Proposal votes:", votes);

        // Ensure we're getting valid BigNumber values
        againstVotes = votes[0] ? votes[0].toNumber() : 0;
        forVotes = votes[1] ? votes[1].toNumber() : 0;
        abstainVotes = votes[2] ? votes[2].toNumber() : 0;
      } catch (error) {
        console.warn(`Could not get votes for proposal ${proposalId}:`, error);
      }

      // Get proposal snapshot and deadline - handle potential errors
      let snapshot = 0;
      let deadline = 0;
      try {
        const snapshotValue =
          await ethersService.governorContract.proposalSnapshot(proposalId);
        const deadlineValue =
          await ethersService.governorContract.proposalDeadline(proposalId);
        snapshot = snapshotValue ? snapshotValue.toNumber() : 0;
        deadline = deadlineValue ? deadlineValue.toNumber() : 0;
      } catch (error) {
        console.warn(
          `Could not get snapshot/deadline for proposal ${proposalId}:`,
          error
        );
      }

      // Ensure we're always passing valid data to avoid BigNumber errors
      // Get proposal details from storage
      let targets = [];
      let values = [];
      let calldatas = [];
      let descriptionHash = ethers.constants.HashZero;
      let proposer = ethers.constants.AddressZero;

      try {
        const proposalData =
          await ethersService.governorContract.proposalDetails(proposalId);
        targets = proposalData.targets;
        values = proposalData.values;
        calldatas = proposalData.calldatas;
        descriptionHash = proposalData.descriptionHash;

        proposer = await ethersService.governorContract.proposalProposer(
          proposalId
        );
      } catch (error) {
        console.warn(
          `Could not get proposal data for proposal ${proposalId}:`,
          error
        );
      }

      // Reconstruct a title from the proposal ID
      const title = `Proposal ${proposalId.toString().slice(0, 8)}...`;

      // Create safe string values for UI display
      return {
        id: proposalId.toString(),
        title,
        proposer,
        state: stateResult.state,
        stateLabel: stateResult.stateLabel,
        targets: targets || [],
        values: Array.isArray(values) ? values.map((v) => v.toString()) : [],
        calldatas: calldatas || [],
        descriptionHash: descriptionHash
          ? descriptionHash.toString()
          : ethers.constants.HashZero,
        forVotes,
        againstVotes,
        abstainVotes,
        snapshot,
        deadline,
        description:
          "Original proposal description not available (only hash is stored on-chain)",
      };
    } catch (error) {
      console.error(
        `Error fetching details for proposal ${proposalId}:`,
        error
      );
      // Return minimal safe data in case of error
      return {
        id: proposalId.toString(),
        title: `Proposal ${proposalId.toString().slice(0, 8)}...`,
        state: 0,
        stateLabel: "Unknown",
        targets: [],
        values: [],
        calldatas: [],
        descriptionHash: ethers.constants.HashZero,
        forVotes: "0",
        againstVotes: "0",
        abstainVotes: "0",
        snapshot: "0",
        deadline: "0",
        description: "Failed to retrieve proposal data",
      };
    }
  }

  // Helper function to hash description string
  hashProposalDescription(description) {
    return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(description));
  }

  // Extract proposal ID from transaction receipt
  extractProposalId(receipt) {
    // Implementation depends on your contract's event structure
    // This is a placeholder - adjust based on your Governor contract
    for (const log of receipt.logs) {
      try {
        const parsed = ethersService.governorContract.interface.parseLog(log);
        if (parsed.name === "ProposalCreated") {
          return parsed.args.proposalId;
        }
      } catch (e) {
        continue;
      }
    }
    return null;
  }

  async getVotingPower(account) {
    try {
      if (!ethersService.initialized) await ethersService.initialize();

      const votingPower = await ethersService.tokenContract.getVotes(account);
      return {
        success: true,
        votingPower: votingPower,
      };
    } catch (error) {
      console.error("Error fetching voting power:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getProposalRequiredPayment(proposalId) {
    try {
      if (!ethersService.initialized) await ethersService.initialize();
      
      // Get proposal details to access the values array
      const proposalData = await ethersService.governorContract.proposalDetails(proposalId);
      
      // Sum up all values in the proposal (in case there are multiple targets)
      let totalRequired = ethers.BigNumber.from(0);
      if (proposalData && proposalData.values && proposalData.values.length > 0) {
        for (const value of proposalData.values) {
          totalRequired = totalRequired.add(value);
        }
      }
      
      return {
        success: true,
        requiredAmount: totalRequired,
        formattedAmount: ethers.utils.formatEther(totalRequired)
      };
    } catch (error) {
      console.error("Error fetching proposal required payment:", error);
      return {
        success: false,
        error: error.message,
        requiredAmount: ethers.BigNumber.from(0),
        formattedAmount: "0"
      };
    }
  }

  async hasVotedOnProposal(proposalId, account = null) {
    try {
      if (!ethersService.initialized) await ethersService.initialize();
      
      // If no account provided, use the current connected account
      const voterAddress = account || await ethersService.getAccount();
      
      // Check if the account has already cast a vote on this proposal
      const hasVoted = await ethersService.governorContract.hasVoted(proposalId, voterAddress);
      
      return {
        success: true,
        hasVoted
      };
    } catch (error) {
      console.error("Error checking if account has voted:", error);
      return {
        success: false,
        error: error.message,
        hasVoted: false
      };
    }
  }
}

const governanceService = new GovernanceService();
export default governanceService;
