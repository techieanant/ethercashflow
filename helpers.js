import dotenv  from "dotenv";
import Web3 from "web3";
// import axios from "axios";
import prompts from "prompts";
dotenv.config()
const RPC_URL = process.env.ALTERNATE_RPC ? process.env.ALTERNATE_RPC : `https://mainnet.infura.io/v3/${process.env.INFURA_API}`
const web3 = new Web3(new Web3.providers.HttpProvider(RPC_URL))

/**
 * Models
 * uniqueSenders: {
 *  "0x0": {
 *    totalSent: 10,
 *    isContract: false
 *  },
 *  "0x1": {
 *    totalSent: 20,
 *    isContract: true
 *  }
 * }
 * 
 * funcSignaturesCount: {{
 *  text: "",
 *  hex: "",
 *  count: 0
 * }}
 * 
 */

let allTransactionHashes = [];
let appState = {
  transactionData: {
    uniqueSenders: {},
    uniqueReceivers: {},
  },
  totalEtherTransferred: 0,
  totalContractsCreated: 0,
  totalUncles: 0,
  totalEventsFired: 0,
  funcSignatures: {}
};

export const createPrompt = async (question) => {
  const response = await prompts(question);
  return response;
};

export const getBlockData = async (blockNum = 'latest') => {
  return web3.eth.getBlock(blockNum);
};

export const getNumbersBetween = (min, max) => Array.from({ length: max - min + 1 }, (_, i) => min + i);

export const getBlockDataRange = async (startBlockNumber, endBlockNumber) => {
  const blockNumbers = getNumbersBetween(startBlockNumber, endBlockNumber);
  const blockData = await Promise.all(blockNumbers.map(async (blockNumber) => {
    return getBlockData(blockNumber);
  }));
  return blockData;
};

export const isContractAddress = async (address) => {
  return await web3.eth.getCode(address) !== "0x";
};

export const getAllTransactionHashes = async (startBlockNumber, endBlockNumber) => {
  const blockData = await getBlockDataRange(startBlockNumber, endBlockNumber);
  const transactionHashes = blockData.map(block => {
    if(block.uncles.length > 0) {
      appState.totalUncles += block.uncles.length;
    }
    return block.transactions;
  });
  allTransactionHashes = [].concat.apply([], transactionHashes);
  return allTransactionHashes;
};

export const parseTransactionData = async (startBlockNumber, endBlockNumber) => {
  const transactionHashes = await getAllTransactionHashes(startBlockNumber, endBlockNumber);
  let totalEth = 0;
  const transactionData = await Promise.all(transactionHashes.map(async (transactionHash) => {
    const transaction = await web3.eth.getTransaction(transactionHash);
    const funcSignature = transaction.input && transaction.input.slice(0, 10);
    let funcName = "N/A";
    const transactionReceipt = await web3.eth.getTransactionReceipt(transactionHash);
    let { from, to, value } = transaction;
    to = to || '0x0000000000000000000000000000000000000000';
    const isContractTransaction = await isContractAddress(to);
    const valInEth = parseFloat(web3.utils.fromWei(value));
    totalEth += valInEth;
    if (appState.transactionData.uniqueSenders[from]) {
      appState.transactionData.uniqueSenders[from].totalSent += valInEth;
    }
    else {
      appState.transactionData.uniqueSenders[from] = {
        totalSent: valInEth,
        isContract: await isContractAddress(from)
      };
    }
    if (appState.transactionData.uniqueReceivers[to]) {
      appState.transactionData.uniqueReceivers[to].totalReceived += valInEth;
    }
    else {
      appState.transactionData.uniqueReceivers[to] = {
        totalReceived: valInEth,
        isContract: await isContractAddress(to)
      };
    }
    if(web3.utils.toBN(to).isZero()) {
      appState.totalContractsCreated++;
    }
    if(transactionReceipt && transactionReceipt.logs.length > 0) {
      appState.totalEventsFired += transactionReceipt.logs.length;
    }
    /**
     * Getting the function signature from the transaction input
     * and fetching the label from 4byte
     * 4byte throws 502 errors sometimes so not using it for now
     */
    // if(funcSignature.length === 10) {
    //   if(appState.funcSignatures[funcSignature]) {
    //     appState.funcSignatures[funcSignature].count++;
    //   }
    //   else {
    //     const URL = `https://www.4byte.directory/api/v1/signatures/?hex_signature=${funcSignature}`;
    //     try {
    //       const response = await axios.get(URL);
    //       if(response.data && response.data.results.length > 0) {
    //         funcName = response.data.results.sort((a, b) => a.id - b.id)[0].text_signature;
    //       }
    //     } catch(err) {
    //       console.error(err);
    //       process.exit();
    //     }
    //     appState.funcSignatures[funcSignature] = {
    //       text: funcName,
    //       hex: funcSignature,
    //       count: 1
    //     };  
    //   }
    // }
    const txData = {
      from,
      to,
      value,
      isContractTransaction,
      funcName,
    }
    // console.table(txData);
    return txData;
  }));

  const contractTransactions = transactionData.filter(transaction => transaction.isContractTransaction);
  const contractTransactionsPercentage = (contractTransactions.length / transactionData.length) * 100;
  appState.totalEtherTransferred = totalEth;
  appState.contractTransactionsPercentage = contractTransactionsPercentage.toFixed(2);
  return appState;
}
