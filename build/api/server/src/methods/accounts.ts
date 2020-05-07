import { ValidatorAccount, WithdrawlAccount } from "../../common/types";
import { Ethdo } from "../ethdo";
import { db } from "../db";

const ethdo = new Ethdo(async () => "");

export async function accountCreate(name: string): Promise<void> {
  name;
}

export async function accountsGet(): Promise<ValidatorAccount[]> {
  return [];
}

export async function createWithdrawlAccount(
  passphrase: string
): Promise<void> {
  await ethdo.createWithdrawlAccount(passphrase);
}

export async function newValidator(): Promise<{
  depositData: string;
  account: string;
}> {
  const validator = await ethdo.newRandomValidatorAccount();
  const depositData = await ethdo.getDepositData(validator);

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

export async function accountWithdrawlCreate({
  name,
  passphrase
}: {
  name: string;
  passphrase: string;
}) {}

export async function accountWithdrawlList(): Promise<WithdrawlAccount[]> {
  return [];
}
