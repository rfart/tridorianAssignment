# Tridorian Governance System

This repository contains smart contracts for a governance system including:

- VotingToken: An ERC20 token with voting capabilities
- TridorianGovernor: A governance contract that allows token holders to create, vote, and execute proposals
- Target: A simple contract that can be controlled through governance proposals

## Foundry

**Foundry is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust.**

Foundry consists of:

- **Forge**: Ethereum testing framework (like Truffle, Hardhat and DappTools).
- **Cast**: Swiss army knife for interacting with EVM smart contracts, sending transactions and getting chain data.
- **Anvil**: Local Ethereum node, akin to Ganache, Hardhat Network.
- **Chisel**: Fast, utilitarian, and verbose solidity REPL.

## Documentation

https://book.getfoundry.sh/

## Usage

### Build

```shell
$ forge build
```

### Test

```shell
$ forge test
```

### Format

```shell
$ forge fmt
```

### Gas Snapshots

```shell
$ forge snapshot
```

### Anvil

```shell
$ anvil
```

### Deploy

```shell
$ forge script script/Counter.s.sol:CounterScript --rpc-url <your_rpc_url> --private-key <your_private_key>
```

### Cast

```shell
$ cast <subcommand>
```

### Help

```shell
$ forge --help
$ anvil --help
$ cast --help
```

## Deployment Instructions

### Prerequisites

1. Install Foundry (Forge, Cast, Anvil)
2. Create a `.env` file based on `.env.example`
3. Add your private key and RPC URL to the `.env` file

### Deploy VotingToken

```bash
source .env
forge script script/DeployVotingToken.s.sol:DeployVotingToken --rpc-url $RPC_URL --broadcast --verify -vvv
```

### Deploy TridorianGovernor

If you want to deploy both the VotingToken and TridorianGovernor together:

```bash
source .env
forge script script/DeployTridorianGovernor.s.sol:DeployTridorianGovernor --rpc-url $RPC_URL --broadcast --verify -vvv
```

If you want to use an existing VotingToken:

```bash
source .env
export VOTING_TOKEN_ADDRESS=0x...your token address...
forge script script/DeployTridorianGovernor.s.sol:DeployTridorianGovernor --rpc-url $RPC_URL --broadcast --verify -vvv
```

### Deploy Target Contract

The Target contract is a simple contract that can be controlled through governance proposals:

```bash
source .env
forge script script/DeployTarget.s.sol:DeployTarget --rpc-url $RPC_URL --broadcast --verify -vvv
```

After deployment, you can use this contract's address as the target for governance proposals to test the governance system.

### Verify Contracts Manually

If you need to verify contracts after deployment:

1. Set the environment variables in your `.env` file:

   - `VOTING_TOKEN_ADDRESS`
   - `TIMELOCK_ADDRESS`
   - `GOVERNOR_ADDRESS`

2. Run the verification script:

```bash
source .env
forge script script/VerifyContracts.s.sol:VerifyContracts --rpc-url $RPC_URL -vvv
```

## Governance Flow

1. Token holders can delegate their voting power using the `delegate` function on the VotingToken
2. Proposals can be created through the TridorianGovernor's `propose` function
3. After a voting delay, tokens holders can cast their votes (For, Against, Abstain)
4. After the voting period ends and if the proposal passes, it can be queued for execution
5. After the timelock delay, the proposal can be executed

## Active Proposals Tracking

TridorianGovernor includes functionality to track active proposals:

- View all active proposals with `getActiveProposals()`
- Check if a proposal is active with `isProposalActive(proposalId)`

## User Flow of TridorianGovernor

### Proposal Creation (Anyone with Sufficient Voting Power)

A user who holds governance tokens creates a proposal by specifying:
- The target contract(s)
- The function(s) to call
- The parameters of the function(s)
- The proposal is submitted to the Governor contract.
- A minimum number of tokens (Proposal Threshold) may be required to create a proposal.

### Proposal Queued & Voting Period Starts

Once the proposal is created, it enters a pending state.
After a certain delay, the voting period begins.
Token holders can vote For, Against, or Abstain based on their voting power.

### Voting Mechanisms

Votes are usually weighted based on the number of governance tokens a user holds.
The common voting systems include:
- Token-weighted voting: 1 token = 1 vote.
- Quadratic voting: Limits influence of large holders.
- Delegated voting: Users can delegate their votes to another address.

### Voting Ends & Proposal Status is Evaluated

After the voting period, the proposal outcome is determined.
If the required quorum is reached and more votes are "For" than "Against," the proposal is marked as Succeeded.
If it fails to meet quorum or gets more "Against" votes, it's marked as Defeated.

### Proposal Execution

If the proposal passes, it enters a timelock (optional, for security).
Once the delay ends, the proposal can be executed by anyone.
The Governor contract then calls the specified functions in the proposal.
