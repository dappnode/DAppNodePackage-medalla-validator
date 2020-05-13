import { ethers } from "ethers";
import retry from "async-retry";
import * as db from "../../db";
import {
  depositContractAddress,
  depositContractCreationBlock
} from "../../params";
import {
  DepositEventArgs,
  depositEventAbi,
  DepositEvent
} from "../../../common";
import { getGoerliProvider } from "./provider";
import { logs } from "../../logs";

export function listenToDepositEvents() {
  retry(getDeposits).catch(e => {
    logs.error(`Error getting past deposit events`, e);
  });
  subscribeToEvents();
}

/**
 * Fetch past deposit events
 */
async function getDeposits() {
  const depositInt = new ethers.utils.Interface([depositEventAbi]);
  const provider = getGoerliProvider();
  const depositLogs = await provider.getLogs({
    address: depositContractAddress, // or contractEnsName,
    fromBlock: getHighestSeenBlock() || depositContractCreationBlock,
    toBlock: "latest",
    topics: [depositInt.events[depositEventAbi.name].topic]
  });

  if (depositLogs.length > 0)
    logs.info(`Fetched ${depositLogs.length} deposit logs`);

  saveDepositEvents(
    depositLogs.map(log => {
      const parsedLog = depositInt.parseLog(log);
      const args: DepositEventArgs = parsedLog.values;
      return { ...log, args };
    })
  );
}

/**
 * Subcribe to deposit events, will not fetch past events
 */
function subscribeToEvents() {
  const provider = getGoerliProvider();
  const depositContract = new ethers.Contract(
    depositContractAddress,
    [depositEventAbi],
    provider
  );
  depositContract.on(depositEventAbi.name, (...args: any[]) => {
    try {
      const log: ethers.providers.Log & { args: DepositEventArgs } =
        args[args.length - 1];
      saveDepositEvents([log]);
    } catch (e) {
      logs.error(``);
    }
  });
}

/**
 * Index and store deposit events in the localDb
 */
function saveDepositEvents(
  depositLogs: (ethers.providers.Log & { args: DepositEventArgs })[]
) {
  const depositEvents: {
    [pubkey: string]: {
      [txHashLogIndex: string]: DepositEvent;
    };
  } = {};

  for (const log of depositLogs) {
    const pubkey = log.args.pubkey;
    const txHashLogIndex = `${log.transactionHash}/${log.transactionLogIndex}`;
    if (!depositEvents[pubkey]) depositEvents[pubkey] = {};
    depositEvents[pubkey][txHashLogIndex] = {
      blockNumber: log.blockNumber,
      txHash: log.transactionHash,
      // Pick values to prevent storing unnecessary data in the logs.args object
      pubkey: log.args.pubkey,
      withdrawal_credentials: log.args.withdrawal_credentials,
      amount: log.args.amount,
      signature: log.args.signature,
      index: log.args.index
    };
  }

  db.deposits.depositEvents.merge(depositEvents);
}

/**
 * Compute the highest blockNumber from the logs stored in the DB
 * To prevent fetching unnecessary data from Eth1 on startup
 */
function getHighestSeenBlock(): number {
  try {
    const depositEvents = db.deposits.depositEvents.get();
    let blockNumber: number = 0;
    for (const eventObj of Object.values(depositEvents || {}))
      for (const event of Object.values(eventObj || {}))
        if (event.blockNumber && event.blockNumber > blockNumber)
          blockNumber = event.blockNumber + 1; // Start fetching from the next block

    return blockNumber;
  } catch (e) {
    logs.error(`Error getting highest deposit event blockNumber`, e);
    return 0;
  }
}
