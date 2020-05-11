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
import { getOpenMetrics } from "../services/openMetrics";
import { logs } from "../logs";

export async function accountCreate(name: string): Promise<void> {
  name;
}

export async function accountsGet(): Promise<ValidatorAccount[]> {
  return [];
}

export async function getDepositData({
  validatorAccount,
  withdrawlAccount
}: {
  validatorAccount: string;
  withdrawlAccount: string;
}): Promise<string> {
  const validators = db.accounts.validatorAccounts.get();
  if (!validators) throw Error(`No validators in DB`);
  const validator = validators[validatorAccount];
  if (!validator) throw Error(`Validator ${validatorAccount} not found`);

  const depositData = await ethdo.getDepositData(validator, withdrawlAccount);
  db.updateValidator({ ...validator, depositData });

  return depositData;
}

export async function accountWithdrawlCreate(accountReq: EthdoAccount) {
  const account = await ethdo.createWithdrawlAccount(accountReq);
}

export async function accountValidatorCreate(accountReq: EthdoAccountNoPass) {
  const account = await ethdo.createValidatorAccount(accountReq);
  db.updateValidator({
    ...account,
    createdTimestamp: Date.now()
  });
  // Writes to keymanager and restart validator
  addValidatorToKeymanager(account);
}

export async function accountWithdrawlList(): Promise<WalletAccount[]> {
  const accounts = await ethdo.accountWithdrawlList();

  // All withdrawl accounts are available and can be reused
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
  const accounts = await ethdo.accountValidatorList();

  // Fetch current known deposits
  const depositEventsByPubkey = db.deposits.depositEvents.get() || {};

  // Fetch openMetrics
  const metrics = await getOpenMetrics().catch(e => {
    logs.warn(`Error fetching open metrics`, e);
  });

  return accounts.map(account => {
    const pubKey = account.publicKey;
    const status = metrics ? metrics.validatorStatus[pubKey] || "" : "";
    const balance = metrics ? metrics.validatorBalance[pubKey] || 0 : 0;
    const validator = (validators || {})[account.id] || {};

    return {
      ...account,
      // Metadata
      createdTimestamp: validator.createdTimestamp,
      status,
      balance,
      // Deposit data
      depositEvents: depositEventsByPubkey[account.publicKey] || {}
    };
  });
}
