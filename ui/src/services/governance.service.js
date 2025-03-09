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

  async queueProposal(targetContract, value, calldata, descriptionHash) {
    try {
      if (!ethersService.initialized) await ethersService.initialize();

      const tx = await ethersService.governorContract.queue(
        [targetContract],
        [value || 0],
        [calldata],
        descriptionHash
      );
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

  async executeProposal(targetContract, value, calldata, descriptionHash) {
    try {
      if (!ethersService.initialized) await ethersService.initialize();

      const tx = await ethersService.governorContract.execute(
        [targetContract],
        [value || 0],
        [calldata],
        descriptionHash
      );
      await tx.wait();

      return {
        success: true,
        hash: tx.hash,
      };
    } catch (error) {
      console.error("Error executing proposal:", error);
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
}

const governanceService = new GovernanceService();
export default governanceService;
