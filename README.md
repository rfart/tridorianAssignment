# Tridorian Governance System

This repository contains smart contracts for a governance system including:

- VotingToken: An ERC20 token with voting capabilities
- TridorianGovernor: A governance contract that allows token holders to create, vote, and execute proposals

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
