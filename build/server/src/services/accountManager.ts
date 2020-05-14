import {
  readAccountFromKeymanager,
  addValidatorToKeymanager
} from "./keymanager";
import { ethdo } from "../ethdo";
import * as db from "../db";
import { logs } from "../logs";

/**
 * Ensures that the set of keys in the accounts db and the keymanager is the same
 */
export async function consolidateKeymanagerAccounts() {
  try {
    const validators = db.accounts.validatorAccounts.get();
    const accounts = await ethdo.accountList("validator");

    // keymanager.json => accounts DB
    for (const account of accounts) {
      if (!validators[account.account])
        try {
          await recoverValidatorAccount(account.account);
          logs.info(`Recovered account ${account.account} from keymanager`);
        } catch (e) {
          logs.warn(
            `Error recovering account ${account.account} from keymanager`,
            e
          );
        }
    }

    // accounts DB => keymanager.json
    for (const account of Object.values(validators)) {
      if (!accounts.find(a => a.account === account.account))
        try {
          addValidatorToKeymanager(account);
          logs.info(`Recovered account ${account.account} to keymanager`);
        } catch (e) {
          logs.warn(
            `Error recovering account ${account.account} to keymanager`,
            e
          );
        }
    }
  } catch (e) {
    logs.error(`Error recovering accounts`, e);
  }
}

/**
 * Gets an account from the keymanager and stores it in the accounts db
 * @param account
 */
export async function recoverValidatorAccount(account: string) {
  const recoveredValidator = readAccountFromKeymanager(account);
  const publicKey = await ethdo.accountPublicKey(account);
  const validator = {
    ...recoveredValidator,
    publicKey,
    createdTimestamp: Date.now()
  };
  db.updateValidator(validator);
  return validator;
}
