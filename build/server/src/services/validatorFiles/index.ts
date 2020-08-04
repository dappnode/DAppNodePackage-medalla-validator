import * as db from "../../db";
import { ValidatorFileManager } from "./abstractManager";
import { ValidatorFiles, ValidatorClientName } from "../../../common";
import { LighthouseValidatorFileManager } from "./lighthouse";
import { PrysmValidatorFileManager } from "./prysm";
import {
  LIGHTHOUSE_KEYSTORES_DIR,
  LIGHTHOUSE_SECRETS_DIR,
  PRYSM_WALLET_DIR,
  PRYSM_SECRETS_DIR
} from "../../params";

// Create unique instances to make sure files are not being written more than once
const lighthouseFileManager = new LighthouseValidatorFileManager({
  keystoresDir: LIGHTHOUSE_KEYSTORES_DIR,
  secretsDir: LIGHTHOUSE_SECRETS_DIR
});

const prysmFileManager = new PrysmValidatorFileManager({
  walletDir: PRYSM_WALLET_DIR,
  secretsDir: PRYSM_SECRETS_DIR
});

export async function initializeValidatorDirectories() {
  lighthouseFileManager.init();
  prysmFileManager.init();
}

export async function writeValidatorFiles(
  validatorsFiles: ValidatorFiles[]
): Promise<void> {
  const validatorFileManager = getCurrentValidatorFileManager();
  await validatorFileManager.write(validatorsFiles);
}

/**
 * Check if current selected validator client has validator files
 * Use on startup to start its associated binary
 */
export function thereAreValidatorFiles(): boolean {
  const validatorFileManager = getCurrentValidatorFileManager();
  return validatorFileManager.hasKeys();
}

export function getCurrentValidatorFileManager(): ValidatorFileManager {
  const client = db.server.validatorClient.get();
  return getValidatorFileManager(client);
}

/**
 * Return a client specific validator file manager
 */
export function getValidatorFileManager(
  client: ValidatorClientName
): ValidatorFileManager {
  switch (client) {
    case "lighthouse":
      return lighthouseFileManager;

    case "prysm":
      return prysmFileManager;

    default:
      throw Error(`Unsupported client ${client}`);
  }
}
