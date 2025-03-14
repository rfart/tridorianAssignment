# User Flow Documentation

## Application Overview
This decentralized governance application allows users to participate in proposal creation, voting, and management through a web3-enabled interface. The application connects to the user's Ethereum wallet and provides tools for DAO governance.

## Initial Connection Flow
1. **Wallet Connection**
   - When users first access the application, they are presented with a ConnectPrompt
   - Users must connect their Ethereum wallet (e.g., MetaMask) to proceed
   - The application checks for existing connections on load and listens for account changes
   - Once connected, users gain access to the full application interface

2. **Navigation**
   - After successful connection, users can navigate between different sections using the Navigation component
   - The main sections include Dashboard, Vote, Proposal Management, and Target

## Core User Flows

### Dashboard Flow
1. User connects wallet and lands on the Dashboard page
2. Dashboard presents an overview of:
   - Governance token balance
   - Active proposals requiring attention
   - Recent governance activity
   - Key metrics about the DAO's status

### Proposal Management Flow
1. **Proposal Creation**
   - Users with sufficient voting power access the Proposal Management page
   - They specify:
     - Target contract(s) to interact with
     - Function(s) to call
     - Parameters for the function calls
     - Description and other metadata
   - The proposal is submitted to the Governor contract
   - A minimum threshold of governance tokens may be required to create proposals

2. **Proposal Lifecycle Management**
   - Users can track proposals through various states:
     - Pending (waiting for voting period)
     - Active (open for voting)
     - Succeeded/Defeated (after voting ends)
     - Queued (waiting for execution)
     - Executed (completed)
   - Proposal creators can cancel proposals under certain conditions

### Voting Flow
1. **Viewing Active Proposals**
   - Users navigate to the Vote page to see all proposals in the voting period
   - Each proposal displays:
     - Description and metadata
     - Current voting results
     - Time remaining in voting period
     - Execution functions

2. **Casting Votes**
   - Users select a proposal they wish to vote on
   - They choose to vote For, Against, or Abstain
   - The voting power is calculated based on their token holdings at the proposal creation block
   - Once submitted, the vote is recorded on-chain
   - **Important**: If users transfer tokens after voting, their voting power for that particular proposal remains unchanged as it was snapshotted at proposal creation

3. **Vote Delegation**
   - Users can optionally delegate their voting power to trusted addresses
   - Delegation allows another address to vote on their behalf

### Target Management Flow
1. Users access the Target page to manage contract interactions
2. They can:
   - View available target contracts
   - Explore callable functions
   - Set up templates for common proposal actions
   - Test function calls before creating proposals

## Security Considerations
- All transactions require wallet confirmation
- Proposals may include a timelock for security
- Voting power is snapshotted to prevent double-voting
- Users should verify contract addresses before interaction

## Key Components
1. **Wallet Integration**
   - Connects to Ethereum providers (MetaMask, WalletConnect, etc.)
   - Manages account state and network compatibility

2. **Governance Interface**
   - Interacts with on-chain Governor contracts
   - Handles proposal creation, voting, and execution
   - Displays governance state and history

3. **User Dashboard**
   - Provides overview of governance activities
   - Shows relevant actions based on user's role and token holdings
