import memoizee from "memoizee";
import { ethers } from "ethers";
import { ValidatorStats, DepositEvent } from "../../common";
import * as db from "../db";
import { computeExpectedBalance } from "../utils/depositEvent";
import { requestPastDepositEvents } from "../services/eth1";
import { getCurrentValidatorFileManager } from "../services/validatorFiles";
import {
  ethValidatorsBalances,
  ethValidatorStatuses
} from "../services/metrics";
import { logs } from "../logs";

const ethValidatorsBalancesMem = memoizee(ethValidatorsBalances, {
  maxAge: 12 * 1000,
  promise: true,
  // Cache by contents of pubKeys not by the array containing it
  normalizer: args => JSON.stringify(args[0])
});
const ethValidatorStatusesMem = memoizee(ethValidatorStatuses, {
  maxAge: 12 * 1000,
  promise: true,
  // Cache by contents of pubKeys not by the array containing it
  normalizer: args => JSON.stringify(args[0])
});

/**
 * Show validator stats.
 * Only show validators that have a confirmed deposit
 */
export async function getValidators(): Promise<ValidatorStats[]> {
  const validatorFileManager = getCurrentValidatorFileManager();
  const pubkeys = validatorFileManager.readPubkeys();
  // Keep fetching logs in the background only when UI is connected
  requestPastDepositEvents();

  const balancesByPubkey = await ethValidatorsBalancesMem(pubkeys).catch(e =>
    logs.error(`Error fetching validators balances`, e)
  );
  const statusByPubkey = await ethValidatorStatusesMem(pubkeys).catch(e =>
    logs.error(`Error fetching validators status`, e)
  );

  return pubkeys
    .map(
      (publicKey, index): ValidatorStats => {
        const depositEventsObj = db.deposits.depositEvents.get(publicKey);
        const depositEvents = Object.values(depositEventsObj?.events || {});
        const { balance } = (balancesByPubkey || {})[publicKey] || {};
        const { status } = (statusByPubkey || {})[publicKey] || {};

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
    balance?: string;
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
      typeof balance === "string" || typeof balance === "number"
        ? // API returns the balance in 9 decimals
          parseFloat(ethers.utils.formatUnits(balance, 9)) || null
        : null,
    isExpected: false
  };
}
