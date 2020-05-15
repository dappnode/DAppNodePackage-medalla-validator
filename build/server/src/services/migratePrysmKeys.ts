import fs from "fs";
import * as db from "../db";
import { ethers } from "ethers";
import { ethdo, withdrawalAccount, withdrawalWallet } from "../ethdo";
import { addValidatorToKeymanager } from "./keymanager";
import { logs } from "../logs";
import {
  legacyValidatorPath,
  legacyWithdrawalPath,
  legacyPasswordPath,
  adminPassword
} from "../params";

export async function migrateLegacyValidator(): Promise<void> {
  const keystorePath = legacyValidatorPath;
  try {
    if (!fs.existsSync(keystorePath)) return;
    const password = getPassword();
    const wallet = "validator";

    const { privateKey, lastMod } = await readKeystore(keystorePath, password);
    const account = await ethdo.importAccount(privateKey, wallet);
    db.updateValidator({ ...account, createdTimestamp: lastMod });
    // Writes to keymanager and restart validator
    addValidatorToKeymanager(account);

    fs.unlinkSync(keystorePath);
    logs.info(`Migrated legacy keystore ${keystorePath} > ${account.account}`);
  } catch (e) {
    logs.error(`Error migrating legacy validator ${keystorePath}`, e);
  }
}

export function legacyWithdrawalExists(): boolean {
  return fs.existsSync(legacyWithdrawalPath);
}

export async function migrateLegacyWithdrawal(
  passphrase: string
): Promise<void> {
  const account = withdrawalAccount;
  const keystorePath = legacyWithdrawalPath;
  const password = getPassword();

  const { privateKey, lastMod } = await readKeystore(keystorePath, password);
  await ethdo.assertWalletExists(withdrawalWallet);
  await ethdo.accountImport({ account, passphrase, key: privateKey });
  db.updateWithdrawal({ account, passphrase, createdTimestamp: lastMod });

  fs.unlinkSync(keystorePath);
  logs.info(`Migrated legacy withdrawal keystore ${keystorePath}`);
}

/**
 * Fetch the password to decrypt the legacy keystores from a local filepath
 * Or use the env.PASSWORD as a backup
 */
function getPassword(): string {
  try {
    return fs.readFileSync(legacyPasswordPath, "utf8").trim();
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
    if (!adminPassword)
      throw Error(
        `Legacy password file ${legacyPasswordPath} not found. Set the ENV PASSWORD to migrate the legacy accounts`
      );
    logs.warn(
      `Legacy password file ${legacyPasswordPath} not found. Using ENV PASSWORD`
    );
    return adminPassword;
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
export async function readKeystore(keystorePath: string, password: string) {
  if (!password) throw Error(`No ENV PASSWORD provided`);
  const json = fs.readFileSync(keystorePath, "utf8");
  return {
    privateKey: await decryptPrysmKeystore(json, password),
    lastMod: fs.statSync(keystorePath).mtimeMs
  };
}
