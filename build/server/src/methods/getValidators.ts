import memoizee from "memoizee";
import { ethers } from "ethers";
import * as db from "../db";
import { ValidatorStats, DepositEvent, BeaconProviderName } from "../../common";
import { computeExpectedBalance } from "../utils/depositEvent";
import { requestPastDepositEvents } from "../services/eth1";
import { getCurrentValidatorFileManager } from "../services/validatorFiles";
import { getBeaconNodeClient } from "../services/beaconNode";
import { logs } from "../logs";

async function getValidatorStatus(
  beaconNode: BeaconProviderName,
  pubkeys: string[]
) {
  const beaconNodeClient = getBeaconNodeClient(beaconNode);
  return await beaconNodeClient.validators(pubkeys);
}

const getValidatorStatusMem = memoizee(getValidatorStatus, {
  maxAge: 12 * 1000,
  promise: true,
  // Cache by contents of pubKeys not by the array containing it
  normalizer: ([beaconNode, pubkeys]) => beaconNode + pubkeys.sort().join("")
});

/**
 * Show validator stats.
 * Only show validators that have a confirmed deposit
 */
export async function getValidators(): Promise<ValidatorStats[]> {
  const validatorFileManager = getCurrentValidatorFileManager();
  const pubkeys = validatorFileManager.readPubkeys();
  // Keep fetching logs in the background only when UI is connected
  requestPastDepositEvents().catch(e => {
    logs.error(`Error requesting past deposit events`, e);
  });

  const beaconNode = db.server.beaconProvider.get();
  const statusByPubkey = await getValidatorStatusMem(
    beaconNode,
    pubkeys
  ).catch(e => logs.error(`Error fetching validators balances`, e));

  return pubkeys
    .map(
      (publicKey, index): ValidatorStats => {
        const depositEventsObj = db.deposits.depositEvents.get(publicKey);
        const depositEvents = Object.values(depositEventsObj?.events || {});
        const { status, balance } = (statusByPubkey || {})[publicKey] || {};

        return {
          index,
          publicKey,
          depositEvents,
          status,
          balance: computeBalance({ balance, status }, depositEvents)
        };
      }
    )
    .filter(({ depositEvents, status }) => depositEvents.length > 0 || status);
}

function computeBalance(
  {
    balance,
    status
  }: {
    balance?: number | null;
    status?: string;
  },
  depositEvents: DepositEvent[]
): { eth: number | null; isExpected: boolean } {
  if (
    !balance &&
    (!status || status.includes("UNKNOWN") || status === "DEPOSITED") &&
    depositEvents.length > 0
  ) {
    const expectedBalance = computeExpectedBalance(depositEvents);
    if (expectedBalance)
      return {
        eth: expectedBalance,
        isExpected: true
      };
  }

  return {
    eth:
      typeof balance === "number"
        ? // API returns the balance in 9 decimals
          parseFloat(ethers.utils.formatUnits(balance, 9)) || null
        : null,
    isExpected: false
  };
}
