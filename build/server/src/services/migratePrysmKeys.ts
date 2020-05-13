import fs from "fs";
import * as db from "../db";
import { ethers } from "ethers";
import { ethdo, WalletType } from "../ethdo";
import { addValidatorToKeymanager } from "./validator";
import { logs } from "../logs";
import { legacyValidatorPath, legacyWithdrawalPath, password } from "../params";

export function migrateLegacyKeys(): void {
  migrateKeyIfExists(legacyValidatorPath, "validator", password);
  migrateKeyIfExists(legacyWithdrawalPath, "withdrawl", password);
}

async function migrateKeyIfExists(
  keystorePath: string,
  wallet: WalletType,
  password: string | undefined
): Promise<void> {
  try {
    if (!fs.existsSync(keystorePath)) return;
    if (!password) throw Error(`ENV PASSWORD not defined`);

    const { privateKey, lastMod } = await readKeystore(keystorePath, password);
    const account = await ethdo.importAccount(privateKey, wallet);
    switch (wallet) {
      case "validator":
        db.updateValidator({ ...account, createdTimestamp: lastMod });
        // Writes to keymanager and restart validator
        addValidatorToKeymanager(account);

      case "withdrawl":
        db.updateWithdrawl({ ...account, createdTimestamp: lastMod });
    }

    fs.unlinkSync(keystorePath);
    logs.info(
      `Migrated ${wallet} keystore ${keystorePath} > ${account.account}`
    );
  } catch (e) {
    logs.error(`Error migrating ${wallet} keystore ${keystorePath}`, e);
  }
}

/**
 * Keystores produced by the Prysm validator do not have a version property
 * which makes the ethers parser throw an error
 * @param jsonKeystore Stringified keystore JSON
 * @param password "password"
 */
export async function decryptPrysmKeystore(
  jsonKeystore: string,
  password: string
): Promise<string> {
  // Append version
  const keystore = JSON.parse(jsonKeystore);
  const jsonKeystoreWithVersion = JSON.stringify({ version: 3, ...keystore });
  const wallet = await ethers.Wallet.fromEncryptedJson(
    jsonKeystoreWithVersion,
    password
  );
  return wallet.privateKey;
}

/**
 * Read and decrypt keystore
 * @param keystorePath
 * @param password
 */
async function readKeystore(keystorePath: string, password: string) {
  if (!password) throw Error(`No ENV PASSWORD provided`);
  const json = fs.readFileSync(keystorePath, "utf8");
  return {
    privateKey: await decryptPrysmKeystore(json, password),
    lastMod: fs.statSync(keystorePath).mtimeMs
  };
}
