import { ethers } from "ethers";
import VotingToken from "./abi/VotingToken.sol/VotingToken.json";
import Governor from "./abi/TridorianGovernor.sol/TridorianGovernor.json";
import Target from "./abi/Target.sol/Target.json";

const tokenABI = VotingToken.abi;
const governorABI = Governor.abi;
const executeABI = [
  "function queue(uint256 proposalId) public",
  "function execute(uint256 proposalId) public"
]
const TargetABI = Target.abi;

// Use environment variables from React's process.env
// These should be prefixed with REACT_APP_ in a .env file
const GOVERNOR_ADDRESS = process.env.REACT_APP_GOVERNOR_ADDRESS;
const TOKEN_ADDRESS = process.env.REACT_APP_VOTING_TOKEN_ADDRESS;
const TARGET_ADDRESS = process.env.REACT_APP_TARGET_ADDRESS;

class EthersService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.governorContract = null;
    this.tokenContract = null;
    this.queueContract = null;
    this.targetContract = null;

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

        this.queueContract = new ethers.Contract(
          GOVERNOR_ADDRESS,
          executeABI,
          this.signer
        );

        this.targetContract = new ethers.Contract(
          TARGET_ADDRESS,
          TargetABI,
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

  async getTokenBalance(address = null, formatted = true) {
    if (!this.initialized) await this.initialize();

    try {
      // If no address provided, use the connected wallet address
      const targetAddress = address || (await this.signer.getAddress());

      // Call the balanceOf function on the token contract
      const balance = await this.tokenContract.balanceOf(targetAddress);

      // Return formatted or raw balance based on the parameter
      return formatted ? this.formatBigNumber(balance) : balance;
    } catch (error) {
      console.error("Error fetching token balance:", error);
      throw error;
    }
  }

  // Utility method to format BigNumber to string
  formatBigNumber(bigNumber, decimals = 18) {
    if (!bigNumber) return "0";
    try {
      // Format the BigNumber to a string with decimals
      return ethers.utils.formatUnits(bigNumber, decimals);
    } catch (error) {
      console.error("Error formatting BigNumber:", error);
      return "0";
    }
  }
}

const ethersService = new EthersService();
export default ethersService;
