import fs from "fs";
import { logs } from "../logs";
import { keymanagerFile } from "../params";
import { validatorBinary } from "./validatorBinary";

interface KeymanagerAccount {
  account: string;
  passphrase: string;
}

/**
 * {
 *   "accounts": ["Validators/1", "Validators/2"],
 *   "passphrases": ["validator1secret", "validator2secret"]
 * }
 */
interface Keymanager {
  accounts: string[];
  passphrases: string[];
}

/**
 * Add validator ethdo account name and passhrase to the keymanager.json
 * Then, restarts or starts the validator
 * @param validator
 */
export function addValidatorToKeymanager(validator: {
  account: string;
  passphrase: string;
}): void {
  const keymanagerAccounts = readKeymanagerAccounts();
  if (keymanagerAccounts.some(a => a.account === validator.account))
    throw Error(`Account ${validator.account} already exists in keymanager`);
  else logs.info(`Adding account ${validator.account} to keymanager`);
  keymanagerAccounts.push({
    account: validator.account,
    passphrase: validator.passphrase
  });
  writeKeymanagerAccounts(keymanagerAccounts);
}

export function readAccountFromKeymanager(account: string): KeymanagerAccount {
  const keymanagerAccounts = readKeymanagerAccounts();
  const keymanagerAccount = keymanagerAccounts.find(a => a.account === account);
  if (!keymanagerAccount) throw Error(`Account ${account} not found`);
  if (typeof keymanagerAccount.passphrase === "undefined")
    throw Error(`No passphrase found for account ${account}`);
  return keymanagerAccount;
}

export function readKeymanagerAccounts(): KeymanagerAccount[] {
  try {
    const keymanager: Keymanager = JSON.parse(
      fs.readFileSync(keymanagerFile, "utf8")
    );
    return keymanager.accounts.map((account, i) => ({
      account,
      passphrase: keymanager.passphrases[i]
    }));
  } catch (e) {
    if (e.code === "ENOENT") return [];
    else throw e;
  }
}

function writeKeymanagerAccounts(
  keymanagerAccounts: KeymanagerAccount[]
): void {
  const keymanager: Keymanager = {
    accounts: keymanagerAccounts.map(a => a.account),
    passphrases: keymanagerAccounts.map(a => a.passphrase)
  };
  fs.writeFileSync(keymanagerFile, JSON.stringify(keymanager, null, 2));
  validatorBinary.restart();
}
