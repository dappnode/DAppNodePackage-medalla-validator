import fs from "fs";
import { logs } from "../logs";
import { keymanagerFile, ethdoKeymanagerFile } from "../params";
import { validatorBinary } from "./validatorBinary";
import { EthdoAccount } from "../../common";

/**
 * Map account ("validator/1") to passphrase ("validator1secret")
 */
type KeymanagerMap = Map<string, string>;

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
export function addValidatorsToKeymanager(validators: EthdoAccount[]): void {
  if (validators.length === 0) return;

  const keymanagerMap = readkeymanagerMap();

  for (const { account, passphrase } of validators) {
    logs.info(`Adding account ${account} to keymanager`);
    keymanagerMap.set(account, passphrase);
  }

  writekeymanagerMap(keymanagerMap);
}

export function readkeymanagerMap(): KeymanagerMap {
  try {
    const keymanager: Keymanager = JSON.parse(
      fs.readFileSync(keymanagerFile, "utf8")
    );
    return new Map(
      keymanager.accounts.map((account, i) => [
        account,
        keymanager.passphrases[i]
      ])
    );
  } catch (e) {
    if (e.code === "ENOENT") return new Map<string, string>();
    else throw e;
  }
}

function writekeymanagerMap(keymanagerMap: KeymanagerMap): void {
  const keymanager: Keymanager = {
    accounts: Array.from(keymanagerMap.keys()),
    passphrases: Array.from(keymanagerMap.values())
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
