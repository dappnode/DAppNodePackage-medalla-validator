import {
  ValidatorAccount,
  WithdrawlAccount,
  EthdoAccount,
  EthdoAccountNoPass
} from "../../common";
import { Ethdo } from "../ethdo";
import * as db from "../db";
import shell from "../utils/shell";

const ethdo = new Ethdo(shell);

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
  db.updateValidator(account);
}

export async function accountWithdrawlList(): Promise<WithdrawlAccount[]> {
  return await ethdo.accountWithdrawlList();
}

export async function accountValidatorList(): Promise<
  { name: string; id: string }[]
> {
  return await ethdo.accountValidatorList();
}
