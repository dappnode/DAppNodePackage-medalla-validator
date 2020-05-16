import { keyBy } from "lodash";
import { ValidatorStats, DepositEvent, PendingValidator } from "../../common";
import * as db from "../db";
import { readKeymanagerAccounts } from "../services/keymanager";
import { ethdo, parseValidatorName } from "../ethdo";
import { computeEstimatedBalance } from "../utils/depositEvent";
import { ethers } from "ethers";

export async function getValidators(): Promise<ValidatorStats[]> {
  const keymanagerAccounts = readKeymanagerAccounts();
  const accounts = await ethdo.accountList("validator");
  const ethdoAccountByAccount = keyBy(accounts, a => a.account);

  return keymanagerAccounts.map(
    ({ account }): ValidatorStats => {
      const ethdoAccount = ethdoAccountByAccount[account];
      const publicKey = ethdoAccount.publicKey;
      const depositEventsObj = db.deposits.depositEvents.get(publicKey);
      const depositEvents = Object.values(depositEventsObj?.events || {});
      const metrics = db.metrics.current.get(publicKey);
      const { balance, status } = metrics || {};

      return {
        index: parseInt(parseValidatorName(ethdoAccount.name)) || 0,
        publicKey,
        depositEvents,
        status,
        balance: computeBalance({ balance, status }, depositEvents)
      };
    }
  );
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
): { eth: number | null; isEstimated: boolean } {
  if (
    !balance &&
    (!status || status.includes("UNKNOWN") || status === "DEPOSITED") &&
    depositEvents.length > 0
  ) {
    const estimatedBalance = computeEstimatedBalance(depositEvents);
    if (estimatedBalance)
      return {
        eth: estimatedBalance,
        isEstimated: true
      };
  }

  return {
    eth:
      typeof balance === "string" || typeof balance === "number"
        ? // API returns the balance in 9 decimals
          parseFloat(ethers.utils.formatUnits(balance, 9)) || null
        : null,
    isEstimated: false
  };
}
