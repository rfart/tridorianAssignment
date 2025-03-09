import { ethers } from "ethers";

// ABI definitions - replace with your actual contract ABIs
const governorABI = [
  // Add your Governor contract ABI here
];

const tokenABI = [
  // Add your Token contract ABI here
];

// Contract addresses - replace with your deployed contract addresses
const GOVERNOR_ADDRESS = "0x...";
const TOKEN_ADDRESS = "0x...";

class EthersService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.governorContract = null;
    this.tokenContract = null;
    this.initialized = false;
  }

  async initialize() {
    if (window.ethereum) {
      try {
        // Request access to the user's accounts
        await window.ethereum.request({ method: "eth_requestAccounts" });

        // Create provider and signer
        this.provider = new ethers.providers.Web3Provider(window.ethereum);
        this.signer = this.provider.getSigner();

        // Initialize contracts
        this.governorContract = new ethers.Contract(
          GOVERNOR_ADDRESS,
          governorABI,
          this.signer
        );
        this.tokenContract = new ethers.Contract(
          TOKEN_ADDRESS,
          tokenABI,
          this.signer
        );

        this.initialized = true;
        return true;
      } catch (error) {
        console.error("Error initializing ethers service:", error);
        return false;
      }
    } else {
      console.error("Ethereum wallet not found");
      return false;
    }
  }

  async getAccount() {
    if (!this.initialized) await this.initialize();
    return this.signer.getAddress();
  }

  async getChainId() {
    if (!this.initialized) await this.initialize();
    const network = await this.provider.getNetwork();
    return network.chainId;
  }
}

const ethersService = new EthersService();
export default ethersService;
