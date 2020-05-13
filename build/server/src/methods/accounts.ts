import { isEmpty } from "lodash";
import { addValidatorToKeymanager } from "../services/validator";
import { ethdo } from "../ethdo";
import * as db from "../db";
import {
  ValidatorAccount,
  WalletAccount,
  EthdoAccount,
  EthdoAccountNoPass,
  ValidatorStats
} from "../../common";
import { ethers } from "ethers";
import { recoverValidatorAccount } from "../services/accountManager";

export async function accountCreate(name: string): Promise<void> {
  name;
}

export async function accountsGet(): Promise<ValidatorAccount[]> {
  return [];
}

export async function getDepositData({
  validatorAccount,
  withdrawalAccount
}: {
  validatorAccount: string;
  withdrawalAccount: string;
}): Promise<string> {
  const validators = db.accounts.validatorAccounts.get();
  let validator = validators[validatorAccount];
  // A validator may not be in the api's DB but in the keymanager.json, go fetch it
  if (!validator) validator = await recoverValidatorAccount(validatorAccount);
  if (!validator) throw Error(`Validator ${validatorAccount} not found`);

  const depositData = await ethdo.getDepositData(validator, withdrawalAccount);
  db.updateValidator({ ...validator, depositData });

  return depositData;
}

export async function accountWithdrawalCreate(accountReq: EthdoAccount) {
  const account = await ethdo.createAccount(accountReq, "withdrawal");
  db.updateWithdrawal({ ...account, createdTimestamp: Date.now() });
}

export async function accountValidatorCreate(accountReq: EthdoAccountNoPass) {
  const account = await ethdo.createAccount(accountReq, "validator");
  db.updateValidator({ ...account, createdTimestamp: Date.now() });
  // Writes to keymanager and restart validator
  addValidatorToKeymanager(account);
}

export async function accountWithdrawalList(): Promise<WalletAccount[]> {
  const accounts = await ethdo.accountList("withdrawal");

  // All withdrawal accounts are available and can be reused
  return accounts.map(account => ({
    ...account,
    available: true
  }));
}

export async function accountValidatorList(): Promise<WalletAccount[]> {
  const accounts = await listValidators();

  // Return only validators that are not used yet
  return accounts.map(account => ({
    ...account,
    available: isEmpty(account.depositEvents)
  }));
}

export async function validatorsStats(): Promise<ValidatorStats[]> {
  const accounts = await listValidators();

  return accounts;
}

async function listValidators(): Promise<ValidatorStats[]> {
  const validators = db.accounts.validatorAccounts.get();
  const accounts = await ethdo.accountList("validator");
  const depositEventsByPubkey = db.deposits.depositEvents.get() || {};
  const metricsByPubkey = db.metrics.current.get();

  return accounts.map(
    (account): ValidatorStats => {
      const pubKey = account.publicKey;
      const validator = (validators || {})[account.account] || {};

      const basicData = {
        ...account,
        createdTimestamp: validator.createdTimestamp,
        depositEvents: depositEventsByPubkey[account.publicKey] || {}
      };

      if (!metricsByPubkey || !metricsByPubkey[pubKey]) return basicData;
      const metrics = metricsByPubkey[pubKey];

      return {
        ...basicData,
        status: metrics.status,
        balance: formatDecimals(metrics.balance),
        effectiveBalance: formatDecimals(metrics.effectiveBalance)
      };
    }
  );
}

function formatDecimals(s?: string): string {
  return s ? ethers.utils.formatUnits(s, 9) : "";
}
