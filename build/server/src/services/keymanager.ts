import fs from "fs";
import { logs } from "../logs";
import { keymanagerFile, ethdoKeymanagerFile } from "../params";
import { validatorBinary } from "./validatorBinary";

interface KeymanagerAccount {
  account: string;
  passphrase: string;
}

/**
 * {
 *   "validator/1": "validator1secret"
 * }
 */
interface EthdoKeymanager {
  [account: string]: string;
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

/**
 * Intermediate keymanager to store validator passphrases before they
 * are commited to the prysm keymanager
 */
export const ethdoKeymanager = {
  read(): EthdoKeymanager {
    try {
      return JSON.parse(fs.readFileSync(ethdoKeymanagerFile, "utf8"));
    } catch (e) {
      if (e.code === "ENOENT") return {};
      else throw e;
    }
  },
  write(data: EthdoKeymanager) {
    fs.writeFileSync(ethdoKeymanagerFile, JSON.stringify(data, null, 2));
  },
  get(account: string): string | undefined {
    return this.read()[account];
  },
  set(account: string, passhrase: string) {
    this.write({ ...this.read(), [account]: passhrase });
  }
};
