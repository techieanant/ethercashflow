import art from 'ascii-art';
import { 
  getBlockData, 
  getBlockDataRange,
  getAllTransactionHashes,
  parseTransactionData,
  createPrompt
} from "./helpers.js";

const main = async (startBlock, endBlock) => {
  const parsedData = await parseTransactionData(startBlock, endBlock);
  const { 
    transactionData, 
    totalEtherTransferred, 
    totalContractsCreated,
    contractTransactionsPercentage,
    totalUncles,
    totalEventsFired,
    funcSignatures
  } = parsedData;
  const { uniqueSenders, uniqueReceivers } = transactionData;
  console.log('Unique senders: ', Object.keys(uniqueSenders).length);
  console.table(uniqueSenders);
  console.log('Unique Receivers: ', Object.keys(uniqueReceivers).length);
  console.table(uniqueReceivers);
  // console.table(funcSignatures);
  console.log("Total Ether Transferred =>", totalEtherTransferred);
  console.log("Total Contracts Created =>", totalContractsCreated);
  console.log(`Percentage of Contract Transactions => ${contractTransactionsPercentage}%`);
  console.log("Total Uncles =>", totalUncles);
  console.log("Total Events Fired =>", totalEventsFired);
};

const questionsPrompt = async () => {
  console.clear();
  console.log(await art.font("Ether Cash Flow", 'doom').completed());
  const questions = [
    {
      type: 'select',
      name: 'searchType',
      message: 'Select the type of search you want to perform:',
      choices: [
        { title: 'Number', description: 'Search back number of blocks from latest', value: 'number' },
        { title: 'Range', description: 'Search within the given block range', value: 'range' },
      ]
    },
    {
      type: 'number',
      name: 'searchStartValue',
      message: (prev, values) => {
        if (values.searchType === 'number') {
          return 'Enter the number of blocks you want to search back from latest';
        } else {
          return 'Enter the start block number';
        }
      }
    },
    {
      type: (prev, values) => values.searchType === 'range' ? 'number' : null,
      name: 'searchEndValue',
      message: 'Enter the end block number',
    }
  ];

  const responses = await createPrompt(questions);

  switch(responses.searchType) {
    case 'number':
      const latestBlock = await getBlockData();
      const startBlockNumber = latestBlock.number - responses.searchStartValue;
      const endBlockNumber = latestBlock.number;
      await main(startBlockNumber, endBlockNumber);
      break;
    case 'range':
      if(responses.searchStartValue > responses.searchEndValue) {
        console.log('Start block number cannot be greater than end block number');
        process.exit(1);
      }
      await main(responses.searchStartValue, responses.searchEndValue);
      break;
    default:
      console.log('Invalid search type');
      break;
  }
  console.log('Thank you for using Ether Cash Flow');
}

await questionsPrompt();




