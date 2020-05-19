import { ValidatorStats, DepositEvent, PendingValidator } from "../../common";
import * as db from "../db";
import { readKeymanagerAccounts } from "../services/keymanager";
import { ethdo, parseValidatorName } from "../ethdo";
import { computeExpectedBalance } from "../utils/depositEvent";
import { ethers } from "ethers";

export async function getValidators(): Promise<ValidatorStats[]> {
  const keymanagerAccounts = readKeymanagerAccounts();
  const accounts = await ethdo.accountList("validator");
  const accountsMap = new Map(accounts.map(a => [a.account, a]));

  const validators: ValidatorStats[] = [];

  for (const { account } of keymanagerAccounts) {
    const ethdoAccount = accountsMap.get(account);
    if (ethdoAccount) {
      const publicKey = ethdoAccount.publicKey;
      const depositEventsObj = db.deposits.depositEvents.get(publicKey);
      const depositEvents = Object.values(depositEventsObj?.events || {});
      const metrics = db.metrics.current.get(publicKey);
      const { balance, status } = metrics || {};

      validators.push({
        index: parseInt(parseValidatorName(ethdoAccount.name)) || 0,
        publicKey,
        depositEvents,
        status,
        balance: computeBalance({ balance, status }, depositEvents)
      });
    }
  }

  return validators;
}

export async function getPendingValidators(): Promise<PendingValidator[]> {
  // Pending accounts
  return db.accounts.pendingValidators.getAll();
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
