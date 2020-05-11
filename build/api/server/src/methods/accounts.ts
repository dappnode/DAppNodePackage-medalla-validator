import {
  ValidatorAccount,
  WithdrawlAccount,
  EthdoAccount,
  EthdoAccountNoPass
} from "../../common";
import { Ethdo } from "../ethdo";
import { db } from "../db";
import shell from "../utils/shell";

const ethdo = new Ethdo(shell);

export async function accountCreate(name: string): Promise<void> {
  name;
}

export async function accountsGet(): Promise<ValidatorAccount[]> {
  return [];
}

export async function newValidator(
  withdrawalAccount: string
): Promise<{
  depositData: string;
  account: string;
}> {
  const validator = await ethdo.newRandomValidatorAccount();
  const depositData = await ethdo.getDepositData(validator, withdrawalAccount);

  db.validatorAccounts.set({
    ...db.validatorAccounts.get(),
    [validator.account]: {
      account: validator.account,
      passphrase: validator.passphrase,
      depositData
    }
  });

  return {
    account: validator.account,
    depositData
  };
}

export async function accountWithdrawlCreate(accountReq: EthdoAccount) {
  const account = await ethdo.createWithdrawlAccount(accountReq);
}

export async function accountValidatorCreate(accountReq: EthdoAccountNoPass) {
  const account = await ethdo.createValidatorAccount(accountReq);
}

export async function accountWithdrawlList(): Promise<WithdrawlAccount[]> {
  return await ethdo.accountWithdrawlList();
}

export async function accountValidatorList(): Promise<
  { name: string; id: string }[]
> {
  return await ethdo.accountValidatorList();
}
