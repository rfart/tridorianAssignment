import { ethers } from "ethers";
import ethersService from "./ethers.service";

class TargetService {
  constructor() {
    this.initialized = false;
  }

  async initialize() {
    if (!ethersService.initialized) {
      await ethersService.initialize();
    }
    this.initialized = true;
  }

  async getValue() {
    try {
      if (!this.initialized) {
        await this.initialize();
      }
      
      const value = await ethersService.targetContract.getValue();
      return {
        success: true,
        value: value.toString()
      };
    } catch (error) {
      console.error("Error getting value from Target contract:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async updateValue(newValue) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }
      
      const tx = await ethersService.targetContract.updateValue(newValue);
      await tx.wait();
      
      return {
        success: true,
        transactionHash: tx.hash
      };
    } catch (error) {
      console.error("Error updating value in Target contract:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getOwner() {
    try {
      if (!this.initialized) {
        await this.initialize();
      }
      
      const owner = await ethersService.targetContract.owner();
      return {
        success: true,
        owner
      };
    } catch (error) {
      console.error("Error getting owner from Target contract:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

const targetService = new TargetService();
export default targetService;
