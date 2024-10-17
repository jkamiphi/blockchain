import {TronWeb} from "tronweb";
import dotenv from "dotenv";

dotenv.config();

const batchSize = 1000;
const startBlock = 1;
const endBlock = 10000;

const tronWeb = new TronWeb({
  fullHost: process.env.TRON_NODE_URL,
  headers: {"TRON-PRO-API-KEY": process.env.TRON_PRO_API_KEY},
});

async function getBlockRange(start: number, end: number) {
  let blocks = [];
  for (let i = start; i <= end; i++) {
    const block = await tronWeb.trx.getBlock(i);
    console.log(`(${i}): Block ${block.blockID} processed`);
    blocks.push(block);
  }
  return blocks;
}

async function processBatch(start: number, batchSize: number) {
  const end = start + batchSize - 1;
  return getBlockRange(start, end);
}

function createBatches(startBlock: number, endBlock: number, batchSize: number) {
  console.log(`Creating batches from ${startBlock} to ${endBlock} with a batch size of ${batchSize}`);
  const batches = [];
  for (let i = startBlock; i <= endBlock; i += batchSize) {
    batches.push(i);
  }
  return batches;
}

async function fetchBlockchainHistory(startBlock: number, endBlock: number, batchSize: number) {
  const batches = createBatches(startBlock, endBlock, batchSize);

  const promises = batches.map((batchStart) => processBatch(batchStart, batchSize));

  const results = await Promise.allSettled(promises);

  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      console.log(`Batch ${index + 1} processed successfully`, result.value);
    } else {
      console.error(`Batch ${index + 1} failed`, result.reason);
    }
  });
}

fetchBlockchainHistory(startBlock, endBlock, batchSize);
