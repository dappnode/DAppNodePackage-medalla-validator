import { keyBy } from "lodash";
import { ValidatorStats, DepositEvent, PendingValidator } from "../../common";
import * as db from "../db";
import { readKeymanagerAccounts } from "../services/keymanager";
import { ethdo } from "../ethdo";
import { computeEstimatedBalance } from "../utils/depositEvent";

export async function getValidators(): Promise<ValidatorStats[]> {
  const keymanagerAccounts = readKeymanagerAccounts();
  const accounts = await ethdo.accountList("validator");
  const ethdoAccountByAccount = keyBy(accounts, a => a.account);
  const depositEventsByPubkey = db.deposits.depositEvents.get();
  const metricsByPubkey = db.metrics.current.get();

  return keymanagerAccounts.map(
    ({ account }): ValidatorStats => {
      const ethdoAccount = ethdoAccountByAccount[account];
      const publicKey = ethdoAccount.publicKey;
      const depositEvents = depositEventsByPubkey[publicKey] || {};
      const metrics = metricsByPubkey[publicKey] || {};

      return {
        name: ethdoAccount.name,
        publicKey,
        depositInfo: depositEvents,
        status: metrics.status,
        balance: computeBalance(metrics, Object.values(depositEvents))
      };
    }
  );
}

export async function getPendingValidators(): Promise<PendingValidator[]> {
  // Pending accounts
  const pendingValidators = db.accounts.pendingValidators.get();
  return Object.values(pendingValidators);

  // return pendingValidators
  //   .filter(
  //     validator =>
  //       filterByTtl(errorTtl, validator.errorTimestamp) &&
  //       filterByTtl(pendingTtl, validator.createdTimestamp)
  //   )
  //   .map(
  //     (validator): ValidatorStats => {
  //       return {m
  //         name: parseValidatorName(validator.account || ""),
  //         publicKey: validator.publicKey || "",
  //         depositInfo: validator.transactionHash
  //           ? {
  //               [validator.transactionHash]: {
  //                 transactionHash: validator.transactionHash,
  //                 blockNumber: validator.blockNumber
  //               }
  //             }
  //           : {},
  //         status: "DEPOSITING",
  //         balance: {
  //           eth: validator.amountEth || null,
  //           isEstimated: false
  //         }
  //       };
  //     }
  //   );
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
        ? parseFloat(balance) || null
        : null,
    isEstimated: false
  };
}
