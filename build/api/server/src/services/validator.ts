import fs from "fs";
import dargs from "dargs";
import { Supervisor } from "../utils/supervisor";
import { logs } from "../logs";
import {
  tlsCert,
  beaconRpcProvider,
  keymanagerFile,
  verbosity,
  logFile,
  extraOpts
} from "../params";

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

export const validator = Supervisor(
  "validator",
  dargs({
    "tls-cert": tlsCert,
    "beacon-rpc-provider": beaconRpcProvider,
    keymanager: "wallet",
    keymanageropts: keymanagerFile,
    verbosity: verbosity,
    "log-file": logFile,
    _: [extraOpts]
  })
);

export function addValidatorToKeymanager(validator: {
  account: string;
  passphrase: string;
}): void {
  const keymanager = readKeymanager();
  if (keymanager.accounts.includes(validator.account))
    throw Error(`Account ${validator.account} already exists in keymanager`);
  else logs.info(`Adding account ${validator.account} to keymanager`);
  keymanager.accounts.push(validator.account);
  keymanager.passphrases.push(validator.passphrase);
  writeKeymanager(keymanager);
}

function readKeymanager(): Keymanager {
  try {
    return JSON.parse(fs.readFileSync(keymanagerFile, "utf8"));
  } catch (e) {
    if (e.code === "ENOENT")
      return {
        accounts: [],
        passphrases: []
      };
    else throw e;
  }
}

function writeKeymanager(keymanager: Keymanager): void {
  fs.writeFileSync(keymanagerFile, JSON.stringify(keymanager, null, 2));
  validator.restart();
}
