# Ether Cash Flow CLI

**Ether Cash Flow** is a CLI tool which allows the user to query data for given block numbers on the Ethereum Blockchain and generate meaningful reports based on this data. 

## Setup

Install NodeJS version 16.15.0 from https://nodejs.org/en/download/ or use [NVM](https://github.com/nvm-sh/nvm) (Node Version Manager) to manage different node versions.

### Environment Variables
Add your Infura API key to the variable `INFURA_API` in `.env` file at the root of this repo. 
The `ALTERNATE_RPC` in `.env` is set to a free RPC provider from MyEtherWallet so the tool will use it instead of Infura. 
To use Infura, remove the `ALTERNATE_RPC` variable from `.env` and add `INFURA_API` key.

### Install Dependencies
```
npm install
```
### Using the tool
Run `node index.js` at the root of project directory to run the CLI tool.
You could select to search back `x` number of blocks from latest block on the mainnet or you could select a block range to search between. 

![Ether Cash Flow Screenshot](https://i.ibb.co/2kPVk0d/image.png)

> **Note:** The RPC endpoint may be slow in fetching data for large block ranges and the tool may seem unresponsive but be assured that its still working in the background and would output the reports as soon as data fetching is complete. 

## Screen Recording
![Ether Cash Flow Screen Recording](https://s8.gifyu.com/images/ethcashflow.gif)

## Future Enhancements?

 - Decode function signatures in transaction input to provide human readable names
 - Decode event logs topic[0] to provide human readable event logs
 - Track event logs to show common transaction types i.e ERC20 or ERC721 transfers